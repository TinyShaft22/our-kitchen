import type { Meal } from '../../types';

interface MealGridCardProps {
  meal: Meal;
  onSelect: (meal: Meal) => void;
}

/**
 * Visual grid card for meals - large image with small name overlay
 * Designed for visual browsing of recipes
 *
 * Uses aspect-square for proper sizing in CSS grid containers
 * (replaces the old paddingBottom: '100%' hack which fails in grid/flex contexts)
 */
export function MealGridCard({ meal, onSelect }: MealGridCardProps) {
  return (
    <button
      onClick={() => onSelect(meal)}
      className="relative w-full aspect-square rounded-soft overflow-hidden shadow-soft hover:shadow-lifted transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 bg-cream"
      style={{ transitionTimingFunction: 'var(--ease-spring)' }}
    >
      {/* Image or Placeholder */}
      {meal.imageUrl ? (
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-terracotta/10 to-sage/20 flex items-center justify-center">
          <div className="text-center px-3">
            <span className="text-4xl mb-2 block opacity-40">
              {meal.isBaking ? '🧁' : '🍽️'}
            </span>
            <span className="text-charcoal/30 text-xs font-medium">No photo</span>
          </div>
        </div>
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />

      {/* Name and info overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <h3 className="font-display font-semibold text-white text-sm leading-tight line-clamp-2 drop-shadow-md">
          {meal.name}
        </h3>
        <p className="text-white/70 text-xs mt-1 drop-shadow">
          {meal.isBaking ? `Qty: ${meal.servings}` : `${meal.servings} servings`}
        </p>
      </div>

      {/* Hover indicator */}
      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
        <span className="text-charcoal text-sm">→</span>
      </div>
    </button>
  );
}
