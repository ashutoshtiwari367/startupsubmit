import * as React from "react"
import { cn } from "cn"
import { fieldBase } from "@/components/ui/input"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldBase, "min-h-28 resize-y px-3 py-2.5 leading-relaxed", className)}
      {...props}
    />
  )
}

export { Textarea }

