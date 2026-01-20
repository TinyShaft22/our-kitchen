import { useDroppable } from '@dnd-kit/core';
import type { DayOfWeek, WeeklyMealEntry, WeeklySnackEntry, Meal, Snack } from '../../types';
import { DAY_NAMES, DAY_ABBREVIATIONS } from '../../types';
import { DraggableMealCard } from './DraggableMealCard';
import { DraggableSnackCard } from './DraggableSnackCard';

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
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${day}`,
    data: { day },
  });

  const dayName = DAY_NAMES[day];
  const dayAbbr = DAY_ABBREVIATIONS[day];
  const totalItems = meals.length + snacks.length;

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col rounded-soft border min-h-[200px] transition-colors
        ${isToday
          ? 'border-terracotta/40 bg-terracotta/5'
          : 'border-charcoal/10 bg-white/50'
        }
        ${isOver ? 'border-terracotta border-2 bg-terracotta/10' : ''}
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
          <div className="text-xs text-charcoal/50">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Content Area (drop zone) */}
      <div className="flex-1 p-2 space-y-2">
        {/* Meals */}
        {meals.map((entry) => (
          <DraggableMealCard
            key={entry.mealId}
            entry={entry}
            meal={getMealById(entry.mealId)}
          />
        ))}

        {/* Snacks */}
        {snacks.map((entry) => (
          <DraggableSnackCard
            key={entry.snackId}
            entry={entry}
            snack={getSnackById(entry.snackId)}
          />
        ))}

        {/* Empty State / Drop hint */}
        {totalItems === 0 && (
          <div className={`
            flex-1 flex items-center justify-center py-4 rounded-soft border-2 border-dashed
            ${isOver ? 'border-terracotta bg-terracotta/5' : 'border-transparent'}
          `}>
            <span className="text-xs text-charcoal/30">
              {isOver ? 'Drop here' : 'No items'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
