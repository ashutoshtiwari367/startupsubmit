import * as React from "react"
import { cn } from "cn"

/** Centered page container, max 1200px with generous side breathing room. */
function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1240px] px-6 sm:px-10 lg:px-12", className)}
      {...props}
    />
  )
}

/** Consistent vertical rhythm for page sections. */
function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("py-14 sm:py-20", className)} {...props} />
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
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn("flex flex-col gap-2", align === "center" && "items-center")}>
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

