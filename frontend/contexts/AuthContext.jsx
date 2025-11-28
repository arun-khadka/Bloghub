"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  // Helper function to get valid token with refresh logic
  const getValidToken = async () => {
    try {
      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        throw new Error("No access token found");
      }

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Token validation error:", error);
      throw error;
    }
  };

  // Helper function to refresh token
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`,
        { refresh: refreshToken }
      );

      const newAccessToken = response.data.access;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear invalid tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      throw new Error("Session expired. Please login again.");
    }
  };

  // Load user and bookmarks on app mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (storedUser && token) {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Load bookmarks if user is authenticated
        await fetchBookmarks();
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // BOOKMARK FUNCTIONS - WITH PROPER ERROR HANDLING AND TOKEN REFRESH
  const fetchBookmarks = async () => {
    try {
      let { accessToken, refreshToken } = await getValidToken();
      let retryWithRefresh = false;

      setBookmarksLoading(true);

      const makeRequest = async (token) => {
        return await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/bookmarks/create-list/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      };

      let response;
      try {
        response = await makeRequest(accessToken);
      } catch (err) {
        if (err.response?.status === 401 && refreshToken && !retryWithRefresh) {
          console.log("Token expired, attempting refresh for bookmarks...");
          retryWithRefresh = true;
          accessToken = await refreshAccessToken(refreshToken);
          response = await makeRequest(accessToken);
        } else {
          throw err;
        }
      }

      console.log("RAW BOOKMARKS API RESPONSE:", response.data);

      if (response.data.success) {
        const bookmarksData = response.data.data;

        if (Array.isArray(bookmarksData)) {
          // Extract article IDs from bookmarks
          const articleIds = bookmarksData
            .map((bookmark) => bookmark.article?.id || bookmark.article)
            .filter((id) => id); // Remove null/undefined

          console.log("Article IDs from bookmarks:", articleIds);

          if (articleIds.length > 0) {
            // Fetch complete article data for each bookmarked article
            const articlesPromises = articleIds.map((articleId) =>
              axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/blog/retrieve/${articleId}/`
              )
            );

            const articlesResponses = await Promise.all(articlesPromises);
            const completeArticles = articlesResponses
              .map((response) =>
                response.data.success ? response.data.data : null
              )
              .filter((article) => article); // Remove failed fetches

            console.log("Complete articles data:", completeArticles);

            // Combine bookmark info with complete article data
            const bookmarksWithArticles = bookmarksData.map((bookmark) => {
              const articleId = bookmark.article?.id || bookmark.article;
              const completeArticle = completeArticles.find(
                (article) => article.id === articleId
              );
              return {
                ...bookmark,
                article: completeArticle || bookmark.article,
              };
            });

            setBookmarks(bookmarksWithArticles);
          } else {
            setBookmarks(bookmarksData);
          }
        } else {
          console.warn("Unexpected bookmarks structure:", bookmarksData);
          setBookmarks([]);
        }
      } else {
        console.error("Bookmarks API not successful:", response.data);
        setBookmarks([]);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);

      // If it's an auth error after refresh, clear user data
      if (
        error.response?.status === 401 ||
        error.message.includes("Session expired")
      ) {
        console.log("Authentication failed, clearing user data");
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      }

      setBookmarks([]);
    } finally {
      setBookmarksLoading(false);
    }
  };

  const isArticleBookmarked = (articleId) => {
    // Ensure bookmarks is always treated as an array
    if (!Array.isArray(bookmarks)) {
      console.warn("Bookmarks is not an array:", bookmarks);
      return false;
    }

    return bookmarks.some((bookmark) => {
      // Handle different bookmark structures
      const article = bookmark.article || bookmark;
      return article?.id === articleId;
    });
  };

  const getBookmarkId = (articleId) => {
    // Ensure bookmarks is always treated as an array
    if (!Array.isArray(bookmarks)) {
      return null;
    }

    const bookmark = bookmarks.find((bookmark) => {
      const article = bookmark.article || bookmark;
      return article?.id === articleId;
    });

    return bookmark?.id || null;
  };

  const toggleBookmark = async (articleId) => {
    try {
      let { accessToken, refreshToken } = await getValidToken();
      let retryWithRefresh = false;

      const currentlyBookmarked = isArticleBookmarked(articleId);
      const bookmarkId = getBookmarkId(articleId);

      const makeRequest = async (token, isDelete = false) => {
        if (isDelete) {
          return await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/api/bookmarks/${bookmarkId}/delete/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } else {
          return await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/bookmarks/create-list/`,
            { article: articleId },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      };

      try {
        if (currentlyBookmarked && bookmarkId) {
          // Remove bookmark
          await makeRequest(accessToken, true);
        } else {
          // Add bookmark
          await makeRequest(accessToken, false);
        }
      } catch (error) {
        if (
          error.response?.status === 401 &&
          refreshToken &&
          !retryWithRefresh
        ) {
          console.log(
            "Token expired, attempting refresh for bookmark toggle..."
          );
          retryWithRefresh = true;
          accessToken = await refreshAccessToken(refreshToken);

          if (currentlyBookmarked && bookmarkId) {
            await makeRequest(accessToken, true);
          } else {
            await makeRequest(accessToken, false);
          }
        } else {
          throw error;
        }
      }

      // Refresh bookmarks list
      await fetchBookmarks();
      return !currentlyBookmarked; // Return new state
    } catch (error) {
      console.error("Bookmark error:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      } else if (error.response?.status === 404) {
        throw new Error("Article not found.");
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to update bookmark. Please try again.");
      }
    }
  };

  // ------------------------------
  // AUTH FUNCTIONS
  // ------------------------------
  const persistSession = (tokens, userData) => {
    localStorage.setItem("accessToken", tokens.access);
    localStorage.setItem("refreshToken", tokens.refresh);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    console.log('User set in state:', userData); 
  };

  const login = async (email, password) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    const { tokens, user } = data.data;
    persistSession(tokens, user);
    // Load bookmarks after login
    await fetchBookmarks();

    return user;
  };

  const adminLogin = async (email, password) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/login/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Admin login failed");

    const { tokens, user } = data.data;
    persistSession(tokens, user);

    await fetchBookmarks();
    return user;
  };

  const signup = async (email, password, fullname) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullname }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");

    const { tokens, user } = data.data;
    persistSession(tokens, user);
    // Load bookmarks after signup
    await fetchBookmarks();

    return user;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setBookmarks([]); // Clear bookmarks on logout
  };

  // Updated refreshAccessToken function (already defined above)
  const refreshAccessTokenFn = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token found");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to refresh access token");

      localStorage.setItem("accessToken", data.access);
      return data.access;
    } catch (error) {
      console.error("Token refresh error:", error);
      // Clear tokens on refresh failure
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      throw error;
    }
  };

  const syncUserProfile = async () => {
    try {
      let { accessToken, refreshToken } = await getValidToken();
      let retryWithRefresh = false;

      const makeRequest = async (token) => {
        return await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      };

      let res;
      try {
        res = await makeRequest(accessToken);
      } catch (error) {
        if (
          error.response?.status === 401 &&
          refreshToken &&
          !retryWithRefresh
        ) {
          console.log("Token expired, attempting refresh for profile sync...");
          retryWithRefresh = true;
          accessToken = await refreshAccessToken(refreshToken);
          res = await makeRequest(accessToken);
        } else {
          throw error;
        }
      }

      if (res.ok) {
        const data = await res.json();
        const userData = data.data?.user || data.user || data;
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to sync user profile:", error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      let { accessToken, refreshToken } = await getValidToken();
      let retryWithRefresh = false;

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/`;

      const makeRequest = async (token) => {
        return await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });
      };

      let res;
      try {
        res = await makeRequest(accessToken);
      } catch (error) {
        if (
          error.response?.status === 401 &&
          refreshToken &&
          !retryWithRefresh
        ) {
          console.log(
            "Token expired, attempting refresh for profile update..."
          );
          retryWithRefresh = true;
          accessToken = await refreshAccessToken(refreshToken);
          res = await makeRequest(accessToken);
        } else {
          throw error;
        }
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      // Merge updated fields with current user
      const updatedUser = {
        ...user,
        ...updates,
        ...(data.data?.user && {
          fullname: data.data.user.fullname,
          bio: data.data.user.bio,
          avatar: data.data.user.avatar,
          ...(data.data.user.is_author !== undefined && {
            isAuthor: data.data.user.is_author,
          }),
        }),
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // ------------------------------
  // CONTEXT VALUE
  // ------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        adminLogin,
        signup,
        logout,
        updateProfile,
        syncUserProfile,
        refreshAccessToken: refreshAccessTokenFn,

        // Bookmarks
        bookmarks: Array.isArray(bookmarks) ? bookmarks : [], // Always return array
        bookmarksLoading,
        isArticleBookmarked,
        getBookmarkId,
        toggleBookmark,
        fetchBookmarks,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
