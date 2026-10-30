"use client"

import * as React from "react"
import { cn } from "cn"

export interface SegmentedOption<T extends string> {
  value: T
  label: React.ReactNode
  /** Accessible label when `label` is an icon */
  ariaLabel?: string
}

/**
 * Pill-style tab group (role="tablist"). Arrow keys move between options.
 * Used for period tabs, pricing filters and view toggles.
 */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  size?: "sm" | "md"
  className?: string
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    e.preventDefault()
    const dir = e.key === "ArrowRight" ? 1 : -1
    const next = (index + dir + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5",
        className
      )}
    >
      {options.map((opt, i) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={opt.ariaLabel}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-[color,background-color,box-shadow] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-[0.8125rem]",
              active
                ? "bg-card text-foreground shadow-xs ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export { SegmentedControl }

