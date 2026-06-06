export default function Loading() {
  return (
    <div className="animate-pulse container mx-auto px-4 py-10 lg:py-16">
      <div className="lg:flex lg:gap-x-12">
        {/* Images skeleton */}
        <div className="w-full lg:w-[55%] space-y-4">
          <div className="aspect-square w-full rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-square w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
            ))}
          </div>
        </div>

        {/* Details skeleton */}
        <div className="w-full lg:w-[45%] mt-8 lg:mt-0 space-y-6">
          <div className="h-8 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-6 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-4/6 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Color swatches skeleton */}
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            ))}
          </div>

          {/* Size options skeleton */}
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-14 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            ))}
          </div>

          {/* Button skeleton */}
          <div className="h-14 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  )
}
