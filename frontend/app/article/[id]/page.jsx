"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import CommentsSection from "@/components/CommentsSection";
import Toast from "@/components/Toast";
import ViewCounter from "@/components/ViewCounter";
import {
  Calendar,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  User,
  Folder,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  X,
  LogIn,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function ArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id;

  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localToast, setLocalToast] = useState(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { user, isArticleBookmarked, toggleBookmark, bookmarksLoading } =
    useAuth();
  const isBookmarked = article?.id ? isArticleBookmarked(article.id) : false;

  // Track article view - ONLY PLACE WHERE VIEWS GET INCREMENTED
  const trackArticleView = async () => {
    if (!articleId || hasTrackedView || isTracking) {
      console.log("Skipping view tracking - already completed or in progress");
      return;
    }

    setIsTracking(true);

    try {
      // Check if we've already tracked this view in current session
      const viewedArticles = JSON.parse(
        localStorage.getItem("viewedArticles") || "[]"
      );

      console.log("View tracking check:", {
        articleId,
        hasTrackedView,
        isTracking,
        viewedArticles,
        inList: viewedArticles.includes(articleId),
      });

      if (!viewedArticles.includes(articleId)) {
        console.log("First view - making API call to increment views");

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${articleId}/increment-views/`
        );

        console.log("API Response:", response.data);

        if (response.data.success) {
          // Update everything atomically
          const newViewedArticles = [...viewedArticles, articleId];
          localStorage.setItem(
            "viewedArticles",
            JSON.stringify(newViewedArticles)
          );

          setHasTrackedView(true);

          // Update article view count in state
          if (article) {
            setArticle((prev) => ({
              ...prev,
              view_count: response.data.view_count,
            }));
          }

          console.log("View tracking completed successfully");
        }
      } else {
        console.log(
          "⏭View already tracked in this session - skipping increment"
        );
        setHasTrackedView(true);
      }
    } catch (error) {
      console.error("Error in view tracking:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    } finally {
      setIsTracking(false);
    }
  };

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching article data for:", articleId);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/retrieve/${articleId}/`
        );

        if (response.data.success) {
          const articleData = response.data.data;
          console.log("Article data loaded:", articleData);
          setArticle(articleData);

          // Fetch author details
          if (articleData.author) {
            try {
              console.log("Fetching author details for:", articleData.author);
              const authorResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/authors/${articleData.author}/`
              );
              if (authorResponse.data.success) {
                setAuthor(authorResponse.data.data);
                console.log("Author data loaded");
              } else {
                // Create fallback author object
                setAuthor({
                  id: articleData.author,
                  user_details: { fullname: "Unknown Author" },
                  bio: "",
                  social_links: {},
                  created_at: new Date().toISOString(),
                });
                console.log("Using fallback author data");
              }
            } catch (err) {
              console.error("Error fetching author:", err);
              // Create fallback author object
              setAuthor({
                id: articleData.author,
                user_details: { fullname: "Unknown Author" },
                bio: "",
                social_links: {},
                created_at: new Date().toISOString(),
              });
            }
          }

          // Fetch category details
          if (articleData.category) {
            try {
              console.log("Fetching category details");
              const categoriesResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/category/list/`
              );
              if (categoriesResponse.data.success) {
                const categoryData = categoriesResponse.data.data.find(
                  (cat) => cat.id === articleData.category
                );
                setCategory(categoryData);
                console.log("Category data loaded");
              }
            } catch (err) {
              console.error("Error fetching category:", err);
            }
          }
        } else {
          console.error("Article not found in response");
          setError("Article not found");
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to load article");
      } finally {
        setIsLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  // Track view when article is loaded
  useEffect(() => {
    if (article && !hasTrackedView && !isTracking) {
      console.log("Article loaded, starting view tracking...");
      trackArticleView();
    }
  }, [article, hasTrackedView, isTracking]);

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();

    if (!article?.id) {
      console.error("No article ID available");
      toast.error("Unable to save article");
      return;
    }

    // Check if user is logged in - USING useAuth user
    if (!user) {
      toast.custom(
        (t) => (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 max-w-sm w-full animate-in slide-in-from-top-5 duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Save this article
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Log in to bookmark
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t)}
                className="w-6 h-6 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  router.push("/login");
                  toast.dismiss(t);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-3 h-3" />
                Log In
              </button>
              <button
                onClick={() => toast.dismiss(t)}
                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        ),
        {
          duration: 6000,
          position: "top-center",
        }
      );
      return;
    }

    try {
      await toggleBookmark(article.id);
      // Show enhanced toast for immediate feedback
      toast.success(
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isBookmarked ? "bg-orange-500" : "bg-green-500"
            } shadow-lg`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-white" />
            ) : (
              <Bookmark className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {isBookmarked ? "Removed from Saved" : "Article Saved!"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isBookmarked
                ? "Article removed from your library"
                : "You can find it in your saved articles"}
            </p>
          </div>
        </div>,
        {
          position: "top-center",
          duration: 4000,
        }
      );
    } catch (err) {
      console.error("Bookmark error:", err);
      toast.error(
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <X className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              Save Failed
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {err.response?.data?.message || err.message || "Please try again"}
            </p>
          </div>
        </div>,
        {
          position: "top-center",
          duration: 5000,
        }
      );
    }
  };

  const handleShare = async () => {
    if (!article) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: window.location.href,
        });
        toast.success("Shared successfully!", {
          position: "top-center",
          duration: 3000,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  // Calculate read time based on content
  const calculateReadTime = (content) => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Build image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http")) return imagePath;

    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    const url = `${process.env.NEXT_PUBLIC_API_URL}${cleanPath}`;

    console.log("Image URL:", url);
    return url;
  };

  // Get author name from the new structure
  const getAuthorName = () => {
    if (!author) return "Unknown Author";
    return author.user_details?.fullname || "Unknown Author";
  };

  // Get author bio
  const getAuthorBio = () => {
    if (!author) return "";
    return author.bio || "";
  };

  // Get author avatar
  const getAuthorAvatar = () => {
    if (!author) return "/placeholder.svg";
    // If avatar is available in user_details, use it
    return author.user_details?.avatar || "/placeholder.svg";
  };

  // Render social links
  const renderSocialLinks = () => {
    if (!author || !author.social_links) return null;

    const { twitter, facebook, linkedin, instagram } = author.social_links;
    const socialLinks = [];

    if (twitter) {
      socialLinks.push(
        <a
          key="twitter"
          href={twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Twitter className="w-4 h-4" />
        </a>
      );
    }

    if (facebook) {
      socialLinks.push(
        <a
          key="facebook"
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Facebook className="w-4 h-4" />
        </a>
      );
    }

    if (linkedin) {
      socialLinks.push(
        <a
          key="linkedin"
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Linkedin className="w-4 h-4" />
        </a>
      );
    }

    if (instagram) {
      socialLinks.push(
        <a
          key="instagram"
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-pink-600 transition-colors p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20"
        >
          <Instagram className="w-4 h-4" />
        </a>
      );
    }

    if (socialLinks.length > 0) {
      return (
        <div className="flex items-center gap-3 mt-3">
          <span className="text-sm text-muted-foreground">Follow:</span>
          <div className="flex gap-1">{socialLinks}</div>
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-1/4 mb-6"></div>
              <div className="h-12 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded w-4/6 mb-6"></div>
              <div className="h-64 bg-linear-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl mb-6"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {error || "Article Not Found"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {error ? error : "The article you're looking for doesn't exist."}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Return to homepage
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ReadingProgressBar />

      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Category Badge */}
          {category && (
            <div className="mb-6">
              <a
                href={`/category/${
                  category.slug ||
                  category.name.toLowerCase().replace(/\s+/g, "-")
                }`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-xl hover:bg-primary/20 transition-all duration-200 hover:scale-105"
              >
                <Folder className="w-4 h-4" />
                {category.name}
              </a>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/60">
            {author && (
              <a
                href={`/author/${author.id}`}
                className="flex items-center gap-3 hover:text-primary transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all">
                  <img
                    src={getAuthorAvatar()}
                    alt={getAuthorName()}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="font-semibold">{getAuthorName()}</span>
              </a>
            )}
            <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>{calculateReadTime(article.content)} min read</span>
            </div>
            {/* ViewCounter now ONLY displays - no incrementing */}
            <ViewCounter articleId={article.id} />
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 rounded-xl transition-all hover:scale-105 font-medium shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>

              <button
                onClick={handleBookmarkClick}
                disabled={bookmarksLoading}
                className={`p-3 rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-105 ${
                  isBookmarked
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                    : "bg-accent hover:bg-primary hover:text-primary-foreground shadow-sm"
                }`}
                title={isBookmarked ? "Remove bookmark" : "Save article"}
              >
                {bookmarksLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 fill-current" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="relative w-full h-[400px] md:h-[500px] mb-10 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={getImageUrl(article.featured_image)}
                alt={article.title}
                fill
                className={`object-cover transition-all duration-700 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                priority
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.src = "/placeholder.svg";
                  setImageLoaded(true);
                }}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
              )}
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <div className="bg-linear-to-r from-accent/50 to-accent/30 border border-border/50 rounded-2xl p-8 mb-10">
              <p className="text-xl font-medium text-muted-foreground leading-relaxed text-center italic">
                "{article.excerpt}"
              </p>
            </div>
          )}

          {/* Article Content */}
          <div className="max-w-3xl mx-auto font-serif text-gray-800 dark:text-gray-100 text-[1.25rem] leading-[1.9] tracking-wide antialiased mb-12 px-6 md:px-8 selection:bg-rose-200 selection:text-gray-900 dark:selection:bg-rose-500/40 border-l-4 border-red-500 dark:border-red-400 pl-8 md:pl-12 relative">
            {/* Subtle glow effect */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-linear-to-r from-red-500/10 to-transparent dark:from-red-400/10 pointer-events-none"></div>

            {article.content
              .split(/\n\s*\n/)
              .filter((paragraph) => paragraph.trim() !== "")
              .map((paragraph, index) => (
                <p
                  key={index}
                  className={`
          mb-8 leading-relaxed text-foreground/90 whitespace-pre-line
          relative
          ${
            index === 0
              ? "first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:text-red-600 dark:first-letter:text-red-400 first-letter:font-serif first-letter:leading-none"
              : ""
          }
          ${
            index > 0
              ? "border-t border-gray-200 dark:border-gray-700 pt-6"
              : ""
          }
        `}
                >
                  {paragraph}
                </p>
              ))}
          </div>

          {/* Article Meta Footer */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-12 pt-8 border-t border-border/60">
            <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span>Published: {formatDate(article.created_at)}</span>
            </div>
            {article.updated_at !== article.created_at && (
              <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-lg">
                <span>Updated: {formatDate(article.updated_at)}</span>
              </div>
            )}
          </div>

          {/* Author Bio Card */}
          {author && (
            <div className="bg-linear-to-br from-accent/50 to-accent/30 border border-border/50 rounded-2xl p-8 mb-12">
              <div className="flex gap-6 items-start">
                <a href={`/author/${author.id}`} className="shrink-0 group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all shadow-lg">
                    <img
                      src={getAuthorAvatar()}
                      alt={getAuthorName()}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                </a>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-muted-foreground">
                      Written by
                    </span>
                    <a
                      href={`/author/${author.id}`}
                      className="text-xl font-bold text-primary hover:text-blue-600 transition-colors"
                    >
                      {getAuthorName()}
                    </a>
                  </div>
                  {getAuthorBio() && (
                    <p className="text-muted-foreground leading-relaxed mb-4 text-lg">
                      {getAuthorBio()}
                    </p>
                  )}
                  {renderSocialLinks()}
                  <a
                    href={`/author/${author.id}`}
                    className="inline-flex items-center gap-2 text-primary hover:text-blue-600 font-semibold mt-4 transition-colors group"
                  >
                    View all articles by {getAuthorName()}
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <CommentsSection articleId={article.id} />
        </article>
      </main>

      <Footer />

      {localToast && (
        <Toast
          message={localToast.message}
          type={localToast.type}
          onClose={() => setLocalToast(null)}
        />
      )}
    </div>
  );
}
