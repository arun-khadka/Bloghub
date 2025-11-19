"use client";

import { TrendingUp, Eye, Flame, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TrendingSection({ articles }) {
  const router = useRouter();

  const handleArticleClick = (articleId) => {
    router.push(`/article/${articleId}`);
  };

  const handleCategoryClick = (categorySlug, e) => {
    e.stopPropagation();
    const slug = categorySlug.toLowerCase().replace(/\s+/g, "-");
    router.push(`/category/${slug}`);
  };

  // Get rank color based on position
  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return "from-orange-500 to-red-500 shadow-orange-200";
      case 1:
        return "from-purple-500 to-pink-500 shadow-purple-200";
      default:
        return "from-blue-500 to-cyan-500 shadow-blue-200";

    }
  };

  // Get rank icon based on position
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Flame className="w-3 h-3 text-white" />;
      case 1:
        return <Zap className="w-3 h-3 text-white" />;
      default:
        return <TrendingUp className="w-3 h-3 text-white" />;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border/60 p-6 sticky top-24 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header with gradient */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Trending Now</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Most popular stories this week
          </p>
        </div>
      </div>

      {/* Trending Articles */}
      <div className="space-y-4">
        {articles.map((article, index) => (
          <article
            key={article.id}
            onClick={() => handleArticleClick(article.id)}
            className="flex gap-4 p-3 rounded-lg border border-transparent hover:border-primary/20 hover:bg-accent/50 transition-all duration-200 group cursor-pointer"
          >
            {/* Rank Number with gradient */}
            <div className="shrink-0 relative">
              <div
                className={`w-9 h-9 rounded-xl bg-linear-to-br ${getRankColor(
                  index
                )} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}
              >
                {index < 4 && getRankIcon(index)}
              </div>
              {index < 4 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <button
                    onClick={(e) => handleCategoryClick(article.category, e)}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    {article.category}
                  </button>

                  <div className="flex items-center gap-1 text-blue-600">
                    <Eye className="w-3 h-3" />
                    <span className="font-medium">{article.views} views</span>
                  </div>
                </div>

                {/* Engagement indicator */}
                {article.views > 5000 && (
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      {[1, 2, 3].map((dot) => (
                        <div
                          key={dot}
                          className="w-1 h-1 bg-green-500 rounded-full animate-pulse"
                          style={{ animationDelay: `${dot * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Enhanced Newsletter Signup */}
      <div className="mt-8 pt-6 border-t border-border/40">
        <div className="text-center mb-4">
          <h3 className="text-sm font-bold text-foreground mb-2">
            📬 Stay Updated
          </h3>
          <p className="text-xs text-muted-foreground">
            Get trending stories delivered weekly
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <button className="w-full px-4 py-3 bg-linear-to-r from-primary to-primary/90 text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
            Subscribe to Newsletter
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          No spam, unsubscribe anytime
        </p>
      </div>
    </div>
  );
}
