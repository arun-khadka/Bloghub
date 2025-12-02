"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";


// Import components
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import StatsCards from "./components/StatsCards";
import EnhancedPagination from "./components/EnhancedPagination";
import ArticlesTable from "./components/ArticlesTable";
import SearchAndFilters from "./components/SearchAndFilters";
import AlertBanner from "./components/AlertBanner";
import ArticleFormModal from "./components/ArticleFormModal";

// Import hooks
import { useArticles } from "./hooks/useArticles";
import { useDeleteModal } from "./hooks/useDeleteModal";
import { useArticleForm } from "./hooks/useArticleForm";

export default function AdminArticlesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  // Use custom hooks
  const {
    articles,
    loading,
    stats,
    pagination,
    error,
    fetchArticles,
    filteredArticles,
    handleSortChange,
    handlePageChange,
    clearError,
  } = useArticles({ search, statusFilter, sortBy });

  const { user } = useAuth(); 

  const { deleteModal, openDeleteModal, closeDeleteModal, confirmDelete } =
    useDeleteModal({ fetchArticles, pagination });

  const {
    isFormOpen,
    editingArticle,
    formData,
    formError,
    isSubmitting, 
    categories,
    openEditForm,
    closeForm,
    handleFormChange,
    handleFormSubmit,
    fetchCategories,
  } = useArticleForm({
    fetchArticles,
    pagination: {
      current: pagination.current,
      total: pagination.total,
      per_page: pagination.per_page,
    },
  });

  // Fetch articles on initial load
  useEffect(() => {
    fetchArticles(1);
  }, []);

  // Fetch categories when form opens
  useEffect(() => {
    if (isFormOpen) {
      fetchCategories();
    }
  }, [isFormOpen, fetchCategories]);

  // Handle refresh
  const handleRefresh = () => {
    fetchArticles(pagination.current);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        articleTitle={deleteModal.articleTitle}
        isLoading={deleteModal.isLoading}
      />

      {/* Article Form Modal */}
      <ArticleFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        formData={formData}
        onFormChange={handleFormChange}
        editingArticle={editingArticle}
        error={formError}
        isLoading={isSubmitting}
        categories={categories}
        currentUser={{
          id: user?.id || "admin",
          fullname: user?.fullname || "Admin User",
          avatar: user?.avatar || "",
          is_author: user?.is_author || true,
        }}
      />

      {/* Header */}
      <PageHeader
        title="Content Management"
        description="Manage and organize your articles"
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardHeaderContent
            title="Articles"
            description="Manage your published articles and drafts"
            filters={
              <SearchAndFilters.FiltersSection
                sortBy={sortBy}
                statusFilter={statusFilter}
                loading={loading}
                onSortChange={(newSort) => {
                  setSortBy(newSort);
                  handleSortChange(newSort);
                }}
                onStatusFilterChange={setStatusFilter}
                onRefresh={handleRefresh}
              />
            }
          />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Bar */}
          <SearchAndFilters.SearchBar
            search={search}
            onSearchChange={setSearch}
            filteredCount={filteredArticles.length}
            totalCount={articles.length}
          />

          {/* Error Alert */}
          <AlertBanner
            type="error"
            title="Error"
            message={error}
            onClose={clearError}
            show={!!error && !loading}
          />

          {/* Articles Table */}
          <ArticlesTable
            articles={filteredArticles}
            loading={loading}
            error={error}
            onEdit={openEditForm}
            onDelete={openDeleteModal}
            totalArticles={articles.length}
          />

          {/* Pagination */}
          {!loading && !error && filteredArticles.length > 0 && (
            <EnhancedPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Small helper components
const PageHeader = ({ title, description, actionButton }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
    {actionButton}
  </div>
);

const CardHeaderContent = ({ title, description, filters }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="space-y-1">
      <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </div>
    {filters}
  </div>
);
