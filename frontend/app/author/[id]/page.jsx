"use client";

import { use, useState, useEffect } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import ScrollReveal from "@/components/ScrollReveal";
import Pagination from "@/components/Pagination";
import {
  Mail,
  Calendar,
  Twitter,
  Linkedin,
  BookOpen,
  Facebook,
  Instagram,
  User,
  Filter,
  X,
} from "lucide-react";

const ARTICLES_PER_PAGE = 9;

export default function AuthorPage({ params }) {
  const { id } = use(params);
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]); // Store all articles for filtering
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch author data and articles
  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching author data for ID:", id);

        // Fetch author details
        const authorResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/authors/${id}/`
        );

        console.log("Author API Response:", authorResponse.data);

        if (authorResponse.data.success) {
          const authorData = authorResponse.data.data;
          setAuthor(authorData);

          // Fetch articles by this author
          await fetchAuthorArticles(id);
        } else {
          setError("Failed to fetch author data");
        }
      } catch (err) {
        console.error("Error fetching author:", err);
        setError(
          err.response?.data?.message || "Failed to load author profile"
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAuthorArticles = async (authorId) => {
      try {
        console.log("Fetching articles for author:", authorId);

        const articlesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/author/${authorId}/`
        );

        console.log("Articles API Response:", articlesResponse.data);

        if (articlesResponse.data.success) {
          const articlesData = articlesResponse.data.data || [];
          setAllArticles(articlesData); // Store all articles
          setArticles(articlesData); // Initialize with all articles
          setTotalArticles(articlesResponse.data.count || articlesData.length);

          // Extract unique categories from articles
          const uniqueCategories = extractCategories(articlesData);
          setCategories(uniqueCategories);
        } else {
          setAllArticles([]);
          setArticles([]);
          setTotalArticles(0);
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching author articles:", err);
        setAllArticles([]);
        setArticles([]);
        setTotalArticles(0);
        setCategories([]);
      }
    };

    if (id) {
      fetchAuthorData();
    }
  }, [id]);

  // Extract unique categories from articles
  const extractCategories = (articles) => {
    const categorySet = new Set();
    articles.forEach((article) => {
      if (article.category_name) {
        categorySet.add(article.category_name);
      }
    });

    const categoryList = Array.from(categorySet).map((category) => ({
      name: category,
      slug: category.toLowerCase().replace(/\s+/g, "-"),
    }));

    return [{ name: "All Categories", slug: "all" }, ...categoryList];
  };

  // Filter articles by category
  useEffect(() => {
    if (selectedCategory === "all") {
      setArticles(allArticles);
    } else {
      const filtered = allArticles.filter(
        (article) => article.category_name === selectedCategory
      );
      setArticles(filtered);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  }, [selectedCategory, allArticles]);

  // Calculate pagination
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = articles.slice(startIndex, endIndex);

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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === "all" ? "all" : category);
  };

  const clearFilter = () => {
    setSelectedCategory("all");
  };

  // Build image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}/${imagePath}`;
  };

  // Format articles for ArticleCard component
  const formatArticles = (articles) => {
    return articles.map((article) => ({
      ...article,
      image: getImageUrl(article.featured_image),
      date: article.created_at,
      readTime: calculateReadTime(article.content),
      category: article.category_name || "Uncategorized",
      authorId: author?.id,
    }));
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content ? content.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / wordsPerMinute)) + " min read";
  };

  // Format social media URLs for display
  const getSocialUsername = (url, platform) => {
    if (!url) return null;

    try {
      if (platform === "twitter" && url.includes("twitter.com/")) {
        return "@" + url.split("twitter.com/")[1]?.split("/")[0];
      }
      if (platform === "facebook" && url.includes("facebook.com/")) {
        return url.split("facebook.com/")[1]?.split("/")[0];
      }
      if (platform === "instagram" && url.includes("instagram.com/")) {
        return "@" + url.split("instagram.com/")[1]?.split("/")[0];
      }
      if (platform === "linkedin" && url.includes("linkedin.com/in/")) {
        return url.split("linkedin.com/in/")[1]?.split("/")[0];
      }
      return null;
    } catch {
      return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-12">
          {/* Loading Skeleton */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
              <div className="animate-pulse">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="shrink-0">
                    <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-80 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !author) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {error || "Author Not Found"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {error ? error : "The author you're looking for doesn't exist."}
            </p>
            <a href="/" className="text-primary hover:underline font-medium">
              Return to homepage
            </a>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const formattedArticles = formatArticles(currentArticles);
  const filteredArticleCount = articles.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Author Profile Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="shrink-0">
                <img
                  src={author.avatar || "/placeholder.svg"}
                  alt={author.user_details?.fullname || "Author"}
                  className="w-32 h-32 rounded-full border-4 border-primary/20"
                />
              </div>

              {/* Author Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-3">
                  {author.user_details?.fullname || "Unknown Author"}
                </h1>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {author.bio || "No bio available"}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      <strong className="text-foreground">
                        {totalArticles}
                      </strong>{" "}
                      articles published
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined{" "}
                      {new Date(author.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Contact & Social */}
                <div className="flex flex-wrap gap-3">
                  {author.user_details?.email && (
                    <a
                      href={`mailto:${author.user_details.email}`}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Contact</span>
                    </a>
                  )}

                  {/* Social Links */}
                  {author.social_links?.twitter && (
                    <a
                      href={author.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-all hover:scale-105"
                    >
                      <Twitter className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {getSocialUsername(
                          author.social_links.twitter,
                          "twitter"
                        ) || "Twitter"}
                      </span>
                    </a>
                  )}

                  {author.social_links?.facebook && (
                    <a
                      href={author.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-all hover:scale-105"
                    >
                      <Facebook className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {getSocialUsername(
                          author.social_links.facebook,
                          "facebook"
                        ) || "Facebook"}
                      </span>
                    </a>
                  )}

                  {author.social_links?.linkedin && (
                    <a
                      href={author.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-all hover:scale-105"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {getSocialUsername(
                          author.social_links.linkedin,
                          "linkedin"
                        ) || "LinkedIn"}
                      </span>
                    </a>
                  )}

                  {author.social_links?.instagram && (
                    <a
                      href={author.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-all hover:scale-105"
                    >
                      <Instagram className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {getSocialUsername(
                          author.social_links.instagram,
                          "instagram"
                        ) || "Instagram"}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Author's Articles */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Articles by {author.user_details?.fullname || "Unknown Author"}
              </h2>
              <p className="text-muted-foreground">
                Showing {filteredArticleCount} of {totalArticles}{" "}
                {totalArticles === 1 ? "article" : "articles"}
                {selectedCategory !== "all" && (
                  <span>
                    {" "}
                    in{" "}
                    <span className="font-semibold text-foreground">
                      {selectedCategory}
                    </span>
                  </span>
                )}
              </p>
            </div>

            {/* Category Filter */}
            {categories.length > 1 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Filter by:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-card text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:border-muted-foreground/30 shadow-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.slug} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {selectedCategory !== "all" && (
                    <button
                      onClick={clearFilter}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {formattedArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formattedArticles.map((article, index) => (
                  <ScrollReveal key={article.id} delay={index * 50}>
                    <ArticleCard article={article} />
                  </ScrollReveal>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
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
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {selectedCategory !== "all"
                  ? `No articles found in ${selectedCategory}`
                  : "No articles published yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedCategory !== "all"
                  ? "Try selecting a different category or clear the filter."
                  : "This author hasn't published any articles yet."}
              </p>
              {selectedCategory !== "all" && (
                <button
                  onClick={clearFilter}
                  className="text-primary hover:underline font-medium"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
