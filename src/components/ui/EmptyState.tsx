import { cn } from "@/lib/utils"
import { Button } from "./button"

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  variant?: 'terracotta' | 'sage' | 'honey'
}

/**
 * Warm, friendly empty state component
 * Uses theme colors and gentle animations
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = 'terracotta'
}: EmptyStateProps) {
  const variantStyles = {
    terracotta: 'bg-terracotta/5 border-terracotta/20',
    sage: 'bg-sage/5 border-sage/20',
    honey: 'bg-honey/5 border-honey/20'
  }

  const iconBgStyles = {
    terracotta: 'bg-terracotta/10',
    sage: 'bg-sage/10',
    honey: 'bg-honey/10'
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        "rounded-softer border-2 border-dashed",
        variantStyles[variant],
        "animate-fade-in",
        className
      )}
    >
      {/* Icon container with subtle animation */}
      <div
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mb-4",
          iconBgStyles[variant],
          "animate-gentle-pulse"
        )}
      >
        <span className="text-4xl" role="img" aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-lg text-charcoal mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-charcoal/60 text-sm max-w-xs">
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        <Button
          variant={variant === 'sage' ? 'secondary' : 'default'}
          onClick={action.onClick}
          className="mt-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * Pre-configured empty states for common use cases
 */

function EmptyMeals({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🍽️"
      title="No meals yet"
      description="Start building your recipe collection! Add your favorite meals to plan your week."
      action={onAdd ? { label: "+ Add First Meal", onClick: onAdd } : undefined}
      variant="terracotta"
    />
  )
}

function EmptyWeeklyPlan({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="📅"
      title="Nothing planned this week"
      description="Add meals from your library to start planning your week."
      action={onAdd ? { label: "+ Plan Your Week", onClick: onAdd } : undefined}
      variant="terracotta"
    />
  )
}

function EmptyGroceryList({ hasWeeklyPlan }: { hasWeeklyPlan?: boolean }) {
  return (
    <EmptyState
      icon="🛒"
      title="No items yet"
      description={
        hasWeeklyPlan
          ? "Your grocery list will auto-generate from your weekly plan."
          : "Add meals to your weekly plan to auto-generate your grocery list."
      }
      variant="sage"
    />
  )
}

function EmptyBakingEssentials({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🧁"
      title="No baking essentials"
      description="Track your pantry staples like flour, sugar, and butter to always be ready to bake!"
      action={onAdd ? { label: "+ Add Essential", onClick: onAdd } : undefined}
      variant="honey"
    />
  )
}

function EmptySnacks({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="🍿"
      title="No snacks yet"
      description="Add your favorite snacks or scan barcodes to build your snack collection."
      action={onAdd ? { label: "+ Add Snack", onClick: onAdd } : undefined}
      variant="sage"
    />
  )
}

function EmptyStaples({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="📦"
      title="No staples yet"
      description="Add items you always need like milk, eggs, or bread."
      action={onAdd ? { label: "+ Add Staple", onClick: onAdd } : undefined}
      variant="terracotta"
    />
  )
}

function EmptySearch() {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description="Try adjusting your search or filters."
      variant="terracotta"
    />
  )
}

function EmptyFilteredList({ filterName }: { filterName: string }) {
  return (
    <EmptyState
      icon="📋"
      title={`No ${filterName} items`}
      description={`There are no items matching "${filterName}" filter.`}
      variant="terracotta"
    />
  )
}

export {
  EmptyState,
  EmptyMeals,
  EmptyWeeklyPlan,
  EmptyGroceryList,
  EmptyBakingEssentials,
  EmptySnacks,
  EmptyStaples,
  EmptySearch,
  EmptyFilteredList
}
