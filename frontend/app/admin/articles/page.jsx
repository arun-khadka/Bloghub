"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Eye,
  Calendar,
  User,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  articleTitle,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 border border-gray-200 animate-in zoom-in-95">
        <div className="flex flex-col p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Article
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{articleTitle}"
              </span>
              ? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Cards Component
function StatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border">
            <CardHeader className="pb-2">
              <CardDescription>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </CardDescription>
              <CardTitle className="text-2xl">
                <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="border">
        <CardHeader className="pb-2">
          <CardDescription className="font-medium">
            Total Articles
          </CardDescription>
          <CardTitle className="text-2xl text-gray-900">
            {stats?.total?.toLocaleString() || 0}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="border">
        <CardHeader className="pb-2">
          <CardDescription className="font-medium">Published</CardDescription>
          <CardTitle className="text-2xl text-green-600">
            {stats?.published?.toLocaleString() || 0}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="border">
        <CardHeader className="pb-2">
          <CardDescription className="font-medium">Drafts</CardDescription>
          <CardTitle className="text-2xl text-amber-600">
            {stats?.draft?.toLocaleString() || 0}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="border">
        <CardHeader className="pb-2">
          <CardDescription className="font-medium">Total Views</CardDescription>
          <CardTitle className="text-2xl text-blue-600">
            {stats?.total_views?.toLocaleString() || 0}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

// Enhanced Pagination Component
function Pagination({ pagination, onPageChange, loading }) {
  const totalPages = Math.ceil(pagination.count / pagination.pageSize);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold text-gray-900">
          {(pagination.current - 1) * pagination.pageSize + 1}-
          {Math.min(pagination.current * pagination.pageSize, pagination.count)}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900">{pagination.count}</span>{" "}
        articles
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.current - 1)}
          disabled={!pagination.previous || loading}
          className="gap-2 h-9 w-9 p-0 sm:w-auto sm:px-3"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (pagination.current <= 3) {
              pageNum = i + 1;
            } else if (pagination.current >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = pagination.current - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={pagination.current === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                className="h-9 w-9 p-0 font-medium"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.current + 1)}
          disabled={!pagination.next || loading}
          className="gap-2 h-9 w-9 p-0 sm:w-auto sm:px-3"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
    next: null,
    previous: null,
    count: 0,
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    articleId: null,
    articleTitle: "",
    isLoading: false,
  });

  const initialLoadRef = useRef(false);

  const [formData, setFormData] = useState({
    title: "",
    author_name: "",
    status: "draft",
    content: "",
    category: "",
    is_published: false,
  });

  // Fetch articles with parameters
  const fetchArticles = useCallback(
    async (page = 1, sort = sortBy) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: page.toString(),
          sort: sort,
          limit: "10",
        });

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/list/?${params}`
        );

        console.log("API Response:", response.data);

        if (response.data && response.data.results) {
          const results = response.data.results;

          let articlesData = [];
          if (results.data && Array.isArray(results.data)) {
            articlesData = results.data;
          } else if (Array.isArray(results)) {
            articlesData = results;
          }

          let statsData = {};
          if (results.stats) {
            statsData = results.stats;
          }

          const paginationData = {
            current: page,
            total: response.data.count || 0,
            pageSize: 10,
            next: response.data.next,
            previous: response.data.previous,
            count: response.data.count || 0,
          };

          setArticles(articlesData);
          setStats(statsData);
          setPagination(paginationData);

          if (!initialLoadRef.current) {
            toast.success("Articles loaded successfully!", {
              position: "top-center",
            });
            initialLoadRef.current = true;
          }
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load articles. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [sortBy]
  );

  // Initial load
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Auto-clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const resetForm = () => {
    setFormData({
      title: "",
      author_name: "",
      status: "draft",
      content: "",
      category: "",
      is_published: false,
    });
    setEditingArticle(null);
    setError("");
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || "",
      author_name: article.author_name || "",
      status: article.is_published ? "published" : "draft",
      content: article.content || "",
      category: article.category_name || "",
      is_published: article.is_published || false,
    });
    setDialogOpen(true);
  };

  const handleSaveArticle = async () => {
    if (!formData.title.trim()) {
      setError("Article title is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Article content is required");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        author_name: formData.author_name,
        content: formData.content,
        category: formData.category,
        is_published: formData.status === "published",
      };

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      if (editingArticle) {
        setUpdating(true);
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/update/${editingArticle.id}/`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (response.data.success) {
          toast.success("Article updated successfully!");
          setDialogOpen(false);
          resetForm();
          await fetchArticles(pagination.current);
        } else {
          setError(response.data.message || "Failed to update article.");
        }
      } else {
        setCreating(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/create/`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (response.data.success) {
          toast.success("Article created successfully!");
          setDialogOpen(false);
          resetForm();
          await fetchArticles(1);
        } else {
          setError(response.data.message || "Failed to create article.");
        }
      }
    } catch (err) {
      console.error("Error saving article:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to save article. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCreating(false);
      setUpdating(false);
    }
  };

  // Delete functions
  const openDeleteModal = (article) => {
    setDeleteModal({
      isOpen: true,
      articleId: article.id,
      articleTitle: article.title,
      isLoading: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      articleId: null,
      articleTitle: "",
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/delete/${deleteModal.articleId}/`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.data.success) {
        toast.success("Article deleted successfully!");
        closeDeleteModal();
        await fetchArticles(pagination.current);
      } else {
        throw new Error(response.data.message || "Failed to delete article.");
      }
    } catch (err) {
      console.error("Error deleting article:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete article.";
      toast.error(errorMessage);
    } finally {
      closeDeleteModal();
    }
  };

  // Filter articles based on search and status
  const filteredArticles = articles.filter((article) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      !search ||
      (article.title || "").toLowerCase().includes(searchTerm) ||
      (article.author_name || "").toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published"
        ? article.is_published
        : !article.is_published);

    return matchesSearch && matchesStatus;
  });

  // Sort options
  const sortOptions = [
    { value: "date_desc", label: "Newest First" },
    { value: "date_asc", label: "Oldest First" },
    { value: "views_desc", label: "Most Views" },
    { value: "views_asc", label: "Least Views" },
  ];

  // Helper functions
  const getAuthorName = (article) => {
    return article?.author_name || "Unknown Author";
  };

  const getCreatedDate = (article) => {
    return article.created_at || article.createdAt;
  };

  const getViewsCount = (article) => {
    return article.view_count || 0;
  };

  const getStatus = (article) => {
    return article.is_published ? "published" : "draft";
  };

  const clearError = () => setError("");

  // Pagination handlers
  const handlePageChange = (newPage) => {
    fetchArticles(newPage);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    fetchArticles(1, newSort);
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

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Content Management
          </h1>
          <p className="text-gray-600 text-sm">
            Manage and organize your articles
          </p>
        </div>

        {/* Create Article Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2 h-10">
              <Plus className="h-4 w-4" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold">
                {editingArticle ? "Edit Article" : "Create New Article"}
              </DialogTitle>
              <DialogDescription>
                {editingArticle
                  ? "Update the article details below."
                  : "Fill in the details to create a new article."}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive" className="relative">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                  onClick={clearError}
                >
                  ×
                </Button>
              </Alert>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter article title"
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Author</label>
                  <Input
                    value={formData.author_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author_name: e.target.value,
                      }))
                    }
                    placeholder="Author name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Article category"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content *</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={12}
                  placeholder="Write your article content here..."
                  className="resize-none text-sm leading-relaxed"
                />
              </div>
            </div>

            <DialogFooter className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                disabled={creating || updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveArticle}
                disabled={
                  creating ||
                  updating ||
                  !formData.title.trim() ||
                  !formData.content.trim()
                }
              >
                {(creating || updating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingArticle ? "Update Article" : "Create Article"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">Articles</CardTitle>
              <CardDescription>
                Manage your published articles and drafts
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter Tabs */}
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="published" className="text-xs">
                    Published
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="text-xs">
                    Drafts
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchArticles(pagination.current)}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search articles by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>{filteredArticles.length} articles found</span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                <p className="text-sm text-gray-600">Loading articles...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Articles Table */}
          {!loading && !error && (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Title</TableHead>
                      <TableHead className="text-center">Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Views</TableHead>
                      <TableHead className="text-center">Created At</TableHead>
                      <TableHead className="text-center w-[120px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles.map((article) => (
                      <TableRow
                        key={article.id}
                        className="group hover:bg-gray-50/50"
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1 max-w-[400px]">
                              <span
                                className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight block"
                                title={article.title} // Show full title on hover
                              >
                                {article.title.length > 80
                                  ? `${article.title.substring(0, 80)}...`
                                  : article.title}
                              </span>
                              {article.category_name && (
                                <span className="text-xs text-gray-500 mt-1 block">
                                  {article.category_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {getAuthorName(article)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant={
                              getStatus(article) === "published"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize text-xs"
                          >
                            {getStatus(article)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-center gap-2">
                            <Eye className="h-3 w-3 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {getViewsCount(article).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {new Date(
                              getCreatedDate(article)
                            ).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(article)}
                              disabled={deleteModal.isLoading}
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                              title="Edit article"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDeleteModal(article)}
                              disabled={deleteModal.isLoading}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                              title="Delete article"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredArticles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-500">
                            <FileText className="h-12 w-12 opacity-20" />
                            <div>
                              <p className="font-medium text-gray-900">
                                No articles found
                              </p>
                              <p className="text-sm mt-1">
                                {articles.length === 0
                                  ? "Get started by creating your first article."
                                  : "Try adjusting your search or filters."}
                              </p>
                            </div>
                            {articles.length === 0 && (
                              <Button
                                onClick={openCreateDialog}
                                className="mt-2"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Article
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced Pagination */}
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}