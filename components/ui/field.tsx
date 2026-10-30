import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "cn"

/** Label + control + hint/error wrapper. Wires ids for a11y. */
function Field({
  id,
  label,
  required,
  hint,
  error,
  counter,
  className,
  children,
}: {
  id: string
  label: React.ReactNode
  required?: boolean
  hint?: React.ReactNode
  error?: string | null
  counter?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {counter && <span className="text-caption text-muted-foreground tabular-nums">{counter}</span>}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export { Field }

