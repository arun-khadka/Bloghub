"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import Toast from "@/components/Toast";
import {
  Calendar,
  Clock,
  Eye,
  Save,
  X,
  AlertCircle,
  Upload,
  Trash2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [originalImage, setOriginalImage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    is_published: true,
  });

  const articleId = params.id;

  // Get token with validation
  const getValidToken = async () => {
    let token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No authentication token found. Please log in again.");
    }
    return token;
  };

  // Fetch article data and categories
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user?.id && articleId) {
      fetchArticleData();
      fetchCategories();
    }
  }, [user, loading, router, articleId]);

  const fetchArticleData = async () => {
    try {
      setIsFetching(true);
      setError("");

      const token = await getValidToken();

      console.log("Fetching article for editing:", articleId);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/retrieve/${articleId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      console.log("Article fetch response:", response.data);

      if (response.data.success) {
        const articleData = response.data.data;

        // Check if user owns this article
        const authorId = articleData.author?.id || articleData.author;
        if (authorId === user.id) {
          setError("You don't have permission to edit this article");
          setIsFetching(false);
          return;
        }

        // Set form data
        setFormData({
          title: articleData.title || "",
          excerpt: articleData.excerpt || "",
          content: articleData.content || "",
          category: articleData.category || "",
          is_published: articleData.is_published || false,
        });

        // Set image preview if exists
        if (articleData.featured_image) {
          setOriginalImage(articleData.featured_image);
          setImagePreview(getImageUrl(articleData.featured_image));
        }
      } else {
        setError(response.data.message || "Article not found");
      }
    } catch (err) {
      console.error("Error fetching article:", err);

      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
        setTimeout(() => router.push("/login"), 2000);
      } else if (err.response?.status === 404) {
        setError("Article not found");
      } else if (err.code === "ECONNABORTED") {
        setError(
          "Request timeout. Please check your connection and try again."
        );
      } else {
        setError(err.response?.data?.message || "Failed to load article");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/list/`,
        {
          timeout: 5000,
        }
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        console.error(
          "Unexpected categories response structure:",
          response.data
        );
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setOriginalImage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      setIsLoading(false);
      return;
    }

    try {
      const token = await getValidToken();

      const submitData = new FormData();

      submitData.append("title", formData.title.trim());
      submitData.append("excerpt", formData.excerpt.trim());
      submitData.append("content", formData.content.trim());
      submitData.append("category", formData.category);
      submitData.append("is_published", formData.is_published.toString());

      if (imageFile) {
        submitData.append("featured_image", imageFile);
      }

      console.log("Updating article with data:", {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content.length + " chars",
        category: formData.category,
        is_published: formData.is_published,
        has_image: !!imageFile,
      });

      // UPDATED URL: Using the correct endpoint based on your Django URLs
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${articleId}/update/`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000,
        }
      );

      const responseData = response.data;

      if (responseData.success) {
        setToast({
          message: responseData.message || "Article updated successfully!",
          type: "success",
        });

        setTimeout(() => {
          router.push("/my-articles");
        }, 1500);
      } else {
        throw new Error(responseData.message || "Failed to update article");
      }
    } catch (err) {
      console.error("Article update error:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        setToast({
          message: "Authentication failed. Redirecting to login...",
          type: "error",
        });
        setTimeout(() => router.push("/login"), 2000);
      } else if (err.response?.status === 403) {
        setError("You don't have permission to edit this article.");
      } else if (err.response?.status === 404) {
        setError("Article not found.");
      } else {
        handleApiError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.length < 5) {
      errors.title = "Title must be at least 5 characters long";
    }

    if (!formData.excerpt.trim()) {
      errors.excerpt = "Excerpt is required";
    } else if (formData.excerpt.length > 300) {
      errors.excerpt = "Excerpt must be less than 300 characters";
    } else if (formData.excerpt.length < 50) {
      errors.excerpt = "Excerpt must be at least 50 characters long";
    }

    if (!formData.content.trim()) {
      errors.content = "Content is required";
    } else if (formData.content.length < 100) {
      errors.content = "Content must be at least 100 characters long";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    return errors;
  };

  const handleApiError = (err) => {
    let errorMessage = "An error occurred while updating the article";

    if (err.response?.data) {
      if (err.response.data.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join(", ");
        errorMessage = errorMessages;
      } else if (err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err.response.data === "string") {
        errorMessage = err.response.data;
      } else if (err.response.data.detail) {
        errorMessage = err.response.data.detail;
      }
    } else if (err.message) {
      errorMessage = err.message;
    } else if (err.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Please try again.";
    }

    setError(errorMessage);
    setToast({
      message: errorMessage,
      type: "error",
    });
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.trim() ? content.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

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

  const getSelectedCategory = () => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return null;
    }
    return categories.find((cat) => cat.id == formData.category) || null;
  };

  const handleCancel = () => {
    if (
      formData.title ||
      formData.content ||
      formData.excerpt ||
      imageFile ||
      imagePreview !== getImageUrl(originalImage)
    ) {
      if (
        confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        router.push("/my-articles");
      }
    } else {
      router.push("/my-articles");
    }
  };

  const handleViewArticle = () => {
    router.push(`/article/${articleId}`);
  };

  const handleRetry = () => {
    setError("");
    fetchArticleData();
  };

  // Add loading state
  if (loading || isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  // Check if user is author
  if (!user?.is_author) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Author Access Required
            </h1>
            <p className="text-muted-foreground mb-6">
              You need to be an author to edit articles.
            </p>
            <button
              onClick={() => router.push("/profile")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Profile
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error && !isFetching) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push("/my-articles")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Articles
            </button>

            <div className="text-center py-12">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {error}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push("/my-articles")}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Back to My Articles
                </button>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-6 py-3 bg-accent text-foreground border border-border rounded-lg hover:bg-accent/80 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedCategory = getSelectedCategory();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ReadingProgressBar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-muted-foreground hover:text-blue-300 transition-colors p-2 hover:bg-blue-100 rounded-lg"
                title="Back to My Articles"
              >
                <ArrowLeft className="w-5 h-5 py-1 rounded-md text-blue-800" />
              </button>
              <h1 className="text-2xl font-bold text-foreground">
                Edit Article
              </h1>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleViewArticle}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Article"
              >
                <Eye className="w-4 h-4" />
                View Article
              </button>
              {selectedCategory && (
                <span className="px-3 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                  {selectedCategory.name}
                </span>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Write your article title here..."
              className="w-full text-3xl md:text-4xl font-bold text-foreground mb-2 bg-transparent border-none outline-none placeholder-muted-foreground focus:ring-0 focus:outline-none"
              maxLength={200}
            />
            <div className="flex justify-between items-center">
              {!formData.title ? (
                <p className="text-sm text-muted-foreground">
                  Add a compelling title that captures attention
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {formData.title.length}/200 characters
                </p>
              )}
              {formData.title.length > 180 && (
                <p className="text-sm text-amber-600">Title is getting long</p>
              )}
            </div>
          </div>

          {/* Meta Info Preview */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-2 hover:text-primary transition-colors">
              <img
                src={user?.avatar || "/placeholder.svg"}
                alt={user?.fullname || "User"}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium">{user?.fullname || "User"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{calculateReadTime(formData.content)} min read</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Selection */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Category *
              </h2>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select a category</option>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              <p className="text-sm text-muted-foreground mt-2">
                Choose a category that best fits your article
              </p>
            </div>

            {/* Featured Image */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Featured Image
              </h2>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
                {!imagePreview ? (
                  <div>
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Drag & drop an image here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports: JPG, PNG, GIF, WebP (Max 5MB)
                    </p>
                    <label className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative w-full h-74 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={imagePreview}
                        alt="Featured preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex gap-2 justify-left">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                {originalImage && !imageFile
                  ? "Current featured image. Upload a new image to replace it."
                  : "Add a featured image to make your article more engaging (optional)"}
              </p>
            </div>

            {/* Excerpt */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Excerpt *
              </h2>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                required
                placeholder="Write a brief summary that will appear in article previews and search results..."
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  {formData.excerpt.length}/300 characters
                </p>
                {formData.excerpt.length > 300 ? (
                  <p className="text-sm text-destructive">
                    Excerpt is too long
                  </p>
                ) : formData.excerpt.length < 50 &&
                  formData.excerpt.length > 0 ? (
                  <p className="text-sm text-amber-600">Excerpt is too short</p>
                ) : null}
              </div>
            </div>

            {/* Content */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Article Content *
              </h2>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={20}
                required
                placeholder="Write your article content here. You can use markdown formatting for better readability..."
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-sans text-base leading-relaxed"
              />
              <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>{calculateReadTime(formData.content)} min read</span>
                  <span>{formData.content.length} characters</span>
                </div>
                {formData.content.length < 100 &&
                  formData.content.length > 0 && (
                    <span className="text-amber-600">Content is too short</span>
                  )}
              </div>
            </div>

            {/* Publish Settings */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Publish Settings
              </h2>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_published: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50"
                />
                <label
                  htmlFor="is_published"
                  className="text-sm font-medium text-foreground"
                >
                  Publish article
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.is_published
                  ? "Your article will be visible to all readers."
                  : "Your article will be saved as a draft and won't be visible to readers."}
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={
                  isLoading ||
                  formData.excerpt.length > 300 ||
                  formData.excerpt.length < 50 ||
                  formData.content.length < 100 ||
                  !formData.title ||
                  !formData.category
                }
                className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Save className="w-4 h-4" />
                {isLoading
                  ? "Updating..."
                  : formData.is_published
                  ? "Update Article"
                  : "Save as Draft"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 outline-1 outline-transparent hover:outline-red-400 shadow-md hover:shadow-red-300 hover:text-red-500 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-all duration-300 ease-in-out"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
