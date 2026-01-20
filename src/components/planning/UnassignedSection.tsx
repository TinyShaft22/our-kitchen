import type { WeeklyMealEntry, WeeklySnackEntry, Meal, Snack } from '../../types';

interface UnassignedSectionProps {
  meals: WeeklyMealEntry[];
  snacks: WeeklySnackEntry[];
  getMealById: (mealId: string) => Meal | null;
  getSnackById: (snackId: string) => Snack | null;
}

export function UnassignedSection({
  meals,
  snacks,
  getMealById,
  getSnackById,
}: UnassignedSectionProps) {
  const totalItems = meals.length + snacks.length;

  if (totalItems === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-charcoal/60">Unassigned</span>
        <span className="text-xs text-charcoal/40">({totalItems})</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Meals */}
        {meals.map((entry) => {
          const meal = getMealById(entry.mealId);
          if (!meal) return null;

          return (
            <div
              key={entry.mealId}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-soft shadow-soft"
            >
              {meal.imageUrl ? (
                <img
                  src={meal.imageUrl}
                  alt=""
                  className="w-8 h-8 rounded-soft object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-soft bg-terracotta/10 flex items-center justify-center">
                  <span className="text-sm">&#127869;</span>
                </div>
              )}
              <div>
                <div className="font-medium text-charcoal text-sm">{meal.name}</div>
                <div className="text-xs text-charcoal/50">{entry.servings} serving{entry.servings !== 1 ? 's' : ''}</div>
              </div>
            </div>
          );
        })}

        {/* Snacks */}
        {snacks.map((entry) => {
          const snack = getSnackById(entry.snackId);
          if (!snack) return null;

          return (
            <div
              key={entry.snackId}
              className="flex items-center gap-2 px-3 py-2 bg-sage/10 rounded-soft"
            >
              {snack.imageUrl ? (
                <img
                  src={snack.imageUrl}
                  alt=""
                  className="w-8 h-8 rounded-soft object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-soft bg-sage/20 flex items-center justify-center">
                  <span className="text-sm">&#127871;</span>
                </div>
              )}
              <div>
                <div className="font-medium text-charcoal text-sm">{snack.name}</div>
                <div className="text-xs text-charcoal/50">&times;{entry.qty}</div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-charcoal/40 mt-2">
        Drag items to a day to schedule them
      </p>
    </div>
  );
}
