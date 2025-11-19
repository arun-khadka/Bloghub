"use client";

import { useState, useEffect } from "react";
import { Search, X, Calendar, User, BookOpen } from "lucide-react";
import Image from "next/image";
import axios from "axios";

export default function LiveSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Search functionality
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setSearchError(null);
      return;
    }

    const searchArticles = async () => {
      try {
        setIsLoading(true);
        setSearchError(null);

        console.log("Searching for:", query);

        const searchUrl = `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/blog/search/?q=${encodeURIComponent(query)}`;
        console.log("API URL:", searchUrl);

        const searchResponse = await axios.get(searchUrl);

        console.log("Search response:", searchResponse.data);

        if (searchResponse.data.success) {
          setResults(searchResponse.data.data || []);
        } else {
          setResults([]);
          setSearchError(
            "Search failed: " + (searchResponse.data.message || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error searching articles:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });

        setResults([]);
        setSearchError(
          error.response?.data?.message ||
            `Failed to search articles: ${error.message}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchArticles, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSearchError(null);
    }
  }, [isOpen]);

  // Build image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}/${imagePath}`;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    if (!content) return "5 min";
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return `${minutes} min read`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles by title, content, category, or author..."
              className="w-full pl-12 pr-12 py-4 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-lg placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-card border border-border rounded-xl p-8 text-center animate-pulse">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Search className="w-4 h-4 animate-spin" />
                <span>Searching articles...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {searchError && !isLoading && (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="text-destructive mb-2">Search Error</div>
              <p className="text-sm text-muted-foreground">{searchError}</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && !searchError && results.length > 0 && (
            <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in slide-in-from-top duration-300">
              <div className="p-4 border-b border-border bg-accent/50">
                <p className="text-sm text-muted-foreground">
                  Found {results.length}{" "}
                  {results.length === 1 ? "article" : "articles"} for "{query}"
                </p>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {results.map((article) => (
                  <a
                    key={article.id}
                    href={`/article/${article.id}`}
                    className="flex items-start gap-4 p-4 hover:bg-accent transition-colors border-b border-border last:border-0 group"
                    onClick={onClose}
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                      <Image
                        src={getImageUrl(article.featured_image)}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {article.category_name && (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                            {article.category_name}
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.created_at)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{calculateReadTime(article.content)}</span>
                        </div>

                        {article.author_name && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{article.author_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading &&
            !searchError &&
            query.trim() !== "" &&
            results.length === 0 && (
              <div className="bg-card border border-border rounded-xl p-8 text-center animate-in fade-in duration-300">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  No articles found for "{query}"
                </p>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or check your spelling
                </p>
              </div>
            )}

          {/* Initial State - No Search Yet */}
          {!isLoading && !searchError && query.trim() === "" && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Start typing to search articles
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Search by title, content, category, or author name
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
