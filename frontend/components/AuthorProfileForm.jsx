"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import SuccessModal from "@/components/SuccessModal";
import { Save, X, AlertCircle, Trash2 } from "lucide-react";
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

  // Helper function to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch existing author profile
  const fetchAuthorProfile = async () => {
    if (!user?.id) {
      console.log("No user ID available");
      setLoadingProfile(false);
      return null;
    }

    try {
      setLoadingProfile(true);
      
      console.log("Fetching author profile for user:", user.id);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/authors/${user.id}/`,
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

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
        console.log("No author profile found");
        setAuthorProfile(null);
        return null;
      }
    } catch (err) {
      console.error("Failed to fetch author profile:", err);

      // Handle different error scenarios
      if (err.response?.status === 404) {
        // User doesn't have an author profile yet
        console.log("User doesn't have an author profile yet");
        setAuthorProfile(null);
        return null;
      } else if (err.response?.status === 401) {
        // Authentication error
        setError("Your session has expired. Please log in again.");
        // Optional: redirect to login
        // router.push("/login");
      } else {
        // Other errors
        console.error("API Error:", err);
        setError("Failed to load author profile. Please try again.");
      }
      setAuthorProfile(null);
      return null;
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch author profile when component mounts
  useEffect(() => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      };

      let url, method;

      if (authorProfile) {
        // Update existing profile
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/authors/update/${authorProfile.id}/`;
        method = "PUT";
      } else {
        // Create new profile
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/authors/create/`;
        method = "POST";
      }

      console.log("Making API request:", { url, method, formData });

      const response = await axios({
        method,
        url,
        data: formData,
        ...config,
      });

      console.log("Author profile saved successfully:", response.data);

      if (response.data.success) {
        const authorData = response.data.data || response.data.author;
        
        // Update user's isAuthor status
        try {
          console.log("Updating user profile with isAuthor:", !!authorData);
          await updateProfile({ is_author: !!authorData });
          console.log("User profile updated successfully");
        } catch (updateError) {
          console.error("Failed to update user profile:", updateError);
        }

        // Update local state
        setAuthorProfile(authorData);
        console.log("Author profile state updated:", authorData);

        // Set success message with auto-clear timer
        const successMsg = authorProfile
          ? "Author profile updated successfully!"
          : "Author profile created successfully!";
        setSuccess(successMsg);

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess("");
        }, 5000);

        // Show modal for new authors
        if (!authorProfile) {
          setShowSuccessModal(true);
        }

        // Call onSuccess callback
        console.log("Calling onSuccess with:", authorData);
        onSuccess && onSuccess(authorData);

        // Exit edit mode
        setIsEditing(false);
      } else {
        throw new Error(response.data.message || "Failed to save author profile");
      }
    } catch (err) {
      console.error("Author profile error:", err);

      let errorMessage = "Failed to save author profile";

      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        } else if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      
      // Also clear error message after 5 seconds
      setTimeout(() => {
        setError("");
      }, 5000);
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
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/authors/delete/${authorProfile.id}/`,
        {
          headers: getAuthHeader(),
        }
      );

      if (response.data.success) {
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
          await updateProfile({ is_author: false });
        } catch (updateError) {
          console.error("Failed to update user profile:", updateError);
        }

        setSuccess("Author profile deleted successfully!");
        setIsEditing(false);
        onSuccess && onSuccess(null);
      } else {
        throw new Error(response.data.message || "Failed to delete author profile");
      }
    } catch (err) {
      console.error("Failed to delete author profile:", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete author profile"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (authorProfile) {
      // Reset to current profile data
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
      // Reset to empty for new profile
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
      <div className="bg-card rounded-2xl shadow-lg p-8 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {authorProfile ? "Author Profile" : "Become an Author"}
          </h2>
          <div className="flex gap-2">
            {authorProfile && !isEditing && (
              <button
                onClick={handleDeleteAuthorProfile}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50 border border-destructive/20"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Profile"}
              </button>
            )}
            {!isEditing && authorProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors border border-accent/20"
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
                            className="px-3 py-2 bg-accent hover:bg-accent/80 text-foreground rounded-lg transition-colors capitalize text-sm border border-accent/20"
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-4">
                Social Links
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                disabled={isLoading}
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
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Author Profile
              </button>
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