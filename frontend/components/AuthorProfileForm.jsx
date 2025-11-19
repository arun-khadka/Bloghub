"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import SuccessModal from "@/components/SuccessModal";
import { Save, X, AlertCircle, Trash2 } from "lucide-react";
import Toast from "@/components/Toast";
import { useRouter } from "next/navigation";

export default function AuthorProfileForm({ onSuccess }) {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authorProfile, setAuthorProfile] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    bio: "",
    social_links: {
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
    },
  });

  // Helper function to get valid token with refresh logic
  const getValidToken = async () => {
    try {
      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        throw new Error("No access token found");
      }

      // Simple token validation - you might want to decode and check expiry
      // For now, we'll try to use it and refresh if it fails
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
      throw new Error("Session expired. Please login again.");
    }
  };

  // Fetch existing author profile - FIXED WITH PROPER ERROR HANDLING
  const fetchAuthorProfile = async () => {
    if (!user?.id) {
      console.log("No user ID available");
      setLoadingProfile(false);
      return null;
    }

    try {
      setLoadingProfile(true);
      
      let { accessToken, refreshToken } = await getValidToken();
      let retryWithRefresh = false;

      console.log("Fetching author profile for user:", user.id);

      const makeRequest = async (token) => {
        return await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/authors/${user.id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );
      };

      let response;
      try {
        response = await makeRequest(accessToken);
      } catch (err) {
        if (err.response?.status === 401 && refreshToken && !retryWithRefresh) {
          console.log("Token expired, attempting refresh...");
          retryWithRefresh = true;
          accessToken = await refreshAccessToken(refreshToken);
          response = await makeRequest(accessToken);
        } else {
          throw err;
        }
      }

      console.log("API Response:", response.data);

      if (response.data && response.data.success && response.data.data) {
        const authorData = response.data.data;

        setAuthorProfile(authorData);
        setFormData({
          bio: authorData.bio || "",
          social_links: {
            twitter: authorData.social_links?.twitter || "",
            facebook: authorData.social_links?.facebook || "",
            instagram: authorData.social_links?.instagram || "",
            linkedin: authorData.social_links?.linkedin || "",
          },
        });
        console.log("Author profile loaded:", authorData);
        return authorData;
      } else {
        console.log("No author profile found in response");
        setAuthorProfile(null);
        return null;
      }
    } catch (err) {
      console.error("Failed to fetch author profile:", err);

      if (err.response?.status === 404) {
        console.log("Author profile not found (404) - User is not an author yet");
        setAuthorProfile(null);
      } else if (err.response?.status === 401) {
        console.log("Authentication failed - redirect to login");
        setError("Your session has expired. Please log in again.");
        // Optionally redirect to login page
        // router.push("/login");
      } else {
        console.error("API Error:", err);
        setError("Failed to load author profile. Please try again.");
        setAuthorProfile(null);
      }
      return null;
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch author profile when component mounts
  useEffect(() => {
    console.log("useEffect triggered - User:", user);

    const loadAuthorProfile = async () => {
      if (user?.id) {
        console.log("Loading author profile for user:", user.id);
        await fetchAuthorProfile();
      } else {
        console.log("No user ID available");
        setAuthorProfile(null);
        setLoadingProfile(false);
      }
    };

    loadAuthorProfile();
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      let { accessToken, refreshToken } = await getValidToken();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      };

      let url, method;

      if (authorProfile) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/authors/${user.id}/`;
        method = "PUT";
      } else {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/authors/create/`;
        method = "POST";
      }

      console.log("Making API request:", { url, method, formData });

      const makeRequest = async (token) => {
        return await axios({
          method,
          url,
          data: formData,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      };

      let res;
      try {
        res = await makeRequest(accessToken);
      } catch (error) {
        if (error.response?.status === 401 && refreshToken) {
          accessToken = await refreshAccessToken(refreshToken);
          res = await makeRequest(accessToken);
        } else {
          throw error;
        }
      }

      // SUCCESS - Extract author data from your API response structure
      console.log("Author profile saved successfully:", res.data);

      let authorData;
      if (res.data.author) {
        authorData = res.data.author;
      } else if (res.data.data) {
        authorData = res.data.data;
      } else {
        authorData = res.data;
      }

      // Update user's isAuthor status using the response data
      if (!authorProfile) {
        try {
          console.log("Updating user profile with isAuthor: true");
          await updateProfile({ isAuthor: true });
          console.log("User profile updated successfully");
        } catch (updateError) {
          console.error("Failed to update user profile:", updateError);
        }
      }

      // Update local state with the author data
      setAuthorProfile(authorData);
      console.log("Author profile state updated:", authorData);

      // Set success message
      const successMsg = authorProfile
        ? "Author profile updated successfully!"
        : "Author profile created successfully!";
      setSuccess(successMsg);

      // Show modal for new authors
      if (!authorProfile) {
        setShowSuccessModal(true);
      }

      // Call onSuccess callback with the author data
      console.log("Calling onSuccess with:", authorData);
      onSuccess && onSuccess(authorData);

      // Exit edit mode
      setIsEditing(false);
    } catch (err) {
      console.error("Author profile error:", err);

      let errorMessage = "Failed to save author profile";

      if (err.response?.data) {
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAuthorProfile = async () => {
    if (
      !authorProfile ||
      !window.confirm(
        "Are you sure you want to delete your author profile? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      let { accessToken, refreshToken } = await getValidToken();

      const makeRequest = async (token) => {
        return await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/authors/${user.id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      };

      try {
        await makeRequest(accessToken);
      } catch (error) {
        if (error.response?.status === 401 && refreshToken) {
          accessToken = await refreshAccessToken(refreshToken);
          await makeRequest(accessToken);
        } else {
          throw error;
        }
      }

      // Successfully deleted
      setAuthorProfile(null);
      setFormData({
        bio: "",
        social_links: {
          twitter: "",
          facebook: "",
          instagram: "",
          linkedin: "",
        },
      });

      // Update user's isAuthor status
      try {
        await updateProfile({ isAuthor: false });
      } catch (updateError) {
        console.error("Failed to update user profile:", updateError);
      }

      setSuccess("Author profile deleted successfully!");
      setIsEditing(false);
      onSuccess && onSuccess(null);
    } catch (err) {
      console.error("Failed to delete author profile:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete author profile"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (authorProfile) {
      setFormData({
        bio: authorProfile.bio || "",
        social_links: {
          twitter: authorProfile.social_links?.twitter || "",
          facebook: authorProfile.social_links?.facebook || "",
          instagram: authorProfile.social_links?.instagram || "",
          linkedin: authorProfile.social_links?.linkedin || "",
        },
      });
    } else {
      setFormData({
        bio: "",
        social_links: {
          twitter: "",
          facebook: "",
          instagram: "",
          linkedin: "",
        },
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  // Show loading state while fetching
  if (loadingProfile) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
        <div className="text-center py-8">
          <div className="animate-pulse">Loading author profile...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-2xl shadow-lg p-8 bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {authorProfile ? "Author Profile" : "Become an Author"}
          </h2>
          <div className="flex gap-2">
            {authorProfile && !isEditing && (
              <button
                onClick={handleDeleteAuthorProfile}
                disabled={isDeleting}
                className="flex items-center outline outline-red-400 hover:outline-red-400 shadow-md hover:shadow-red-300 gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Profile"}
              </button>
            )}
            {!isEditing && authorProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-accent outline outline-sky-300 shadow-md hover:shadow-blue-300 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            )}
            {!isEditing && !authorProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Author Profile
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && !error && (
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-green-500 shrink-0" />
            <p className="text-green-500 text-sm">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Display Mode - Show when user has author profile */}
        {!isEditing && authorProfile && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Bio
              </p>
              <p className="text-foreground">
                {authorProfile.bio || "No bio added yet"}
              </p>
            </div>

            {authorProfile.social_links &&
              Object.keys(authorProfile.social_links).some(
                (key) => authorProfile.social_links[key]
              ) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Social Links
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(authorProfile.social_links).map(
                      ([platform, url]) =>
                        url && (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 outline outline-blue-200 shadow hover:shadow-md hover:shadow-blue-300 bg-accent hover:bg-accent/80 text-foreground rounded-lg transition-colors capitalize text-sm"
                          >
                            {platform}
                          </a>
                        )
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell your readers about yourself..."
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-4">
                Social Links
              </label>
              <div className="space-y-3">
                {Object.keys(formData.social_links).map((platform) => (
                  <div key={platform}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1 capitalize">
                      {platform} URL
                    </label>
                    <input
                      type="url"
                      value={formData.social_links[platform]}
                      onChange={(e) =>
                        handleSocialChange(platform, e.target.value)
                      }
                      placeholder={`https://${platform}.com/yourprofile`}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isLoading
                  ? "Saving..."
                  : authorProfile
                  ? "Update Profile"
                  : "Create Profile"}
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
        )}

        {/* Create Profile Prompt - Show when no author profile exists and not editing */}
        {!isEditing && !authorProfile && !loadingProfile && (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Become an Author
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your author profile to start publishing articles and
                share your stories with the world.
              </p>
            </div>
          </div>
        )}
      </div>

      {showSuccessModal && (
        <SuccessModal
          onCreateArticle={() => {
            setShowSuccessModal(false);
            router.push("/create-article");
          }}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </>
  );
}