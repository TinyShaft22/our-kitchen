import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Our Kitchen Button Component
 *
 * Variants:
 * - default: Terracotta primary button
 * - secondary: Sage green button
 * - destructive: Red delete/danger button
 * - outline: Border only, transparent bg
 * - ghost: No border, transparent bg
 * - link: Text link style
 *
 * Sizes:
 * - default: h-10 standard
 * - sm: h-8 compact
 * - lg: h-11 touch-friendly (44px minimum)
 * - icon: Square icon button (40px)
 * - icon-sm: Small icon button (32px)
 * - icon-lg: Large icon button (44px)
 */
const buttonVariants = cva(
  // Base styles with spring transition and press feedback
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-soft text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:scale-[0.98] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Primary: Terracotta bg with cream text
        default: "bg-terracotta text-cream hover:bg-terracotta/90 active:bg-terracotta/80",
        // Destructive: Red for delete actions
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive",
        // Outline: Charcoal border with transparent bg
        outline:
          "border border-charcoal/20 bg-transparent text-charcoal hover:bg-charcoal/5 active:bg-charcoal/10",
        // Secondary: Sage green for secondary actions
        secondary:
          "bg-sage text-cream hover:bg-sage/90 active:bg-sage/80",
        // Ghost: No border, subtle hover
        ghost:
          "text-charcoal hover:bg-charcoal/5 active:bg-charcoal/10",
        // Link: Text link with underline
        link: "text-terracotta underline-offset-4 hover:underline",
      },
      size: {
        // Standard button (40px height)
        default: "h-10 px-4 py-2",
        // Compact button (32px height)
        sm: "h-8 px-3 text-xs",
        // Touch-friendly button (44px height - iOS minimum)
        lg: "h-11 px-6",
        // Square icon buttons
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Loading spinner component
function ButtonSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="16"
      height="16"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size, className }),
        // Spring timing function
        "[transition-timing-function:var(--ease-spring)]"
      )}
      {...props}
    >
      {loading ? (
        <>
          <ButtonSpinner className={size?.includes("icon") ? "" : "-ml-1"} />
          {!size?.includes("icon") && children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants, ButtonSpinner }
