export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header spacer */}
      <div className="h-24 w-full bg-primary-50 dark:bg-white/10" />

      <div className="container mx-auto px-4 py-16 space-y-8">
        {/* Filter bar skeleton */}
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-5 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
