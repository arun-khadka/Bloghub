"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryNav from "@/components/CategoryNav";
import ArticleCard from "@/components/ArticleCard";
import ScrollReveal from "@/components/ScrollReveal";
import Pagination from "@/components/Pagination";
import {
  Newspaper,
  Users,
  Cpu,
  UtensilsCrossed,
  Trophy,
  Leaf,
  Palette,
  Folder,
  Heart,
} from "lucide-react";

const iconMap = {
  newspaper: Newspaper,
  users: Users,
  cpu: Cpu,
  food: UtensilsCrossed,
  trophy: Trophy,
  leaf: Leaf,
  palette: Palette,
  heart: Heart,
  technology: Cpu,
  arts: Palette,
  health: Heart,
  sports: Trophy,
};

const ARTICLES_PER_PAGE = 9;

export default function CategoryPage() {
  const params = useParams();
  const { slug } = params;

  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch category articles
  useEffect(() => {
    const fetchCategoryArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/category/${slug}/`
        );

        if (response.data.success) {
          setCategory(response.data.data.category);
          setArticles(response.data.data.articles.results || []);
          setTotalArticles(response.data.data.articles.count || 0);
        } else {
          setError(response.data.message || "Category not found");
        }
      } catch (err) {
        console.error("Error fetching category articles:", err);
        setError(
          err.response?.data?.message || "Failed to load category articles"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchCategoryArticles();
    }
  }, [slug]);

  // Calculate pagination based on API pagination
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
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
      category: category?.name || "Uncategorized",
    }));
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content ? content.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / wordsPerMinute)) + " min read";
  };

  // Get appropriate icon for category
  const getCategoryIcon = () => {
    if (!category) return Folder;

    const iconKey = category.name?.toLowerCase() || category.icon_name;
    return iconMap[iconKey] || Folder;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <CategoryNav activeCategory={slug} />

        <main className="flex-1 container mx-auto px-4 py-12">
          {/* Loading Skeleton */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-3 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto animate-pulse"></div>
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

  if (error || !category) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <CategoryNav activeCategory={slug} />

        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {error || "Category Not Found"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {error ? error : "The category you're looking for doesn't exist."}
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
  const Icon = getCategoryIcon();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <CategoryNav activeCategory={slug} />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Category Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-3">
              {category.description}
            </p>
          )}
          <p className="text-lg text-muted-foreground">
            {totalArticles} {totalArticles === 1 ? "article" : "articles"} found
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
          </p>
        </div>

        {/* Articles Grid */}
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
            <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No articles found
            </h3>
            <p className="text-muted-foreground">
              There are no published articles in this category yet.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
