"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Calendar, Edit2, LogOut, Save, X } from "lucide-react";
import AuthorProfileForm from "@/components/AuthorProfileForm";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile, logout } = useAuth();
  const [authorProfile, setAuthorProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullname: "" });

  // Fetch author profile when user is available and is author
  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (!user?.id || !user.isAuthor) {
        setAuthorProfile(null);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/authors/${user.id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );

        if (res.data) {
          setAuthorProfile(res.data);
          console.log("Author profile fetched successfully:", res.data);
        }
      } catch (err) {
        console.error(
          "Failed to fetch author profile:",
          err.response?.data || err.message
        );
      }
    };

    if (user?.isAuthor) {
      fetchAuthorProfile();
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      fullname: user.fullname || "",
      email: user.email || "",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 ">
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <div className="bg-card bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.fullname}
                className="w-24 h-24 rounded-full border-4 border-primary/20"
              />

              {/* User Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.fullname}
                        onChange={(e) =>
                          setFormData({ ...formData, fullname: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>{" "}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="text"
                        disabled
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-4 py-2 outline-1 outline-transparent hover:outline-red-400 shadow-md hover:shadow-red-300 hover:text-red-500 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-all duration-300 ease-in-out"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-3xl font-bold text-foreground">
                        {user.fullname}
                      </h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center outline outline-sky-300 shadow-md hover:shadow-blue-300 gap-2 px-4 py-2 bg-accent text-foreground rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(user.date_joined).toLocaleDateString()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Author Profile Section */}
          <AuthorProfileForm
            onSuccess={(authorData) => {
              console.log("ProfilePage received author data:", authorData);

              if (authorData) {
                setAuthorProfile(authorData);
                if (!user.isAuthor) {
                  updateProfile({ isAuthor: true }).catch((err) => {
                    console.error("Failed to update user profile:", err);
                  });
                }
              } else {
                setAuthorProfile(null);
                if (user.isAuthor) {
                  updateProfile({ isAuthor: false }).catch((err) => {
                    console.error("Failed to update user profile:", err);
                  });
                }
              }
            }}
          />

          {/* Author Features */}
          <div className="mt-6 shadow-md">
            {user?.is_author && (
              <div className="bg-linear-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Ready to Share Your Story?
                </h2>
                <p className="text-muted-foreground mb-4">
                  You're now an author! Start publishing your articles.
                </p>
                <button
                  onClick={() => router.push("/create-article")}
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg shadow-sm hover:shadow-blue-600 transition-colors font-medium"
                >
                  Create New Article
                </button>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="bg-card border border-border rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Account Actions
            </h2>
            <div className="space-y-3">
              {user?.is_author && (
                <button
                  onClick={() => router.push("/my-articles")}
                  className="flex gap-2 items-center justify-center w-full px-4 py-3 bg-blue-100 outline-1 outline-blue-400 hover:outline-blue-400 shadow-md hover:shadow-blue-300 hover:text-blue-500 text-blue-800 rounded-lg transition-colors"
                >
                  Manage Articles
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex gap-2 items-center justify-center w-full px-4 py-3 bg-red-100 outline-1 outline-red-400 hover:outline-red-400 shadow-md hover:shadow-red-300 hover:text-red-500 text-destructive rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
