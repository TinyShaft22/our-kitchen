import { useState } from 'react';
import type { Meal } from '../../types';

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}

export function MealCard({ meal, onEdit, onDelete }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-soft shadow-soft overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-charcoal truncate">
              {meal.name}
            </h3>
            <p className="text-sm text-warm-gray mt-1">
              {meal.servings} servings • {meal.ingredients.length} ingredient
              {meal.ingredients.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => onEdit(meal)}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream-dark active:bg-cream-dark transition-colors"
              aria-label={`Edit ${meal.name}`}
            >
              <span className="text-lg">✏️</span>
            </button>
            <button
              onClick={() => onDelete(meal)}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream-dark active:bg-cream-dark transition-colors"
              aria-label={`Delete ${meal.name}`}
            >
              <span className="text-lg">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Instructions Section */}
      {meal.instructions && meal.instructions.trim() && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-10 px-4 flex items-center justify-between border-t border-charcoal/10 text-sm text-charcoal/70 hover:bg-cream/50 active:bg-cream/50 transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`instructions-${meal.id}`}
          >
            <span>📝 Instructions</span>
            <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
          </button>
          {isExpanded && (
            <div
              id={`instructions-${meal.id}`}
              className="px-4 pb-4 bg-cream/50 rounded-b-soft"
            >
              <p className="text-sm text-charcoal/80 whitespace-pre-wrap">
                {meal.instructions}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
