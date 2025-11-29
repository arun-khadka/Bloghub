"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle,
  Edit2,
  Trash2,
  X,
  Save,
  Filter,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

// Zod validation schema for category
const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name is too long")
    .trim(),
  iconName: z
    .string()
    .min(1, "Icon name is required")
    .min(2, "Icon name must be at least 2 characters")
    .max(30, "Icon name is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Icon name can only contain lowercase letters, hyphens and numbers"
    )
    .trim(),
});

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
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
              Delete Category
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{categoryName}"
              </span>
              ? This action cannot be undone and will permanently remove the
              category.
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

// Pagination Component
function Pagination({ pagination, onPageChange, loading }) {
  const { current_page, total_pages, has_previous, has_next, total_count } =
    pagination;

  // Don't show pagination if no pages or no data
  if (total_pages <= 1 || total_count === 0) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    if (total_pages <= 5) {
      // Show all pages if total pages is 5 or less
      return Array.from({ length: total_pages }, (_, i) => i + 1);
    }

    const pages = [];
    const showLeftDots = current_page > 3;
    const showRightDots = current_page < total_pages - 2;

    // Always show first page
    pages.push(1);

    if (showLeftDots) {
      pages.push("...");
    }

    // Show pages around current page
    const start = Math.max(2, current_page - 1);
    const end = Math.min(total_pages - 1, current_page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (showRightDots) {
      pages.push("...");
    }

    // Always show last page if there's more than 1 page
    if (total_pages > 1) {
      pages.push(total_pages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 border-t">
      <div className="text-sm text-muted-foreground">
        {/* Page {current_page} of {total_pages} */}
        <div className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {(pagination.current_page - 1) * 6 + 1}-
            {Math.min(pagination.current_page * 6, pagination.total_count)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">
            {pagination.total_count}
          </span>{" "}
          categories
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!has_previous || loading}
          className="hidden h-8 w-8 p-0 lg:flex"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current_page - 1)}
          disabled={!has_previous || loading}
          className="h-8 w-8 p-0"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((pageNum, index) =>
            pageNum === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={current_page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                className="h-8 w-8 p-0 text-xs min-w-8"
              >
                {pageNum}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current_page + 1)}
          disabled={!has_next || loading}
          className="h-8 w-8 p-0"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(total_pages)}
          disabled={!has_next || loading}
          className="hidden h-8 w-8 p-0 lg:flex"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    iconName: "",
  });

  // Combined state for API calls
  const [filters, setFilters] = useState({
    page: 1,
    search: "",
  });

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    has_previous: false,
    has_next: false,
    total_count: 0,
  });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: "",
    isLoading: false,
  });

  // Ref to track if initial load toast has been shown
  const initialLoadRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    iconName: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    iconName: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    iconName: false,
  });

  // Fetch categories with current filters
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const params = new URLSearchParams();

      // Add search parameter if search term exists
      if (filters.search.trim()) {
        params.append("search", filters.search.trim());
      }

      // Add pagination parameters
      if (filters.page > 1) {
        params.append("page", filters.page.toString());
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/list/?${params}`
      );

      console.log("API Response:", response.data);

      // Handle DRF pagination response structure
      const responseData = response.data;

      // Extract data based on DRF pagination structure
      let categoriesData = [];
      let totalCount = 0;
      let hasNext = false;
      let hasPrevious = false;
      let currentPage = filters.page;

      // Structure: DRF pagination with custom wrapper in results
      if (
        responseData.results &&
        responseData.results.success &&
        Array.isArray(responseData.results.data)
      ) {
        categoriesData = responseData.results.data;
        totalCount = responseData.count || categoriesData.length;
        hasNext = responseData.next !== null;
        hasPrevious = responseData.previous !== null;

        // Extract current page from next/previous URLs if available
        if (responseData.next) {
          const nextUrl = new URL(responseData.next);
          const nextPage = nextUrl.searchParams.get("page");
          if (nextPage) {
            currentPage = parseInt(nextPage) - 1;
          }
        } else if (responseData.previous) {
          const prevUrl = new URL(responseData.previous);
          const prevPage = prevUrl.searchParams.get("page");
          if (prevPage) {
            currentPage = parseInt(prevPage) + 1;
          }
        }
      }
      // Alternative structure: Direct data array
      else if (Array.isArray(responseData.data) && responseData.success) {
        categoriesData = responseData.data;
        totalCount = responseData.count || categoriesData.length;
        hasNext = responseData.next !== null;
        hasPrevious = responseData.previous !== null;
      }
      // Standard DRF structure
      else if (Array.isArray(responseData.results)) {
        categoriesData = responseData.results;
        totalCount = responseData.count || categoriesData.length;
        hasNext = responseData.next !== null;
        hasPrevious = responseData.previous !== null;
      }
      // Fallback: direct array
      else if (Array.isArray(responseData)) {
        categoriesData = responseData;
        totalCount = responseData.length;
        hasNext = false;
        hasPrevious = false;
      }

      setCategories(categoriesData);

      // Calculate pagination (backend uses page_size = 6)
      const pageSize = 6;
      const totalPages = Math.ceil(totalCount / pageSize);

      const paginationData = {
        current_page: currentPage,
        total_pages: totalPages || 1,
        has_previous: hasPrevious,
        has_next: hasNext,
        total_count: totalCount,
      };

      setPagination(paginationData);

      // Only show success toast on initial load
      if (!initialLoadRef.current && categoriesData.length > 0) {
        toast.success("Categories loaded successfully!", {
          position: "top-center",
        });
        initialLoadRef.current = true;
      }

      if (categoriesData.length === 0 && filters.search) {
        toast.info("No categories found matching your search.");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load categories. Please try again.";
      setError(errorMessage);

      if (!loading) {
        toast.error(errorMessage);
      }

      // Reset pagination on error
      setPagination({
        current_page: 1,
        total_pages: 1,
        has_previous: false,
        has_next: false,
        total_count: 0,
      });
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [filters]);

  // Initial load and when filters change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  }, [filters.search]);

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

  // Handle search input change with debouncing
  const handleSearchChange = (value) => {
    setSearchInput(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set loading state
    setSearchLoading(true);

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: value,
        page: 1, // Reset to first page when search changes
      }));
    }, 500);
  };

  // Clear search function
  const clearSearch = () => {
    setSearchInput("");
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setFilters((prev) => ({
      ...prev,
      search: "",
      page: 1,
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setFilters((prev) => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    try {
      const fieldSchema = categorySchema.pick({ [name]: true });
      fieldSchema.parse({ [name]: value });
      return "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "Invalid value";
      }
      return "Validation error";
    }
  };

  // Validate all fields
  const validateForm = () => {
    try {
      categorySchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  // Validate field on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle input change with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Only validate if the field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Mark all fields as touched
    setTouched({
      name: true,
      iconName: true,
    });

    // Validate entire form with Zod
    const isValid = validateForm();

    if (!isValid) {
      // Focus on first error field
      const firstErrorField = Object.keys(formErrors).find(
        (key) => formErrors[key]
      );
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    try {
      setCreating(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      const payload = {
        name: formData.name.trim(),
        icon_name: formData.iconName.trim(),
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/create/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.data.success) {
        const successMessage =
          response.data.message || "Category created successfully.";
        setSuccess(successMessage);
        toast.success(successMessage);

        // Reset form
        setFormData({ name: "", iconName: "" });
        setTouched({ name: false, iconName: false });
        setFormErrors({ name: "", iconName: "" });

        // Refresh list to include new category and reset to page 1
        setFilters((prev) => ({ ...prev, page: 1 }));
        await fetchCategories();
      } else {
        const errorMessage =
          response.data.message || "Failed to create category.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error creating category:", err);
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string"
          ? err.response.data
          : "Failed to create category. Please check your input and try again.");
      setError(apiMessage);
      toast.error(apiMessage);
    } finally {
      setCreating(false);
    }
  };

  // Edit functions
  const startEdit = (category) => {
    setEditingId(category.id);
    setEditDraft({
      name: category.name,
      iconName: category.icon_name || category.iconName || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({
      name: "",
      iconName: "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveEdit = async (categoryId) => {
    try {
      // Validate edit draft
      const isValid = categorySchema.safeParse(editDraft);
      if (!isValid.success) {
        toast.error("Please fix validation errors before saving.");
        return;
      }

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      const payload = {
        name: editDraft.name.trim(),
        icon_name: editDraft.iconName.trim(),
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/update/${categoryId}/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.data.success) {
        toast.success("Category updated successfully!");
        setEditingId(null);
        await fetchCategories(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to update category.");
      }
    } catch (err) {
      console.error("Error updating category:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update category.";
      toast.error(errorMessage);
    }
  };

  // Delete functions with modal
  const openDeleteModal = (category) => {
    setDeleteModal({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name,
      isLoading: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      categoryId: null,
      categoryName: "",
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/delete/${deleteModal.categoryId}/`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.data.success) {
        toast.success("Category deleted successfully!");
        closeDeleteModal();

        // If we're on a page that might become empty after deletion, go back a page
        if (categories.length === 1 && pagination.current_page > 1) {
          setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          await fetchCategories(); // Refresh the list
        }
      } else {
        toast.error(response.data.message || "Failed to delete category.");
        closeDeleteModal();
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete category.";
      toast.error(errorMessage);
      closeDeleteModal();
    }
  };

  // Check if form is valid for real-time validation display
  const isFormValid = () => {
    try {
      categorySchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  // Get field validation state
  const getFieldState = (fieldName) => {
    if (!touched[fieldName]) return "default";
    return formErrors[fieldName] ? "error" : "success";
  };

  // Check if any field has been touched
  const isAnyFieldTouched = Object.values(touched).some((t) => t);

  // Manual clear functions
  const clearError = () => setError("");
  const clearSuccess = () => setSuccess("");

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        categoryName={deleteModal.categoryName}
        isLoading={deleteModal.isLoading}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Category Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Add new categories and review existing ones used across articles.
          </p>
        </div>
        <Badge variant="outline">
          <Tag className="mr-1 h-3 w-3" />
          {pagination.total_count} categories
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add new category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="relative border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600"
            >
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
          {success && (
            <Alert className="relative border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-600">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0 text-green-700 hover:bg-green-100"
                onClick={clearSuccess}
              >
                ×
              </Button>
            </Alert>
          )}

          <form onSubmit={handleCreateCategory} className="grid gap-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Sports"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pr-10 ${
                    getFieldState("name") === "error"
                      ? "border-destructive focus:ring-destructive/50"
                      : getFieldState("name") === "success"
                      ? "border-green-500 focus:ring-green-500/50"
                      : "border-border focus:ring-primary/50"
                  }`}
                  aria-describedby={formErrors.name ? "name-error" : undefined}
                  aria-invalid={getFieldState("name") === "error"}
                />
                {getFieldState("name") === "success" && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {getFieldState("name") === "error" && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
                )}
              </div>
              {formErrors.name && touched.name && (
                <p
                  id="name-error"
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Icon Name Field */}
            <div className="space-y-2">
              <label htmlFor="iconName" className="text-sm font-medium">
                Icon name
              </label>
              <div className="relative">
                <Input
                  id="iconName"
                  name="iconName"
                  placeholder="e.g. sports"
                  value={formData.iconName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`pr-10 ${
                    getFieldState("iconName") === "error"
                      ? "border-destructive focus:ring-destructive/50"
                      : getFieldState("iconName") === "success"
                      ? "border-green-500 focus:ring-green-500/50"
                      : "border-border focus:ring-primary/50"
                  }`}
                  aria-describedby={
                    formErrors.iconName ? "iconName-error" : undefined
                  }
                  aria-invalid={getFieldState("iconName") === "error"}
                />
                {getFieldState("iconName") === "success" && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {getFieldState("iconName") === "error" && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
                )}
              </div>
              {formErrors.iconName && touched.iconName && (
                <p
                  id="iconName-error"
                  className="text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.iconName}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={creating || (isAnyFieldTouched && !isFormValid())}
                className=""
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add category"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Existing categories</CardTitle>
          <CardDescription>
            All categories currently available for authors when creating
            articles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name or icon..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-9 pl-10 pr-10"
                />
                {searchInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                    disabled={searchLoading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {searchLoading && (
                  <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchCategories}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-3">
              {loading && categories.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                  {filters.search
                    ? "No categories found matching your search."
                    : "No categories found. Create one using the form above."}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Icon name</TableHead>
                        <TableHead className="w-[120px] text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => {
                        const isEditing = editingId === category.id;
                        const isDeleting =
                          deleteModal.isLoading &&
                          deleteModal.categoryId === category.id;

                        return (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">
                              {isEditing ? (
                                <Input
                                  value={editDraft.name}
                                  onChange={(e) =>
                                    handleEditChange("name", e.target.value)
                                  }
                                  className="h-8 text-sm"
                                />
                              ) : (
                                category.name
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {category.slug}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  value={editDraft.iconName}
                                  onChange={(e) =>
                                    handleEditChange("iconName", e.target.value)
                                  }
                                  className="h-8 text-sm"
                                />
                              ) : (
                                <Badge variant="outline">
                                  {category.icon_name ||
                                    category.iconName ||
                                    "—"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-1">
                                {isEditing ? (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-8 w-8 hover:bg-green-50 hover:text-green-600 border-green-200"
                                      onClick={() => saveEdit(category.id)}
                                      disabled={isDeleting}
                                    >
                                      <Save className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="h-8 w-8 hover:bg-gray-50 border-gray-200"
                                      onClick={cancelEdit}
                                      disabled={isDeleting}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                      onClick={() => startEdit(category)}
                                      disabled={
                                        isDeleting || editingId !== null
                                      }
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                      onClick={() => openDeleteModal(category)}
                                      disabled={
                                        isDeleting || editingId !== null
                                      }
                                    >
                                      <Trash2 className="h-3.5 text-red-600 w-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
