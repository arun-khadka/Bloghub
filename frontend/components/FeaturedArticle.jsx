import { Calendar, Clock, User, ArrowRight, Share2 } from "lucide-react";
import Image from "next/image";

export default function FeaturedArticle({ article }) {
  return (
    <article className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="grid md:grid-cols-2 gap-0 relative z-10">
        {/* Image Section */}
        <div className="relative h-72 md:h-full min-h-[400px] overflow-hidden">
          <Image
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-6 left-6 flex flex-wrap gap-2">
            <span className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-lg backdrop-blur-sm">
              Featured
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-10 flex flex-col justify-center bg-linear-to-br from-card to-card/95">
          {/* Category */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full border border-primary/20">
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight tracking-tight text-balance group-hover:text-primary/90 transition-colors duration-300">
            {article.title}
          </h2>

          {/* Excerpt */}
          <p className="text-muted-foreground text-lg lg:text-xl mb-8 leading-relaxed tracking-wide line-clamp-3">
            {article.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2 bg-accent/50 rounded-full px-4 py-2">
              <User className="w-4 h-4" />
              <span className="font-medium">{article.author_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                {new Date(article.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-accent/50 rounded-full px-4 py-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{article.readTime}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button className="group/btn relative self-start overflow-hidden px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <span className="flex items-center gap-3 relative z-10">
              Read Full Story
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
            </span>

            {/* Button Hover Effect */}
            <div className="absolute inset-0 bg-linear-to-r from-primary to-primary/70 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </article>
  );
}
