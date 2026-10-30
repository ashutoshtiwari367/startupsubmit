import * as React from "react"
import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/** Placeholder matching the leaderboard row layout. */
function ProductRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <Skeleton className="hidden h-5 w-6 sm:block" />
      <Skeleton className="size-12 rounded-xl" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3.5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-16 w-14 rounded-lg" />
    </div>
  )
}

export { Skeleton, ProductRowSkeleton }

