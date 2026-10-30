import * as React from "react"
import { cn } from "cn"

/** Centered page container, max 1360px with slim side margins so components have space to expand. */
function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  )
}

/** Consistent vertical rhythm for page sections. */
function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("py-12 sm:py-16", className)} {...props} />
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  as: Heading = "h2",
  id,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  align?: "left" | "center"
  as?: "h1" | "h2"
  id?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn("flex flex-col gap-1.5", align === "center" && "items-center")}>
        {eyebrow && <p className="text-eyebrow text-primary">{eyebrow}</p>}
        <Heading id={id} className={Heading === "h1" ? "text-h1" : "text-h2"}>
          {title}
        </Heading>
        {description && (
          <p className={cn("text-body max-w-2xl text-muted-foreground", align === "center" && "mx-auto")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export { Container, Section, SectionHeader }
