"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import Pagination from "@/components/Pagination";
import { Bookmark, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ARTICLES_PER_PAGE = 9;

export default function BookmarksPage() {
  const router = useRouter();
  const { user, bookmarks, bookmarksLoading, fetchBookmarks } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalArticles = bookmarks.length;
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentBookmarks = bookmarks.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);

    // Force scroll to top with multiple approaches
    const scrollToTop = () => {
      window.scrollTo(0, 0);
    };

    // Try immediate scroll
    scrollToTop();

    // Try again after a short delay
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
  };

  // Reset to page 1 when bookmarks change
  useEffect(() => {
    setCurrentPage(1);
  }, [bookmarks.length]);

  // Format bookmarks for ArticleCard
  const formatBookmarkForCard = (bookmark) => {
    // The article data should now be complete from the API
    const article = bookmark.article || bookmark;

    console.log("Processing bookmark:", bookmark);
    console.log("Article data:", article);

    // Build image URL
    const getImageUrl = (imagePath) => {
      if (!imagePath) return "/placeholder.svg";
      if (imagePath.startsWith("http")) return imagePath;
      if (imagePath.startsWith("/media/")) {
        const filename = imagePath.replace("/media/", "");
        return `${process.env.NEXT_PUBLIC_API_URL}/media/${filename}`;
      }
      if (imagePath.startsWith("/")) {
        return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
      }
      return "/placeholder.svg";
    };

    // Calculate read time
    const calculateReadTime = (content) => {
      if (!content) return "1 min read";
      const wordsPerMinute = 200;
      const words = content.split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
      return `${minutes} min read`;
    };

    // Get author name
    const getAuthorName = () => {
      if (article.author_name) return article.author_name;
      if (article.author?.user_details?.fullname)
        return article.author.user_details.fullname;
      return "Unknown Author";
    };

    // Get category name
    const getCategoryName = () => {
      if (article.category_name) return article.category_name;
      if (article.category?.name) return article.category.name;
      return "Uncategorized";
    };

    return {
      id: article.id,
      title: article.title || "Untitled Article",
      excerpt:
        article.excerpt ||
        article.content?.substring(0, 150) + "..." ||
        "No description available",
      image: getImageUrl(article.featured_image || article.image),
      date: article.created_at || article.published_at,
      readTime: calculateReadTime(article.content),
      author_name: getAuthorName(),
      category: getCategoryName(),
      view_count: article.view_count || 0,
      content: article.content,
    };
  };

  const bookmarkedArticles = currentBookmarks.map((bookmark) =>
    formatBookmarkForCard(bookmark)
  );

  // Refresh bookmarks
  const handleRefresh = () => {
    fetchBookmarks();
    setCurrentPage(1); // Reset to first page on refresh
  };

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Bookmark className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Saved Articles
                </h1>
                <p className="text-muted-foreground">
                  Your bookmarked articles for later reading
                </p>
              </div>
            </div>
            <div className="text-center py-16">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Please log in to view bookmarks
              </h2>
              <p className="text-muted-foreground mb-6">
                Sign in to save and manage your favorite articles
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push("/login")}
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="inline-block px-6 py-3 border border-border font-medium rounded-lg hover:bg-accent transition-colors"
                >
                  Browse Articles
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with refresh button and stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Bookmark className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Saved Articles
                </h1>
                <p className="text-muted-foreground">
                  {totalArticles} {totalArticles === 1 ? "article" : "articles"}{" "}
                  saved
                  {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={bookmarksLoading}
                className="flex items-center gap-2 px-4 py-2 outline outline-blue-200 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    bookmarksLoading ? "animate-spin" : ""
                  }`}
                />
                {bookmarksLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {bookmarksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-card rounded-lg overflow-hidden shadow-sm border border-border animate-pulse"
                >
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
              ))}
            </div>
          ) : bookmarkedArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {bookmarkedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No saved articles yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Start bookmarking articles you want to read later
              </p>
              <button
                onClick={() => router.push("/")}
                className="inline-block px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Articles
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
