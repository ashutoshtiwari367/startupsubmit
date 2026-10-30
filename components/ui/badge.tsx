import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border font-medium whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted text-foreground/80",
        outline: "border-border bg-card text-muted-foreground",
        primary: "border-transparent bg-primary-soft text-primary-soft-foreground",
        success: "border-transparent bg-success-soft text-success",
        info: "border-transparent bg-info-soft text-info",
        warning: "border-transparent bg-warning-soft text-warning",
        danger: "border-transparent bg-destructive-soft text-destructive",
        solid: "border-transparent bg-primary text-primary-foreground",
        /* aliases kept for shadcn compatibility */
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-border bg-muted text-foreground/80",
        destructive: "border-transparent bg-destructive-soft text-destructive",
      },
      size: {
        sm: "h-5 px-2 text-[0.6875rem]",
        md: "h-6 px-2.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "sm",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
