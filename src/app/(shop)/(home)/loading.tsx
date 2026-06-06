export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[60vh] w-full bg-neutral-200 dark:bg-neutral-800 rounded-none" />

      {/* Section skeleton */}
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          ))}
        </div>

        {/* Banner skeleton */}
        <div className="h-48 w-full rounded-3xl bg-neutral-200 dark:bg-neutral-800" />

        {/* Second grid skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
