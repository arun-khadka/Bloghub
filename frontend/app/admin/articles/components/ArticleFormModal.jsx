"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Save,
  AlertCircle,
  Upload,
  Trash2,
  ArrowLeft,
  RefreshCw,
  User,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function ArticleFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  editingArticle,
  error,
  isLoading,
  categories = [],
}) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [originalImage, setOriginalImage] = useState("");
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (editingArticle && editingArticle.featured_image) {
      setOriginalImage(editingArticle.featured_image);
      setImagePreview(getImageUrl(editingArticle.featured_image));
    } else {
      // Clear image state when no featured image
      setOriginalImage("");
      setImagePreview("");
      setImageFile(null);
    }
  }, [editingArticle]);

  if (!isOpen || !editingArticle) return null;

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.trim() ? content.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/media/")) {
      const filename = imagePath.replace("/media/", "");
      return `${process.env.NEXT_PUBLIC_API_URL || ''}/media/${filename}`;
    }
    if (imagePath.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_API_URL || ''}${imagePath}`;
    }
    return "/placeholder.svg";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Pass additional info about image state
    await onSubmit(formData, imageFile, {
      hasExistingImage: !!originalImage,
      shouldRemoveImage: originalImage && !imageFile && !imagePreview,
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.length < 5) {
      errors.title = "Title must be at least 5 characters long";
    } else if (formData.title.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    if (!formData.excerpt?.trim()) {
      errors.excerpt = "Excerpt is required";
    } else if (formData.excerpt.length > 300) {
      errors.excerpt = "Excerpt must be less than 300 characters";
    } else if (formData.excerpt.length < 50) {
      errors.excerpt = "Excerpt must be at least 50 characters long";
    }

    if (!formData.content?.trim()) {
      errors.content = "Content is required";
    } else if (formData.content.length < 100) {
      errors.content = "Content must be at least 100 characters long";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormChange(name, value);
  };

  const handleCheckboxChange = (name, checked) => {
    onFormChange(name, checked);
  };

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
      setFormErrors(prev => ({...prev, image: "Please select a valid image file (JPEG, PNG, GIF, WebP)"}));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({...prev, image: "Image size must be less than 5MB"}));
      return;
    }

    setImageFile(file);
    setFormErrors(prev => ({...prev, image: ""}));

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    // Clear original image only if we're removing the existing one
    if (!imageFile && originalImage) {
      setOriginalImage("");
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setIsAtTop(scrollTop === 0);
    setIsAtBottom(Math.abs(scrollHeight - clientHeight - scrollTop) < 10);
  };

  const scrollToTop = () => {
    const formContent = document.querySelector(".form-content");
    if (formContent) {
      formContent.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToBottom = () => {
    const formContent = document.querySelector(".form-content");
    if (formContent) {
      formContent.scrollTo({
        top: formContent.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const getSelectedCategory = () => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return null;
    }
    return categories.find((cat) => cat.id == formData.category) || null;
  };

  const getAuthorName = () => {
    return (
      editingArticle.author_name ||
      editingArticle.author?.fullname ||
      editingArticle.author?.user?.fullname ||
      "Author"
    );
  };

  const getAuthorAvatar = () => {
    return editingArticle.author?.avatar || editingArticle.author?.user?.avatar;
  };

  const selectedCategory = getSelectedCategory();
  const authorName = getAuthorName();
  const authorAvatar = getAuthorAvatar();
  const lastUpdated = editingArticle?.updated_at || editingArticle?.created_at;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[95vh] border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 flex flex-col">
        {/* Header with Back Button and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
              title="Cancel"
              disabled={isLoading}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Article
            </h1>
          </div>

          <div className="flex gap-3">
            {selectedCategory && (
              <span className="px-3 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                {selectedCategory.name}
              </span>
            )}
          </div>
        </div>

        {/* Scroll buttons */}
        {!isAtTop && (
          <button
            onClick={scrollToTop}
            className="fixed z-10 left-1/2 transform -translate-x-1/2 top-24 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all opacity-90 hover:opacity-100"
            title="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
        {!isAtBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed z-10 left-1/2 transform -translate-x-1/2 bottom-24 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all opacity-90 hover:opacity-100"
            title="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Form Errors */}
        {/* {Object.keys(formErrors).length > 0 && (
          <div className="mx-6 mt-4 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <div className="text-destructive text-sm">
              {Object.values(formErrors).map((err, index) => (
                <p key={index}>{err}</p>
              ))}
            </div>
          </div>
        )} */}

        {/* Scrollable Form Content */}
        <div
          className="form-content flex-1 overflow-y-auto p-6"
          onScroll={handleScroll}
        >
          {/* Title Input */}
          <div className="mb-6">
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              required
              placeholder="Write your article title here..."
              className="w-full text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-transparent border-none outline-none placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0"
              maxLength={200}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center">
              {!formData.title ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add a compelling title that captures attention
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(formData.title?.length || 0)}/200 characters
                </p>
              )}
              {(formData.title?.length || 0) > 180 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Title is getting long
                </p>
              )}
            </div>
          </div>

          {/* Meta Info Preview */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 hover:text-primary transition-colors">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <span className="font-medium">
                {authorName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Last updated:{" "}
                {lastUpdated
                  ? new Date(lastUpdated).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{calculateReadTime(formData.content || "")} min read</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Selection */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Category *
              </h2>
              <select
                name="category"
                value={formData.category || ""}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="">Select a category</option>
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No categories available
                  </option>
                )}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Choose a category that best fits your article
              </p>
            </div>

            {/* Featured Image */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Featured Image
              </h2>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center mb-4">
                {!imagePreview && !originalImage ? (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      No featured image set. Click to upload one.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Supports: JPG, PNG, GIF, WebP (Max 5MB)
                    </p>
                    <label className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={imagePreview || getImageUrl(originalImage)}
                        alt="Featured preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                      {/* Upload Image button - always visible when there's an image */}
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors">
                        <Upload className="w-4 h-4" />
                        {originalImage && !imageFile ? "Replace Image" : "Upload Image"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isLoading}
                        />
                      </label>
                      
                      {/* Remove Image button */}
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                {originalImage && !imageFile
                  ? "Current featured image. Upload a new image to replace it."
                  : originalImage && imageFile
                  ? "New image will replace the current one when you save."
                  : "Add a featured image to make your article more engaging (optional)"}
              </p>
            </div>

            {/* Excerpt */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Excerpt *
              </h2>
              <Textarea
                name="excerpt"
                value={formData.excerpt || ""}
                onChange={handleInputChange}
                rows={3}
                required
                placeholder="Write a brief summary that will appear in article previews and search results..."
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                maxLength={300}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(formData.excerpt?.length || 0)}/300 characters
                </p>
                {(formData.excerpt?.length || 0) > 300 ? (
                  <p className="text-sm text-destructive">Excerpt is too long</p>
                ) : (formData.excerpt?.length || 0) < 50 &&
                  (formData.excerpt?.length || 0) > 0 ? (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Excerpt is too short
                  </p>
                ) : null}
              </div>
            </div>

            {/* Content */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Article Content *
              </h2>
              <Textarea
                name="content"
                value={formData.content || ""}
                onChange={handleInputChange}
                rows={20}
                required
                placeholder="Write your article content here. You can use markdown formatting for better readability..."
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-sans text-base leading-relaxed dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>{calculateReadTime(formData.content || "")} min read</span>
                  <span>{formData.content?.length || 0} characters</span>
                </div>
                {(formData.content?.length || 0) < 100 &&
                  (formData.content?.length || 0) > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                      Content is too short
                    </span>
                  )}
              </div>
            </div>

            {/* Publish Settings */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Publish Settings
              </h2>
              <div className="flex items-center gap-3 mb-3">
                <Checkbox
                  id="is_published"
                  name="is_published"
                  checked={formData.is_published || false}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("is_published", checked)
                  }
                  disabled={isLoading}
                  className="w-4 h-4"
                />
                <label
                  htmlFor="is_published"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  Publish article
                </label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formData.is_published
                  ? "Your article will be visible to all readers."
                  : "Your article will be saved as a draft and won't be visible to readers."}
              </p>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-between p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Editing article: {editingArticle.title || "Untitled Article"}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={
                isLoading ||
                (formData.excerpt?.length || 0) > 300 ||
                (formData.excerpt?.length || 0) < 50 ||
                (formData.content?.length || 0) < 100 ||
                !formData.title ||
                !formData.category
              }
              className="min-w-[140px] bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {formData.is_published ? "Update Article" : "Save Draft"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

ArticleFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    is_published: PropTypes.bool.isRequired,
  }).isRequired,
  onFormChange: PropTypes.func.isRequired,
  editingArticle: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    is_published: PropTypes.bool.isRequired,
    featured_image: PropTypes.string,
    author: PropTypes.shape({
      fullname: PropTypes.string,
      avatar: PropTypes.string,
    }),
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }).isRequired,
  error: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

ArticleFormModal.defaultProps = {
  error: null,
  categories: [],
};