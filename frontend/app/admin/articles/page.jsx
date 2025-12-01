"use client";

import { useState, useEffect } from "react"; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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
    clearError
  } = useArticles({ search, statusFilter, sortBy });

  const {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete
  } = useDeleteModal({ fetchArticles, pagination });

  const {
    isFormOpen,
    editingArticle,
    formData,
    formError,
    isCreating,
    isUpdating,
    openCreateForm,
    openEditForm,
    closeForm,
    handleFormChange,
    handleFormSubmit,
    categories,
    fetchCategories 
  } = useArticleForm({ fetchArticles, pagination });

  // Fetch categories when form opens 
  useEffect(() => {
    if (isFormOpen) {
      fetchCategories();
    }
  }, [isFormOpen, fetchCategories]);

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
        isLoading={isCreating || isUpdating}
        categories={categories} 
      />

      {/* Header */}
      <PageHeader
        title="Content Management"
        description="Manage and organize your articles"
      />

      {/* Stats Cards */}
      <StatsCards 
        stats={stats} 
        loading={loading} 
      />

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
                onRefresh={() => fetchArticles(pagination.current)}
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
            onCreate={openCreateForm}
            totalArticles={articles.length}
          />

          {/* Pagination */}
          <EnhancedPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={loading}
            show={!loading && !error && filteredArticles.length > 0}
          />
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