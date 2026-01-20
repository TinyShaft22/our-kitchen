import { cn } from "@/lib/utils"

/**
 * Skeleton loading placeholder with warm shimmer effect
 * Uses honey/terracotta tones for Our Kitchen theme
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-soft bg-charcoal/5",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-shimmer before:bg-gradient-to-r",
        "before:from-transparent before:via-honey/20 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

/**
 * Skeleton card for meal/recipe items (image + text)
 */
function MealCardSkeleton() {
  return (
    <div className="bg-white rounded-soft shadow-soft p-4 animate-fade-in">
      <div className="flex gap-4">
        {/* Image placeholder */}
        <Skeleton className="w-20 h-20 rounded-soft shrink-0" />
        {/* Content */}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for grid view meal tiles
 */
function MealGridSkeleton() {
  return (
    <div className="animate-fade-in">
      <Skeleton className="aspect-square rounded-soft" />
    </div>
  )
}

/**
 * Skeleton for grocery items
 */
function GroceryItemSkeleton() {
  return (
    <div className="bg-white rounded-soft shadow-soft p-3 flex items-center gap-3 animate-fade-in">
      <Skeleton className="w-6 h-6 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="w-8 h-8 rounded-soft shrink-0" />
    </div>
  )
}

/**
 * Skeleton for weekly plan cards
 */
function WeeklyPlanSkeleton() {
  return (
    <div className="bg-white rounded-soft shadow-soft p-4 animate-fade-in">
      <div className="flex gap-3">
        <Skeleton className="w-16 h-16 rounded-soft shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="w-8 h-8 rounded-soft shrink-0" />
      </div>
    </div>
  )
}

/**
 * Skeleton for baking essential cards
 */
function BakingEssentialSkeleton() {
  return (
    <div className="bg-white rounded-soft shadow-soft p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-20 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-soft" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for staple cards
 */
function StapleSkeleton() {
  return (
    <div className="bg-white rounded-soft shadow-soft p-3 flex items-center gap-3 animate-fade-in">
      <Skeleton className="w-10 h-6 rounded-full shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="w-6 h-6 rounded-soft shrink-0" />
    </div>
  )
}

/**
 * Generic list skeleton with configurable count
 */
interface ListSkeletonProps {
  count?: number
  ItemComponent?: React.ComponentType
}

function ListSkeleton({ count = 3, ItemComponent = MealCardSkeleton }: ListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <ItemComponent />
        </div>
      ))}
    </div>
  )
}

/**
 * Grid skeleton for meal grid view
 */
interface GridSkeletonProps {
  count?: number
  columns?: number
}

function GridSkeleton({ count = 6, columns = 6 }: GridSkeletonProps) {
  return (
    <div className={`grid grid-cols-${columns} gap-1.5`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <MealGridSkeleton />
        </div>
      ))}
    </div>
  )
}

export {
  Skeleton,
  MealCardSkeleton,
  MealGridSkeleton,
  GroceryItemSkeleton,
  WeeklyPlanSkeleton,
  BakingEssentialSkeleton,
  StapleSkeleton,
  ListSkeleton,
  GridSkeleton
}
