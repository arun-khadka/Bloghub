"use client";

import { useEffect, useState, useRef } from "react";
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 border border-red-200 animate-in zoom-in-95">
        <div className="flex flex-col p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Article
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{articleTitle}"
              </span>
              ? This action cannot be undone and will permanently remove the
              article.
            </p>
          </div>

          {/* Actions */}
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

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    articleId: null,
    articleTitle: "",
    isLoading: false,
  });

  // Ref to track if initial load toast has been shown
  const initialLoadRef = useRef(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    status: "draft",
    content: "",
    category: "",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/list/`
      );

      // Handle different response formats
      if (Array.isArray(response.data)) {
        // If response is directly an array
        setArticles(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // If response has data property with array
        setArticles(response.data.data);
      } else if (response.data.success && Array.isArray(response.data.data)) {
        // If response has success flag and data array
        setArticles(response.data.data);
      } else {
        setArticles([]);
        toast.error("Invalid response format from server");
        return;
      }

      // Only show success toast on initial load
      if (!initialLoadRef.current) {
        toast.success("Articles loaded successfully!");
        initialLoadRef.current = true;
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      const errorMessage = "Failed to load articles. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      status: "draft",
      content: "",
      category: "",
    });
    setEditingArticle(null);
    setError("");
    setSuccess("");
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      author: article.author_name || "",
      status: article.status,
      content: article.content || "",
      category: article.category || "",
    });
    setDialogOpen(true);
  };

  const handleSaveArticle = async () => {
    if (!formData.title.trim()) {
      setError("Article title is required");
      return;
    }

    try {
      if (editingArticle) {
        setUpdating(true);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/update/${editingArticle.id}/`,
          formData,
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
          await fetchArticles();
        } else {
          setError(response.data.message || "Failed to update article.");
        }
      } else {
        setCreating(true);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/create/`,
          formData,
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
          await fetchArticles();
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

  // Delete functions with modal
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
        await fetchArticles();
      } else {
        toast.error(response.data.message || "Failed to delete article.");
        closeDeleteModal();
      }
    } catch (err) {
      console.error("Error deleting article:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete article.";
      toast.error(errorMessage);
      closeDeleteModal();
    }
  };

  const filteredArticles = articles.filter((article) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      !search ||
      String(article.title || "")
        .toLowerCase()
        .includes(searchTerm) ||
      String(article.author || "")
        .toLowerCase()
        .includes(searchTerm) ||
      String(article.author_name || "")
        .toLowerCase()
        .includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || article.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalArticles = articles.length;
  const publishedArticles = articles.filter(
    (a) => a.status === "published"
  ).length;
  const draftArticles = articles.filter((a) => a.status === "draft").length;

  // Helper function to get author name from article
  const getAuthorName = (article) => {
    return article?.author_name || "Unknown Author";
  };

  // Helper function to get created date from article
  const getCreatedDate = (article) => {
    return (
      article.createdAt ||
      article.created_at ||
      article.created_date ||
      article.created
    );
  };

  // Helper function to get views count from article
  const getViewsCount = (article) => {
    return article.views || article.view_count || 0;
  };

  // Manual clear functions
  const clearError = () => setError("");
  const clearSuccess = () => setSuccess("");

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        articleTitle={deleteModal.articleTitle}
        isLoading={deleteModal.isLoading}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Content Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage articles with full create, read, update, and delete controls.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreateDialog}>
              <Plus className="mr-1 h-4 w-4" />
              New article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Edit article" : "Create article"}
              </DialogTitle>
              <DialogDescription>
                {editingArticle
                  ? "Update the article details and save your changes."
                  : "Fill in the details below to publish a new article or save it as a draft."}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert
                variant="destructive"
                className="relative border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600"
              >
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0 text-red-700 hover:bg-red-100"
                  onClick={clearError}
                >
                  ×
                </Button>
              </Alert>
            )}

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter article title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Author</label>
                  <Input
                    value={formData.author}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: e.target.value,
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
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={8}
                  placeholder="Write your article content here..."
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
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
                disabled={creating || updating || !formData.title.trim()}
              >
                {creating || updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingArticle ? "Updating..." : "Creating..."}
                  </>
                ) : editingArticle ? (
                  "Save changes"
                ) : (
                  "Create article"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total articles</CardDescription>
            <CardTitle className="text-2xl">{totalArticles}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {publishedArticles}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {draftArticles}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {articles
                .reduce((sum, article) => sum + getViewsCount(article), 0)
                .toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Articles</CardTitle>
              <CardDescription>
                Search, filter, edit, or delete articles.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs
                value={statusFilter === "all" ? "all" : statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <TabsList className="h-8">
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
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchArticles}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="">Author Name</TableHead>
                  <TableHead className="">Status</TableHead>
                  <TableHead className="text-center">Views</TableHead>
                  <TableHead className="text-center">Created At</TableHead>
                  <TableHead className="w-[120px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="max-w-xs">
                      <div className="flex items-center justify-left gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="line-clamp-1 text-sm font-medium">
                          {article.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {getAuthorName(article)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge
                          variant={
                            article.status === "published"
                              ? "default"
                              : "outline"
                          }
                          className="capitalize text-xs"
                        >
                          {article.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {getViewsCount(article).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(getCreatedDate(article)).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openEditDialog(article)}
                          disabled={deleteModal.isLoading}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-600"
                          onClick={() => openDeleteModal(article)}
                          disabled={deleteModal.isLoading}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredArticles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      {articles.length === 0
                        ? "No articles found. Create your first article!"
                        : "No articles match the current filters."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
