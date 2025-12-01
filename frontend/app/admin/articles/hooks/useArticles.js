import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import PropTypes from 'prop-types';

/**
 * @typedef {Object} UseArticlesParams
 * @property {string} search - Search query
 * @property {string} statusFilter - Status filter ('all', 'published', 'draft')
 * @property {string} sortBy - Sort by parameter
 */

/**
 * @typedef {Object} Article
 * @property {string|number} id
 * @property {string} title
 * @property {string} [author_name]
 * @property {boolean} is_published
 * @property {number} [view_count]
 * @property {string} [created_at]
 * @property {string} [category_name]
 */

/**
 * @typedef {Object} StatsData
 * @property {number} [total]
 * @property {number} [published]
 * @property {number} [draft]
 * @property {number} [total_views]
 */

/**
 * @typedef {Object} PaginationData
 * @property {number} current
 * @property {number} total
 * @property {number} pageSize
 * @property {string|null} next
 * @property {string|null} previous
 * @property {number} count
 */

/**
 * @typedef {Object} UseArticlesReturn
 * @property {Article[]} articles - All articles
 * @property {Article[]} filteredArticles - Filtered articles
 * @property {boolean} loading - Loading state
 * @property {StatsData|null} stats - Statistics data
 * @property {PaginationData} pagination - Pagination data
 * @property {string} error - Error message
 * @property {(page?: number, sort?: string) => Promise<void>} fetchArticles - Fetch articles function
 * @property {(sort: string) => void} handleSortChange - Handle sort change
 * @property {(page: number) => void} handlePageChange - Handle page change
 * @property {() => void} clearError - Clear error function
 */

/**
 * Custom hook for managing articles
 * @param {UseArticlesParams} params
 * @returns {UseArticlesReturn}
 */
export const useArticles = ({ search, statusFilter, sortBy }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
    next: null,
    previous: null,
    count: 0,
  });

  const initialLoadRef = useRef(false);

  const fetchArticles = useCallback(async (page = 1, sort = sortBy) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        sort: sort,
        limit: "10",
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blog/list/?${params}`
      );

      if (response.data && response.data.results) {
        const results = response.data.results;
        let articlesData = [];
        
        if (results.data && Array.isArray(results.data)) {
          articlesData = results.data;
        } else if (Array.isArray(results)) {
          articlesData = results;
        }

        let statsData = {};
        if (results.stats) {
          statsData = results.stats;
        }

        const paginationData = {
          current: page,
          total: response.data.count || 0,
          pageSize: 10,
          next: response.data.next,
          previous: response.data.previous,
          count: response.data.count || 0,
        };

        setArticles(articlesData);
        setStats(statsData);
        setPagination(paginationData);

        if (!initialLoadRef.current) {
          toast.success("Articles loaded successfully!", {
            position: "top-center",
          });
          initialLoadRef.current = true;
        }
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load articles. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  // Filter articles based on search and status
  const filteredArticles = articles.filter((article) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      !search ||
      (article.title || "").toLowerCase().includes(searchTerm) ||
      (article.author_name || "").toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published"
        ? article.is_published
        : !article.is_published);

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleSortChange = (newSort) => {
    fetchArticles(1, newSort);
  };

  const handlePageChange = (newPage) => {
    fetchArticles(newPage);
  };

  const clearError = () => setError("");

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Initial load
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    filteredArticles,
    loading,
    stats,
    pagination,
    error,
    fetchArticles,
    handleSortChange,
    handlePageChange,
    clearError,
  };
};

useArticles.propTypes = {
  search: PropTypes.string,
  statusFilter: PropTypes.string,
  sortBy: PropTypes.string,
};

useArticles.defaultProps = {
  search: "",
  statusFilter: "all",
  sortBy: "date_desc",
};