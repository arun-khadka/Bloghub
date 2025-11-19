"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedArticle from "@/components/FeaturedArticle";
import TrendingSection from "@/components/TrendingSection";
import CategoryNav from "@/components/CategoryNav";
import ScrollReveal from "@/components/ScrollReveal";
import SkeletonCard from "@/components/SkeletonCard";
import ArticleCard from "@/components/ArticleCard";
import Pagination from "@/components/Pagination";

const ARTICLES_PER_PAGE = 6;

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [error, setError] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);

  // Fetch latest articles from API
  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/latest/`
        );

        console.log("API Response:", response.data);

        if (response.data.success) {
          const articlesData = response.data.data.articles || [];
          console.log("Articles data:", articlesData);
          setArticles(articlesData);

          // Set the first article as featured
          if (articlesData.length > 0) {
            setFeaturedArticle(articlesData[0]);
          }

          // Generate trending articles from the data
          generateTrendingArticles(articlesData);
        } else {
          throw new Error(response.data.message || "Failed to fetch articles");
        }
      } catch (err) {
        console.error("Error fetching latest articles:", err);
        setError(err.response?.data?.message || "Failed to load articles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestArticles();
  }, []);

  // Generate trending articles from actual data
  const generateTrendingArticles = (articlesData) => {
    if (!articlesData || articlesData.length === 0) {
      setTrendingArticles([]);
      return;
    }

    // Sort articles by view_count (highest first) and take top 4
    const sortedByViews = [...articlesData]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 4);

    // Format for TrendingSection component
    const formattedTrending = sortedByViews.map((article) => ({
      id: article.id,
      title: article.title,
      views: formatViewCount(article.view_count),
      category: article.category_name || "General",
      // Add URL for navigation
      url: `/article/${article.id}`,
    }));

    console.log("Trending articles:", formattedTrending);
    setTrendingArticles(formattedTrending);
  };

  // Format view count to readable format
  const formatViewCount = (viewCount) => {
    if (!viewCount || viewCount === 0) return "0";
    if (viewCount < 1000) return viewCount.toString();
    if (viewCount < 10000) return `${(viewCount / 1000).toFixed(1)}K`;
    if (viewCount < 1000000) return `${Math.round(viewCount / 1000)}K`;
    return `${(viewCount / 1000000).toFixed(1)}M`;
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

  // Calculate read time
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content ? content.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / wordsPerMinute)) + " min read";
  };

  // Format articles for ArticleCard component
  const formatArticle = (article) => {
    const formatted = {
      ...article,
      image: getImageUrl(article.featured_image),
      date: article.created_at,
      readTime: calculateReadTime(article.content),
      category: article.category_name || "Uncategorized",
    };

    return formatted;
  };

  // Get articles for current page (excluding featured article)
  const regularArticles = featuredArticle
    ? articles.filter((article) => article.id !== featuredArticle.id)
    : articles;

  // Calculate pagination
  const totalPages = Math.ceil(regularArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = regularArticles
    .slice(startIndex, endIndex)
    .map(formatArticle);

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

  // Format featured article if exists
  const formattedFeaturedArticle = featuredArticle
    ? formatArticle(featuredArticle)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Category Navigation */}
        <CategoryNav activeCategory="all" />

        {/* Featured Article Section */}
        {formattedFeaturedArticle && (
          <section className="container mx-auto px-4 py-8">
            <ScrollReveal>
              <a
                href={`/article/${formattedFeaturedArticle.id}`}
                className="block"
              >
                <FeaturedArticle article={formattedFeaturedArticle} />
              </a>
            </ScrollReveal>
          </section>
        )}

        {/* Main Content Grid */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles Grid - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-primary/20">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-1">
                    {isLoading ? "Loading..." : "Latest Stories"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isLoading
                      ? "Fetching the latest articles..."
                      : "Stay updated with our newest articles"}
                  </p>
                </div>
              </div>

              {error ? (
                <div className="text-center py-12">
                  <div className="text-destructive mb-4">
                    <p className="text-lg font-semibold">
                      Failed to load articles
                    </p>
                    <p className="text-sm mt-2">{error}</p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : currentArticles.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentArticles.map((article, index) => (
                      <ScrollReveal key={article.id} delay={index * 50}>
                        <ArticleCard article={article} />
                      </ScrollReveal>
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
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No articles found.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back later for new content.
                  </p>
                </div>
              )}
            </div>

            {/* Trending Sidebar - Takes 1 column */}
            <div className="lg:col-span-1">
              <ScrollReveal delay={200}>
                <TrendingSection
                  articles={trendingArticles}
                  isLoading={isLoading}
                />
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
