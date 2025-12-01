import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export const useArticleForm = ({ fetchArticles, pagination }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author_name: "",
    status: "draft",
    content: "",
    category: "", 
    category_name: "", 
  });
  const [formError, setFormError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [categories, setCategories] = useState([]);


  // Open form for editing existing article
  const openEditForm = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || "",
      author_name: article.author_name || "",
      status: article.is_published ? "published" : "draft",
      content: article.content || "",
      category: article.category || "", // Send category ID, not name
      category_name: article.category_name || "", // Keep name for display
    });
    setIsFormOpen(true);
    setFormError("");
  };

  // Fetch categories (call this when opening form)
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/dropdown/` 
      );
      setCategories(response.data.results || response.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Find category ID by name
  const findCategoryIdByName = (categoryName) => {
    const category = categories.find(cat => 
      cat.name?.toLowerCase() === categoryName?.toLowerCase()
    );
    return category?.id || null;
  };

  // Find category name by ID
  const findCategoryNameById = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "";
  };

  // Close form modal
  const closeForm = () => {
    setEditingArticle(null);
    setFormError("");
    setIsFormOpen(false);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      title: "",
      author_name: "",
      status: "draft",
      content: "",
      category: "",
      category_name: "",
    });
    setEditingArticle(null);
    setFormError("");
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user st arts typing
    if (formError) setFormError("");
  };

  // Handle form submission 
  const handleFormSubmit = async (data) => {
    // Validation
    if (!data.title.trim()) {
      setFormError("Article title is required");
      return;
    }

    if (!data.content.trim()) {
      setFormError("Article content is required");
      return;
    }

    try {
      // Prepare payload according to backend expectations
      const payload = {
        title: data.title.trim(),
        content: data.content.trim(),
        is_published: data.status === "published",
      };

      // Add author_name if provided
      if (data.author_name.trim()) {
        payload.author_name = data.author_name.trim();
      }

      // Handle category properly
      if (data.category) {
        // If category is a string (name), we need to convert it to ID
        // OR if it's already an ID, use it directly
        if (isNaN(data.category)) {
          // It's a category name, find ID
          const categoryId = findCategoryIdByName(data.category);
          if (categoryId) {
            payload.category = categoryId;
          } else {
            // Category name not found - create new category or send as string?
            // For now, let's send the string and let backend handle it
            payload.category = data.category.trim();
          }
        } else {
          // It's already an ID
          payload.category = parseInt(data.category);
        }
      }

      const token = typeof window !== "undefined" 
        ? localStorage.getItem("accessToken") 
        : null;

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (editingArticle) {
        // Update existing article - FIXED URL
        setIsUpdating(true);
        console.log("Updating article with payload:", payload);
        console.log("Article ID:", editingArticle.id);
        
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/update/${editingArticle.id}/`,
          payload,
          { headers }
        );

        console.log("Update response:", response.data);

        if (response.data.success) {
          toast.success("Article updated successfully!");
          closeForm();
          await fetchArticles(pagination.current);
        } else {
          setFormError(response.data.message || "Failed to update article.");
        }
      } else {
        // Create new article
        setIsCreating(true);
        console.log("Creating article with payload:", payload);
        
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/create/`,
          payload,
          { headers }
        );

        console.log("Create response:", response.data);

        if (response.data.success) {
          toast.success("Article created successfully!");
          closeForm();
          await fetchArticles(1); // Go to first page to see new article
        } else {
          setFormError(response.data.message || "Failed to create article.");
        }
      }
    } catch (err) {
      console.error("Error saving article:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Failed to save article. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data) {
        // Handle validation errors
        const errors = err.response.data;
        if (typeof errors === 'object') {
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
        }
      }
      
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
      setIsUpdating(false);
    }
  };

  return {
    isFormOpen,
    editingArticle,
    formData,
    formError,
    isCreating,
    isUpdating,
    categories,
 
    openEditForm,
    closeForm,
    handleFormChange,
    handleFormSubmit,
    fetchCategories,
  };
};