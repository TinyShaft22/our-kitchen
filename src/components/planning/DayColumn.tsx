import type { DayOfWeek, WeeklyMealEntry, WeeklySnackEntry, Meal, Snack } from '../../types';
import { DAY_NAMES, DAY_ABBREVIATIONS } from '../../types';

interface DayColumnProps {
  day: DayOfWeek;
  meals: WeeklyMealEntry[];
  snacks: WeeklySnackEntry[];
  getMealById: (mealId: string) => Meal | null;
  getSnackById: (snackId: string) => Snack | null;
  isToday?: boolean;
}

export function DayColumn({
  day,
  meals,
  snacks,
  getMealById,
  getSnackById,
  isToday = false,
}: DayColumnProps) {
  const dayName = DAY_NAMES[day];
  const dayAbbr = DAY_ABBREVIATIONS[day];
  const totalItems = meals.length + snacks.length;

  return (
    <div
      className={`
        flex flex-col rounded-soft border min-h-[200px]
        ${isToday
          ? 'border-terracotta/40 bg-terracotta/5'
          : 'border-charcoal/10 bg-white/50'
        }
      `}
    >
      {/* Day Header */}
      <div
        className={`
          px-3 py-2 border-b text-center
          ${isToday
            ? 'border-terracotta/20 bg-terracotta/10'
            : 'border-charcoal/5 bg-charcoal/5'
          }
        `}
      >
        <div className="hidden md:block font-medium text-charcoal text-sm">
          {dayName}
        </div>
        <div className="md:hidden font-medium text-charcoal text-sm">
          {dayAbbr}
        </div>
        {totalItems > 0 && (
          <div className="text-xs text-charcoal/50">{totalItems} item{totalItems !== 1 ? 's' : ''}</div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-2 space-y-2">
        {/* Meals */}
        {meals.map((entry) => {
          const meal = getMealById(entry.mealId);
          if (!meal) return null;

          return (
            <div
              key={entry.mealId}
              className="p-2 bg-white rounded-soft shadow-soft text-sm"
            >
              <div className="flex items-center gap-2">
                {meal.imageUrl ? (
                  <img
                    src={meal.imageUrl}
                    alt=""
                    className="w-8 h-8 rounded-soft object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-soft bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">&#127869;</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-charcoal truncate">{meal.name}</div>
                  <div className="text-xs text-charcoal/50">{entry.servings} serving{entry.servings !== 1 ? 's' : ''}</div>
                </div>
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
              className="p-2 bg-sage/10 rounded-soft text-sm"
            >
              <div className="flex items-center gap-2">
                {snack.imageUrl ? (
                  <img
                    src={snack.imageUrl}
                    alt=""
                    className="w-8 h-8 rounded-soft object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-soft bg-sage/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">&#127871;</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-charcoal truncate">{snack.name}</div>
                  <div className="text-xs text-charcoal/50">&times;{entry.qty}</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {totalItems === 0 && (
          <div className="flex-1 flex items-center justify-center py-4">
            <span className="text-xs text-charcoal/30">No items</span>
          </div>
        )}
      </div>
    </div>
  );
}
