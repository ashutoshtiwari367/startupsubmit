import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "cn"

/**
 * Accordion built on native <details>/<summary>: keyboard accessible,
 * works without JavaScript and is fully server-rendered (good for FAQ SEO).
 */
function Accordion({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="accordion"
      className={cn("divide-y divide-border rounded-xl border border-border bg-card", className)}
      {...props}
    />
  )
}

function AccordionItem({
  question,
  children,
  defaultOpen,
  name,
}: {
  question: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  /** Same `name` on items makes them exclusive (one open at a time). */
  name?: string
}) {
  return (
    <details className="group" open={defaultOpen} name={name}>
      <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-5 py-4 text-left text-[0.9375rem] font-medium text-foreground transition-colors outline-none hover:bg-subtle focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
        {question}
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </details>
  )
}

export { Accordion, AccordionItem }

