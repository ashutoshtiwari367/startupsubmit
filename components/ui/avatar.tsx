import * as React from "react"
import { cn } from "cn"
import { initials } from "@/lib/format"

/** Initials avatar (no external image dependency). */
function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary-soft-foreground select-none",
        size <= 28 ? "size-7 text-[0.6875rem]" : size <= 36 ? "size-9 text-xs" : "size-11 text-sm",
        className
      )}
    >
      {initials(name) || "?"}
    </span>
  )
}

export { Avatar }

