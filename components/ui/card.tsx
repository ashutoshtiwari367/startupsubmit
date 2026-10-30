import * as React from "react"
import { cn } from "cn"

function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground",
        interactive &&
          "transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-md",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1 p-5 pb-0", className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  as: Comp = "h3",
  ...props
}: React.ComponentProps<"h3"> & { as?: "h2" | "h3" | "h4" }) {
  return (
    <Comp
      data-slot="card-title"
      className={cn("text-h4 text-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("p-5", className)} {...props} />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 rounded-b-xl border-t border-border bg-subtle px-5 py-3",
        className
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
