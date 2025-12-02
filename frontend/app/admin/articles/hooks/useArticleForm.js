import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export const useArticleForm = ({ fetchArticles, pagination }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",  
    content: "",
    category: "",
    is_published: true,  
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [categories, setCategories] = useState([]);

  const fetchArticleDetails = async (articleId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/retrieve/${articleId}/`,  
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      
      if (response.data.success) {
        console.log("Full article data with author:", response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching article details:", err);
      return null;
    }
  };

  // Open form for editing existing article
  const openEditForm = async (article) => {
    console.log("Original article data:", article);
    
    try {
      // Fetch complete article with author details
      const fullArticle = await fetchArticleDetails(article.id);
      
      if (fullArticle) {
        console.log("Article with author name:", fullArticle.author_name);
        console.log("Article author object:", fullArticle.author);
        
        setEditingArticle(fullArticle);
        setFormData({
          title: fullArticle.title || "",
          excerpt: fullArticle.excerpt || "",
          content: fullArticle.content || "",
          category: fullArticle.category || fullArticle.category?.id || "",
          is_published: fullArticle.is_published || false,
        });
      } else {
        // Fallback to original article data
        setEditingArticle(article);
        setFormData({
          title: article.title || "",
          excerpt: article.excerpt || "",
          content: article.content || "",
          category: article.category || article.category?.id || "",
          is_published: article.is_published || false,
        });
      }
      
      setIsFormOpen(true);
      setFormError("");
      fetchCategories();
    } catch (err) {
      console.error("Error in openEditForm:", err);
      // Fallback
      setEditingArticle(article);
      setFormData({
        title: article.title || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        category: article.category || article.category?.id || "",
        is_published: article.is_published || false,
      });
      setIsFormOpen(true);
      setFormError("");
      fetchCategories();
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/category/dropdown/`  
      );
      console.log("Categories response:", response.data);
      
      // Handle different response formats
      if (response.data.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else if (Array.isArray(response.data.results)) {
        // Handle DRF pagination format
        setCategories(response.data.results);
      } else if (Array.isArray(response.data)) {
        // Handle direct array
        setCategories(response.data);
      } else {
        console.error("Unexpected categories response structure:", response.data);
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
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
      excerpt: "",
      content: "",
      category: "",
      is_published: true,
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
    // Clear error when user starts typing
    if (formError) setFormError("");
  };

  // Validate form data
  const validateForm = (data) => {
    const errors = {};
    
    if (!data.title?.trim()) {
      errors.title = "Article title is required";
    } else if (data.title.length < 5) {
      errors.title = "Title must be at least 5 characters long";
    } else if (data.title.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    if (!data.excerpt?.trim()) {
      errors.excerpt = "Excerpt is required";
    } else if (data.excerpt.length > 300) {
      errors.excerpt = "Excerpt must be less than 300 characters";
    } else if (data.excerpt.length < 50) {
      errors.excerpt = "Excerpt must be at least 50 characters long";
    }

    if (!data.content?.trim()) {
      errors.content = "Article content is required";
    } else if (data.content.length < 100) {
      errors.content = "Content must be at least 100 characters long";
    }

    if (!data.category) {
      errors.category = "Category is required";
    }

    return errors;
  };

  // Validate image file
  const validateImageFile = (imageFile) => {
    if (!imageFile) return null;
    
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    
    if (!validTypes.includes(imageFile.type)) {
      return "Please select a valid image file (JPEG, PNG, GIF, WebP)";
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      return "Image size must be less than 5MB";
    }

    return null;
  };

  // Handle form submission 
  const handleFormSubmit = async (data, imageFile = null, imageOptions = {}) => {
    console.log("Form submit called with:", { data, imageFile, imageOptions });
    
    // Validate form data
    const errors = validateForm(data);
    
    // Validate image file if provided
    if (imageFile) {
      const imageError = validateImageFile(imageFile);
      if (imageError) {
        errors.image = imageError;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormError(Object.values(errors)[0]);
      toast.error("Please fix the form errors");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare FormData for multipart/form-data
      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append("title", data.title.trim());
      formDataToSend.append("excerpt", data.excerpt.trim());
      formDataToSend.append("content", data.content.trim());
      formDataToSend.append("category", data.category);
      formDataToSend.append("is_published", data.is_published.toString());

      // Handle image file - THREE CASES:
      console.log("Image handling details:", {
        imageFile: !!imageFile,
        shouldRemoveImage: imageOptions.shouldRemoveImage,
        hasExistingImage: imageOptions.hasExistingImage
      });
      
      if (imageFile) {
        // CASE 1: New image uploaded (replaces existing or adds new)
        console.log("Adding new image file to FormData");
        formDataToSend.append("featured_image", imageFile);
      } else if (imageOptions.shouldRemoveImage) {
        // CASE 2: User wants to remove existing image
        // For Django, we can send an empty file field or null
        console.log("Removing existing image - sending empty file");
        formDataToSend.append("featured_image", ""); // Empty string to clear the field
      }
      // CASE 3: No imageFile and not removing image = keep existing image
      // Don't send featured_image field at all

      const token = typeof window !== "undefined" 
        ? localStorage.getItem("accessToken") 
        : null;

      const headers = {
        "Content-Type": "multipart/form-data",  
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      let response;
      let endpoint;
      
      if (editingArticle) {
        // Update existing article
        console.log("Updating article:", editingArticle.id);
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/blog/update/${editingArticle.id}/`;
        
        // For PUT vs PATCH: Use PUT for full update, but if your backend expects PATCH for partial updates
        // You might need to check your backend requirements
        response = await axios.put(endpoint, formDataToSend, { headers });
      } else {
        // Create new article
        console.log("Creating new article");
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/blog/create/`;
        response = await axios.post(endpoint, formDataToSend, { headers });
      }

      console.log("API Response:", response.data);

      if (response.data.success) {
        const successMessage = editingArticle 
          ? "Article updated successfully!" 
          : "Article created successfully!";
        
        toast.success(successMessage);
        closeForm();
        
        // Refresh articles list
        const pageToRefresh = editingArticle ? pagination.current : 1;
        await fetchArticles(pageToRefresh);
      } else {
        const errorMessage = response.data.message || 
          (editingArticle ? "Failed to update article." : "Failed to create article.");
        setFormError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error saving article:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = editingArticle 
        ? "Failed to update article. Please try again." 
        : "Failed to create article. Please try again.";
      
      if (err.response?.data) {
        // Handle different error formats
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.errors) {
          // Handle validation errors
          const errors = err.response.data.errors;
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.featured_image) {
          // Handle image-specific errors
          errorMessage = `Image error: ${Array.isArray(err.response.data.featured_image) 
            ? err.response.data.featured_image.join(', ') 
            : err.response.data.featured_image}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // State
    isFormOpen,
    editingArticle,
    formData,
    formError,
    isSubmitting,
    categories,
    
    // Actions
    openEditForm,
    closeForm,
    handleFormChange,
    handleFormSubmit,
    fetchCategories,
    resetForm,
  };
};