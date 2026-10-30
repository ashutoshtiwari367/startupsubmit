import * as React from "react"
import { cn } from "cn"

function EmptyState({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border-strong bg-subtle px-6 py-14 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-xs [&_svg]:size-5">
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1">
        <h3 className="text-h4">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  )
}

export { EmptyState }

