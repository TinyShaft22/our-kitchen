import { useState } from 'react';
import type { Meal, WeeklyMealEntry } from '../../types';

interface WeeklyMealCardProps {
  entry: WeeklyMealEntry;
  meal: Meal | null; // Full meal data for ingredients
  alreadyHave: string[]; // Ingredient names (lowercase) that are marked as "already have"
  onEditServings: (entry: WeeklyMealEntry) => void;
  onRemove: (entry: WeeklyMealEntry) => void;
  onToggleAlreadyHave: (ingredientName: string) => void;
}

export function WeeklyMealCard({
  entry,
  meal,
  alreadyHave,
  onEditServings,
  onRemove,
  onToggleAlreadyHave,
}: WeeklyMealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mealName = meal?.name ?? 'Unknown Meal';
  const ingredients = meal?.ingredients ?? [];

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't toggle expand when clicking delete
    onRemove(entry);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't toggle expand when clicking edit
    onEditServings(entry);
  };

  const handleToggleIngredient = (ingredientName: string) => {
    onToggleAlreadyHave(ingredientName);
  };

  // Check if an ingredient is marked as "already have"
  const isAlreadyHave = (ingredientName: string): boolean => {
    return alreadyHave.includes(ingredientName.toLowerCase().trim());
  };

  // Count how many ingredients are marked as "already have"
  const alreadyHaveCount = ingredients.filter((ing) => isAlreadyHave(ing.name)).length;

  return (
    <div className="bg-white rounded-soft shadow-soft overflow-hidden">
      {/* Collapsed Header - Always visible, clickable to expand */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-cream/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`weekly-meal-${entry.mealId}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Small thumbnail if image exists */}
          {meal?.imageUrl && (
            <img
              src={meal.imageUrl}
              alt=""
              className="w-10 h-10 rounded-soft object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-charcoal truncate">
              {mealName}
            </h3>
            <p className="text-xs text-warm-gray">
              {entry.servings} servings • {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
              {alreadyHaveCount > 0 && (
                <span className="text-sage ml-1">
                  ({alreadyHaveCount} have)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2">
          {/* Expand indicator */}
          <span className="text-xs text-charcoal/50">
            {isExpanded ? '▲' : '▼'}
          </span>
          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-red-50 active:bg-red-100 transition-colors"
            aria-label={`Remove ${mealName} from week`}
          >
            <span className="text-lg">🗑️</span>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div id={`weekly-meal-${entry.mealId}`} className="border-t border-charcoal/10">
          {/* Details Section */}
          <div className="p-4 space-y-4">
            {/* Photo and Servings Row */}
            <div className="flex gap-4 items-start">
              {/* Square Photo */}
              {meal?.imageUrl && (
                <img
                  src={meal.imageUrl}
                  alt={mealName}
                  className="w-48 h-48 rounded-soft object-cover flex-shrink-0"
                />
              )}
              {/* Servings Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-charcoal/70">
                    <span className="font-medium text-charcoal">Servings:</span> {entry.servings}
                  </div>
                  <button
                    onClick={handleEditClick}
                    className="h-9 px-3 rounded-soft border border-charcoal/20 text-charcoal text-sm hover:bg-charcoal/5 transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-charcoal/50 mt-1">
                  How many people this recipe serves
                </p>
              </div>
            </div>

            {/* Ingredients with "Already Have" toggles */}
            <div>
              <h4 className="text-sm font-medium text-charcoal mb-2">
                Ingredients ({ingredients.length})
                {alreadyHaveCount > 0 && (
                  <span className="font-normal text-sage ml-1">
                    — {alreadyHaveCount} already have
                  </span>
                )}
              </h4>
              <p className="text-xs text-charcoal/50 mb-3">
                Check ingredients you already have — they won't appear on your grocery list.
              </p>
              <div className="space-y-2">
                {ingredients.map((ing, idx) => {
                  const hasIt = isAlreadyHave(ing.name);
                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-soft cursor-pointer transition-colors ${
                        hasIt ? 'bg-sage/20' : 'bg-cream hover:bg-cream-dark'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={hasIt}
                        onChange={() => handleToggleIngredient(ing.name)}
                        className="w-5 h-5 rounded border-charcoal/30 text-terracotta focus:ring-terracotta cursor-pointer"
                      />
                      <span className={`flex-1 text-sm ${hasIt ? 'line-through text-charcoal/50' : 'text-charcoal'}`}>
                        {ing.name}
                      </span>
                      {hasIt && (
                        <span className="text-xs text-sage font-medium">
                          Have it
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
