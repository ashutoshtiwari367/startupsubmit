import * as React from "react"
import { cn } from "cn"

/**
 * Lightweight CSS tooltip. Shows on hover and keyboard focus. The trigger
 * must still carry its own aria-label — the tooltip is visual reinforcement.
 */
function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom"
  className?: string
}) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 shadow-md transition-opacity duration-150 group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2"
        )}
      >
        {content}
      </span>
    </span>
  )
}

export { Tooltip }

