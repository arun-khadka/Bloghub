import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2, Save, ChevronUp, ChevronDown } from "lucide-react";
import PropTypes from "prop-types";

/**
 * @typedef {Object} FormData
 * @property {string} title
 * @property {string} author_name
 * @property {string} status
 * @property {string} content
 * @property {string} category
 */

/**
 * @typedef {Object} Article
 * @property {string|number} id
 * @property {string} title
 * @property {string} [author_name]
 * @property {boolean} is_published
 * @property {string} [content]
 * @property {string} [category_name]
 */

/**
 * @typedef {Object} ArticleFormModalProps
 * @property {boolean} isOpen - Whether the modal is open
 * @property {() => void} onClose - Function to close the modal
 * @property {(data: FormData) => Promise<void>} onSubmit - Function to submit the form
 * @property {FormData} formData - Current form data
 * @property {(field: string, value: string) => void} onFormChange - Function to handle form changes
 * @property {Article|null} editingArticle - Article being edited (null for create)
 * @property {string} [error] - Form error message
 * @property {boolean} isLoading - Whether form is submitting
 */

/**
 * Modal for creating/editing articles
 * @param {ArticleFormModalProps} props
 */
export default function ArticleFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  editingArticle,
  error,
  isLoading,
}) {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] border border-gray-200 animate-in zoom-in-95 flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingArticle ? "Edit Article" : "Create New Article"}
            </h3>
            <p className="text-sm text-gray-600">
              {editingArticle
                ? "Update article details"
                : "Fill in the details to create a new article"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Form Content */}
        <div
          className="form-content flex-1 overflow-y-auto p-6"
          onScroll={handleScroll}
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700"
                >
                  Article Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => onFormChange("title", e.target.value)}
                  placeholder="Enter article title"
                  required
                  disabled={isLoading}
                  className="w-full focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label
                  htmlFor="author_name"
                  className="text-sm font-medium text-gray-700"
                >
                  Author Name
                </Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => onFormChange("author_name", e.target.value)}
                  placeholder="Enter author name"
                  disabled={isLoading}
                  className="w-full focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700"
                >
                  Category
                </Label>
                <Input
                  id="category"
                  value={formData.category_name}
                  onChange={(e) => onFormChange("category_name", e.target.value)}
                  placeholder="Enter category (e.g., Technology, Business)"
                  disabled={isLoading}
                  className="w-full focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700"
                >
                  Status *
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => onFormChange("status", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label
                  htmlFor="content"
                  className="text-sm font-medium text-gray-700"
                >
                  Content *
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => onFormChange("content", e.target.value)}
                  placeholder="Write your article content here..."
                  required
                  disabled={isLoading}
                  className="min-h-[300px] w-full resize-y focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Supports Markdown formatting
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.content.length} characters
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Scroll Indicators (Optional) */}
        <div className="absolute right-4 top-24 flex flex-col gap-2">
          {!isAtTop && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={scrollToTop}
              className="h-8 w-8 bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-gray-50"
              title="Scroll to top"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
          {!isAtBottom && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={scrollToBottom}
              className="h-8 w-8 bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-gray-50"
              title="Scroll to bottom"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 shrink-0">
          <div className="text-sm text-gray-500">
            {editingArticle
              ? "Editing existing article"
              : "Creating new article"}
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
                isLoading || !formData.title.trim() || !formData.content.trim()
              }
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingArticle ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingArticle ? "Update Article" : "Create Article"}
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
    author_name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
  }).isRequired,
  onFormChange: PropTypes.func.isRequired,
  editingArticle: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    author_name: PropTypes.string,
    is_published: PropTypes.bool.isRequired,
    content: PropTypes.string,
    category_name: PropTypes.string,
  }),
  error: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
};

ArticleFormModal.defaultProps = {
  editingArticle: null,
  error: null,
};
