import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "cn"
import { fieldBase } from "@/components/ui/input"

/** Accessible native <select> styled with the design tokens. */
function NativeSelect({
  className,
  wrapperClassName,
  size = "md",
  children,
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & {
  wrapperClassName?: string
  size?: "sm" | "md"
}) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        data-slot="native-select"
        className={cn(
          fieldBase,
          "cursor-pointer appearance-none pr-9",
          size === "sm" ? "h-9 pl-3 text-[0.8125rem]" : "h-10 pl-3",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export { NativeSelect }

