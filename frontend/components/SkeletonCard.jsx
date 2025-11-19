export default function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm border border-border animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-muted" />

      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="flex gap-3 mt-4">
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  )
}
