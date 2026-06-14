/** Animated gray pulse block. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
}

/** Board card-shaped placeholder for the dashboard grid. */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="mt-4 h-3 w-20" />
      <Skeleton className="mt-3 h-2 w-full rounded-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  )
}

/** Task row-shaped placeholder for task lists. */
export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
      <Skeleton className="h-5 w-5 rounded-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
