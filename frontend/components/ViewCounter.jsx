"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import axios from "axios";

export default function ViewCounter({ articleId }) {
  const [views, setViews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const formatViews = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  useEffect(() => {
    const fetchViewCount = async () => {
      if (!articleId) return;

      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/blog/retrieve/${articleId}/`,
          {
            timeout: 5000,
          }
        );
        if (response.data.success) {
          setViews(response.data.data.view_count || 0);
        }
      } catch (error) {
        console.error("Error fetching view count:", error);
        // Keep the current views value, don't reset to 0
      } finally {
        setIsLoading(false);
      }
    };

    fetchViewCount();
  }, [articleId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Eye className="w-4 h-4 text-blue-600" />
        <span className="text-blue-600 font-medium text-sm">...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Eye className="w-4 h-4 text-blue-600" />
      <span className="text-blue-600 font-medium text-sm">
        {formatViews(views)} views
      </span>
    </div>
  );
}
