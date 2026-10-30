import * as React from "react"
import { cn } from "cn"

/** Shared field chrome so Input / Textarea / NativeSelect look identical. */
const fieldBase =
  "w-full min-w-0 rounded-lg border border-input bg-card text-sm text-foreground shadow-xs transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground/80 hover:border-border-strong focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/10"

function Input({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldBase, "h-10 px-3", className)}
      {...props}
    />
  )
}

export { Input, fieldBase }
