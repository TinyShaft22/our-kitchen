import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Our Kitchen themed input
        "h-11 w-full min-w-0 rounded-soft border border-charcoal/20 bg-white px-3 text-base text-charcoal",
        "placeholder:text-charcoal/40 selection:bg-terracotta/20 selection:text-charcoal",
        "transition-[color,box-shadow,border-color] outline-none",
        // Focus state - terracotta ring
        "focus-visible:border-terracotta focus-visible:ring-1 focus-visible:ring-terracotta",
        // File inputs
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Invalid state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
