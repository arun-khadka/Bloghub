"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  FileText,
  Download,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";

export default function CreateArticlePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [savedDraft, setSavedDraft] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    is_published: true,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user?.id) {
      fetchCategories();
    }
  }, [user, loading, router]);

  // Redirect if not logged in or not author
  useEffect(() => {
    if (!loading && (!user || !user.is_author)) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("articleDraft");
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setSavedDraft(draft);
      setShowDraftModal(true);
    }
  }, []);

  const handleRestoreDraft = () => {
    if (savedDraft) {
      setFormData((prev) => ({
        ...prev,
        ...savedDraft,
      }));
    }
    setShowDraftModal(false);
    localStorage.removeItem("articleDraft");
  };

  const handleDiscardDraft = () => {
    setShowDraftModal(false);
    localStorage.removeItem("articleDraft");
    setSavedDraft(null);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/dropdown/`
      );

      // FIX: Extract the categories array from the response
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
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      const submitData = new FormData();

      submitData.append("title", formData.title.trim());
      submitData.append("excerpt", formData.excerpt.trim());
      submitData.append("content", formData.content.trim());
      submitData.append("category", formData.category);
      submitData.append("is_published", formData.is_published.toString());

      if (imageFile) {
        submitData.append("featured_image", imageFile);
      }

      console.log("Sending form data:", {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content.length + " chars",
        category: formData.category,
        is_published: formData.is_published,
        has_image: !!imageFile,
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/create/`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = response.data;

      if (responseData.success) {
        setToast({
          message: responseData.message || "Article published successfully!",
          type: "success",
        });

        localStorage.removeItem("articleDraft");

        setTimeout(() => {
          if (responseData.data && responseData.data.id) {
            router.push(`/article/${responseData.data.id}`);
          } else {
            router.push("/profile");
          }
        }, 1500);
      } else {
        throw new Error(responseData.message || "Failed to create article");
      }
    } catch (err) {
      console.error("Article creation error:", err);
      handleApiError(err);
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
    let errorMessage = "An error occurred while creating the article";

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
      } else if (err.response.data.non_field_errors) {
        errorMessage = err.response.data.non_field_errors.join(", ");
      }
    } else if (err.message) {
      errorMessage = err.message;
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

  // FIX: Safe category find function
  const getSelectedCategory = () => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return null;
    }
    return categories.find((cat) => cat.id == formData.category) || null;
  };

  const handleCancel = () => {
    if (formData.title || formData.content || formData.excerpt || imageFile) {
      if (
        confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  // Auto-save draft functionality
  useEffect(() => {
    if (formData.title || formData.content) {
      const draftData = {
        ...formData,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem("articleDraft", JSON.stringify(draftData));
    }
  }, [formData]);

  // Add loading state for categories
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
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
          {/* Header with Category Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Create New Article
            </h1>
            {selectedCategory && (
              <span className="px-3 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full self-start">
                {selectedCategory.name}
              </span>
            )}
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
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
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
                    <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={imagePreview}
                        alt="Featured preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Add a featured image to make your article more engaging
                (optional)
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
                  Publish immediately
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.is_published
                  ? "Your article will be visible to all readers immediately after publishing."
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
                  ? "Publishing..."
                  : formData.is_published
                  ? "Publish Article"
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

      {/* Draft Restoration Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Saved Draft Found
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have an unsaved article draft
                </p>
              </div>
              <button
                onClick={handleDiscardDraft}
                className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Would you like to continue editing your draft?
              </p>
              {savedDraft?.title && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 line-clamp-2">
                    "{savedDraft.title}"
                  </p>
                  {savedDraft?.excerpt && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 line-clamp-2">
                      {savedDraft.excerpt}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDiscardDraft}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
              >
                Discard Draft
              </button>
              <button
                onClick={handleRestoreDraft}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Restore Draft
              </button>
            </div>
          </div>
        </div>
      )}

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
