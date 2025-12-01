"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Newspaper,
  Users,
  Cpu,
  UtensilsCrossed,
  Trophy,
  Leaf,
  Palette,
  Heart,
  Smartphone,
  MapPin,
} from "lucide-react";

const iconMap = {
  newspaper: Newspaper,
  users: Users,
  cpu: Cpu,
  "utensils-crossed": UtensilsCrossed,
  trophy: Trophy,
  leaf: Leaf,
  palette: Palette,
  arts: Palette, 
  heart: Heart, 
  technology: Cpu, 
  sports: Trophy,
  lifestyle: Leaf, 
  mobile: Smartphone, 
  travel: MapPin,
};

export default function CategoryNav({ activeCategory = "all" }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
  
      let allCategories = [];
      let nextUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/category/list/`;
  
      // Fetch all pages
      while (nextUrl) {
        const response = await axios.get(nextUrl);
        
        if (response.data.results && response.data.results.success) {
          allCategories = [...allCategories, ...(response.data.results.data || [])];
          nextUrl = response.data.next; // Get next page URL
        } else {
          console.warn("API returned non-success:", response.data.results?.message);
          setError(response.data.results?.message || "Failed to fetch categories");
          setCategories(getFallbackCategories());
          return;
        }
      }
  
      setCategories(allCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      
      let errorMessage = "Failed to fetch categories";
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.results?.message || 
                       err.response?.data?.message || 
                       err.response?.data?.detail || 
                       err.message || 
                       "Failed to fetch categories";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setCategories(getFallbackCategories());
    } finally {
      setLoading(false);
    }
  };

  // Updated fallback categories to match the new API response structure
  const getFallbackCategories = () => [
    { id: 4, name: "Arts", slug: "arts", icon_name: "arts" },
    { id: 2, name: "Health", slug: "health", icon_name: "heart" },
    { id: 3, name: "Technology", slug: "technology", icon_name: "technology" },
  ];

  if (loading) {
    return (
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            {/* Loading skeleton */}
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap bg-background animate-pulse"
              >
                <div className="w-4 h-4 bg-accent rounded"></div>
                <div className="h-4 bg-accent rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
          {/* "All" Categories Link */}
          <a
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="text-sm font-medium">All</span>
          </a>

          {/* Dynamic Categories from API */}
          {categories.map((category) => {
            const Icon = category.icon_name
              ? iconMap[category.icon_name]
              : null;
            const isActive = activeCategory === category.slug;

            return (
              <a
                key={category.id}
                href={`/category/${category.slug}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="text-sm font-medium">{category.name}</span>
              </a>
            );
          })}

          {/* Error state (hidden but logged) */}
          {error && (
            <div className="sr-only" role="alert">
              Error loading categories: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}