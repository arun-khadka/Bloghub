import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export const useDeleteModal = ({ fetchArticles, pagination }) => {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    articleId: null,
    articleTitle: "",
    isLoading: false,
  });

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

  return {
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete
  };
};