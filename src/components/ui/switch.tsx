"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Our Kitchen themed switch - larger for mobile touch targets
        "peer inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none",
        // States - terracotta when checked, charcoal/20 when unchecked
        "data-[state=checked]:bg-terracotta data-[state=unchecked]:bg-charcoal/20",
        // Focus ring
        "focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // White thumb with shadow
          "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform",
          // Position - translate full width minus thumb width minus padding
          "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
