"use client";

import {
  Calendar,
  Clock,
  User,
  Bookmark,
  BookmarkCheck,
  X,
  LogIn,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ViewCounter from "./ViewCounter";
import { toast } from "sonner";

export default function ArticleCard({ article }) {
  const router = useRouter();
  const [authorDetails, setAuthorDetails] = useState(null);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Use AuthContext for user and bookmark state
  const { user, isArticleBookmarked, toggleBookmark, bookmarksLoading } =
    useAuth();

  // Safely check if current article is bookmarked
  const isBookmarked = article?.id ? isArticleBookmarked(article.id) : false;

  const handleCardClick = () => {
    if (article?.id) {
      router.push(`/article/${article.id}`);
    }
  };

  const handleBookmarkClick = async (e) => {
    e.stopPropagation();

    if (!article?.id) {
      console.error("No article ID available");
      toast.error("Unable to save article");
      return;
    }

    // Check if user is logged in
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
                className="w-6 h-6 rounded-lg hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
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
                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 hover:rounded-lg dark:hover:text-gray-200 text-sm font-medium transition-colors"
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

    setIsBookmarking(true);
    try {
      await toggleBookmark(article.id);
      // Show success toast with enhanced styling
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
    } finally {
      setIsBookmarking(false);
    }
  };

  // Fetch author details
  useEffect(() => {
    if (!article) return;

    const fetchAuthorDetails = async () => {
      if (article.author_name) {
        setAuthorDetails({
          id: article.author,
          user_details: { fullname: article.author_name },
        });
        return;
      }

      if (article.author?.user_details?.fullname) {
        setAuthorDetails(article.author);
        return;
      }

      if (article.author && typeof article.author === "number") {
        try {
          setIsLoadingAuthor(true);
          const authorResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/authors/${article.author}/`
          );

          if (authorResponse.ok) {
            const data = await authorResponse.json();
            if (data.success) {
              setAuthorDetails(data.data);
            } else {
              setAuthorDetails({
                id: article.author,
                user_details: { fullname: "Unknown Author" },
              });
            }
          } else {
            setAuthorDetails({
              id: article.author,
              user_details: { fullname: "Unknown Author" },
            });
          }
        } catch (err) {
          console.error("Error fetching author:", err);
          setAuthorDetails({
            id: article.author,
            user_details: { fullname: "Unknown Author" },
          });
        } finally {
          setIsLoadingAuthor(false);
        }
      } else if (article.authorId) {
        try {
          setIsLoadingAuthor(true);
          const authorResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/authors/${article.authorId}/`
          );

          if (authorResponse.ok) {
            const data = await authorResponse.json();
            if (data.success) {
              setAuthorDetails(data.data);
            } else {
              setAuthorDetails({
                id: article.authorId,
                user_details: { fullname: "Unknown Author" },
              });
            }
          } else {
            setAuthorDetails({
              id: article.authorId,
              user_details: { fullname: "Unknown Author" },
            });
          }
        } catch (err) {
          console.error("Error fetching author:", err);
          setAuthorDetails({
            id: article.authorId,
            user_details: { fullname: "Unknown Author" },
          });
        } finally {
          setIsLoadingAuthor(false);
        }
      } else {
        setAuthorDetails({
          id: null,
          user_details: { fullname: "Unknown Author" },
        });
      }
    };

    fetchAuthorDetails();
  }, [article]);

  const getAuthorName = () => {
    if (!article) return "Unknown Author";
    if (article.author_name) return article.author_name;
    if (authorDetails?.user_details?.fullname)
      return authorDetails.user_details.fullname;
    if (article.author?.user_details?.fullname)
      return article.author.user_details.fullname;
    if (article.author && isLoadingAuthor) return "Loading...";
    return "Unknown Author";
  };

  const getAuthorId = () => {
    if (!article) return null;
    if (article.author && typeof article.author === "number")
      return article.author;
    if (authorDetails?.id) return authorDetails.id;
    if (article.author?.id) return article.author.id;
    if (article.authorId) return article.authorId;
    return null;
  };

  // Calculate read time if not provided
  const getReadTime = () => {
    if (!article) return "1 min read";
    if (article.readTime) return article.readTime;
    if (article.content) {
      const wordsPerMinute = 200;
      const words = article.content.split(/\s+/).length;
      return Math.max(1, Math.ceil(words / wordsPerMinute)) + " min read";
    }
    return "1 min read";
  };

  // Format date
  const getFormattedDate = () => {
    if (!article?.date) return "Unknown date";
    return new Date(article.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get image URL
  const getImageUrl = () => {
    if (!article?.image) return "/placeholder.svg";
    if (article.image.startsWith("http")) return article.image;

    if (article.image.startsWith("/media/articles_image_path/")) {
      const filename = article.image.replace("/media/articles_image_path/", "");
      return `${process.env.NEXT_PUBLIC_API_URL}/media/${filename}`;
    }

    return "/placeholder.svg";
  };

  if (!article) {
    return (
      <div className="bg-card rounded-lg overflow-hidden shadow-sm border border-border animate-pulse">
        <div className="h-48 bg-muted"></div>
        <div className="p-5">
          <div className="h-6 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded mb-4"></div>
          <div className="flex gap-3">
            <div className="h-3 bg-muted rounded w-20"></div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article
      onClick={handleCardClick}
      className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-border hover:border-primary/50 hover:-translate-y-1 cursor-pointer relative"
    >
      {/* Bookmark Button */}
      <button
        onClick={handleBookmarkClick}
        disabled={isBookmarking || bookmarksLoading}
        className={`absolute top-3 right-3 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full transition-all duration-300 disabled:opacity-50 ${
          isBookmarked
            ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            : "hover:bg-primary hover:text-primary-foreground bg-background/80"
        }`}
        title={isBookmarked ? "Remove bookmark" : "Save article"}
      >
        {isBookmarking ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        ) : isBookmarked ? (
          <BookmarkCheck className="w-4 h-4 fill-current" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
      </button>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={article.title || "Article image"}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            e.target.src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded backdrop-blur-sm">
            {article.category || "Uncategorized"}
          </span>
        </div>

        {/* Trending Badge */}
        {article.view_count && article.view_count > 10000 && (
          <div className="absolute top-3 right-12">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded backdrop-blur-sm animate-pulse">
              🔥 Trending
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors text-balance line-clamp-2">
          {article.title || "Untitled Article"}
        </h3>

        {/* Excerpt */}
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">
          {article.excerpt || "No excerpt available"}
        </p>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {/* Author */}
          {getAuthorId() ? (
            <Link
              href={`/author/${getAuthorId()}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <User className="w-3 h-3" />
              <span className={isLoadingAuthor ? "animate-pulse" : ""}>
                {getAuthorName()}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{getAuthorName()}</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{getFormattedDate()}</span>
          </div>

          {/* Read Time */}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{getReadTime()}</span>
          </div>

          {/* View Counter */}
          {article.id && <ViewCounter articleId={article.id} />}
        </div>
      </div>
    </article>
  );
}
