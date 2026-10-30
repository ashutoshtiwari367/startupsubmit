import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent font-medium whitespace-nowrap select-none transition-[color,background-color,border-color,box-shadow,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        secondary:
          "border-border bg-card text-foreground shadow-xs hover:border-border-strong hover:bg-muted",
        soft: "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft/70",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
        /* aliases kept for the shadcn primitives (toast, dialog) */
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover",
        outline:
          "border-border bg-card text-foreground shadow-xs hover:border-border-strong hover:bg-muted",
      },
      size: {
        xs: "h-7 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 px-3 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-[0.9375rem]",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-xs": "size-7 rounded-md",
        "icon-lg": "size-12",
        default: "h-10 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
