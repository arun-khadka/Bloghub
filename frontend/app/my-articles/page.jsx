"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";
import {
  Edit,
  Trash2,
  Eye,
  Plus,
  Calendar,
  Clock,
  Users,
  FileText,
  RefreshCw,
  Image as ImageIcon,
  X,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

const ARTICLES_PER_PAGE = 6;

export default function MyArticlesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    article: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch user's articles
  const fetchMyArticles = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/my-articles/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("My articles response:", response.data);

      if (response.data.success) {
        // Handle different response structures
        const articlesData =
          response.data.data.results || response.data.data || [];
        setArticles(Array.isArray(articlesData) ? articlesData : []);
      } else {
        setError(response.data.message || "Failed to fetch articles");
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError(err.response?.data?.message || "Failed to load articles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_author) {
      fetchMyArticles();
    }
  }, [user]);

  // Calculate pagination
  const totalArticles = articles.length;
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = articles.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);

    // Scroll to top
    const scrollToTop = () => {
      window.scrollTo(0, 0);
    };
    scrollToTop();
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
  };

  // Reset to page 1 when articles change
  useEffect(() => {
    setCurrentPage(1);
  }, [articles.length]);

  // Open delete confirmation modal
  const openDeleteModal = (article) => {
    setDeleteModal({
      isOpen: true,
      article: article,
    });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      article: null,
    });
  };

  // Handle delete article
  const handleDeleteArticle = async () => {
    const { article } = deleteModal;
    if (!article) return;

    try {
      setDeletingId(article.id);
      const token = localStorage.getItem("accessToken");

      console.log("Attempting to delete article:", article.id);
      console.log(
        "Using endpoint:",
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${article.id}/delete/`
      );

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${article.id}/delete/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Delete response:", response.data);

      if (response.data.success) {
        // Only remove from state if backend confirms success
        setArticles(articles.filter((a) => a.id !== article.id));
        closeDeleteModal();
      } else {
        throw new Error(response.data.message || "Failed to delete article");
      }
    } catch (err) {
      console.error("Error deleting article:", err);
      console.error("Error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      // Show specific error messages
      let errorMessage = "Failed to delete article";

      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to delete this article.";
      } else if (err.response?.status === 404) {
        errorMessage = "Article not found.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle edit article - redirect to edit page
  const handleEditArticle = (articleId) => {
    router.push(`/edit-article/${articleId}`);
  };

  // Handle view article
  const handleViewArticle = (articleId) => {
    router.push(`/article/${articleId}`);
  };

  // Handle create new article
  const handleCreateArticle = () => {
    router.push("/create-article");
  };

  // Handle refresh articles
  const handleRefresh = () => {
    fetchMyArticles();
    setCurrentPage(1); // Reset to first page on refresh
  };

  // Redirect if not logged in or not author
  useEffect(() => {
    if (!loading && (!user || !user.is_author)) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    if (!content) return "1 min read";
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return `${minutes} min read`;
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800 border border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "pending":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/media/")) {
      const filename = imagePath.replace("/media/", "");
      return `${process.env.NEXT_PUBLIC_API_URL}/media/${filename}`;
    }
    if (imagePath.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
    }
    return "/placeholder.svg";
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Loading Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>

            {/* Loading Articles */}
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-card border border-border rounded-lg p-6 animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="flex gap-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user?.is_author) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Author Access Required
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You need to be an author to manage articles. Please update your
              profile to become an author.
            </p>
            <button
              onClick={() => router.push("/profile")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Profile
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                My Articles
              </h1>
              <p className="text-muted-foreground">
                {totalArticles} {totalArticles === 1 ? "article" : "articles"}{" "}
                found
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-3 bg-accent outline outline-blue-200 border border-border rounded-lg text-blue-500 hover:text-blue-500 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={handleCreateArticle}
                className="flex items-center gap-2 px-6 py-3 bg-primary shadow-md hover:shadow-blue-400 text-primary-foreground rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Article
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={handleRefresh}
                  className="text-destructive hover:underline text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          {articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {totalArticles}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Articles
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {articles.filter((a) => a.is_published).length}
                </div>
                <div className="text-sm text-muted-foreground">Published</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {articles.filter((a) => !a.is_published).length}
                </div>
                <div className="text-sm text-muted-foreground">Drafts</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {currentArticles.length}
                </div>
                <div className="text-sm text-muted-foreground">Showing Now</div>
              </div>
            </div>
          )}

          {/* Articles List */}
          {currentArticles.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-lg border border-border">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No articles yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start sharing your knowledge and experiences with the world.
                Create your first article to get started.
              </p>
              <button
                onClick={handleCreateArticle}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Article
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-8">
                {currentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Featured Image */}
                      <div className="md:w-68 w-full h-48 md:h-auto relative shrink-0">
                        {article.featured_image ? (
                          <Image
                            src={getImageUrl(article.featured_image)}
                            alt={article.title || "Article image"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 192px"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Article Content */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-xl font-semibold text-foreground pr-4 line-clamp-2">
                                {article.title || "Untitled Article"}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${getStatusBadge(
                                  article.status
                                )}`}
                              >
                                {article.is_published
                                  ? "Published"
                                  : article.status || "Draft"}
                              </span>
                            </div>

                            <p className="text-muted-foreground mb-4 line-clamp-2">
                              {article.excerpt ||
                                article.content?.substring(0, 200) + "..." ||
                                "No description available"}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(article.created_at)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {calculateReadTime(article.content)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{article.view_count || 0} views</span>
                              </div>
                              {article.category_name && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                  {article.category_name}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                            <div className="text-xs text-muted-foreground">
                              Last updated: {formatDate(article.updated_at)}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewArticle(article.id)}
                                className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                title="View Article"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">View</span>
                              </button>

                              <button
                                onClick={() => handleEditArticle(article.id)}
                                className="flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm"
                                title="Edit Article"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>

                              <button
                                onClick={() => openDeleteModal(article)}
                                disabled={deletingId === article.id}
                                className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 text-sm"
                                title="Delete Article"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Delete Article
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
              <button
                onClick={closeDeleteModal}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Are you sure you want to delete the article:
              </p>
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 line-clamp-2">
                  "{deleteModal.article?.title || "Untitled Article"}"
                </p>
                {deleteModal.article?.is_published && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    This article is currently published and visible to readers
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deletingId === deleteModal.article?.id}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteArticle}
                disabled={deletingId === deleteModal.article?.id}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deletingId === deleteModal.article?.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Article
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
