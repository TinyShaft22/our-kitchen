import { useDroppable } from '@dnd-kit/core';
import type { DayOfWeek, WeeklyMealEntry, WeeklySnackEntry, WeeklyDessertEntry, Meal, Snack } from '../../types';
import { DAY_NAMES, DAY_ABBREVIATIONS } from '../../types';
import { DraggableMealCard } from './DraggableMealCard';
import { DraggableSnackCard } from './DraggableSnackCard';
import { DraggableDessertCard } from './DraggableDessertCard';

interface DayColumnProps {
  day: DayOfWeek;
  meals: WeeklyMealEntry[];
  snacks: WeeklySnackEntry[];
  desserts: WeeklyDessertEntry[];
  getMealById: (mealId: string) => Meal | null;
  getSnackById: (snackId: string) => Snack | null;
  isToday?: boolean;
  onViewMeal?: (meal: Meal, entry: WeeklyMealEntry) => void;
  onViewSnack?: (snack: Snack, entry: WeeklySnackEntry) => void;
  onViewDessert?: (meal: Meal, entry: WeeklyDessertEntry) => void;
}

export function DayColumn({
  day,
  meals,
  snacks,
  desserts,
  getMealById,
  getSnackById,
  isToday = false,
  onViewMeal,
  onViewSnack,
  onViewDessert,
}: DayColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${day}`,
    data: { day },
  });

  const dayName = DAY_NAMES[day];
  const dayAbbr = DAY_ABBREVIATIONS[day];

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col rounded-soft border min-h-[320px] transition-colors
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
          px-2 py-1.5 border-b text-center
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
      </div>

      {/* Content Area (drop zone) - divided into category sections */}
      <div className="flex-1 flex flex-col p-1.5 gap-1.5">
        {/* Meals Section */}
        <div className="flex-1 min-h-[80px]">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs">🍽️</span>
            <span className="text-[10px] text-charcoal/50 font-medium uppercase tracking-wide">Meals</span>
          </div>
          <div className="space-y-1">
            {meals.map((entry) => (
              <DraggableMealCard
                key={entry.mealId}
                entry={entry}
                meal={getMealById(entry.mealId)}
                onView={onViewMeal}
              />
            ))}
            {meals.length === 0 && (
              <div className="h-8 rounded border border-dashed border-charcoal/10 flex items-center justify-center">
                <span className="text-[10px] text-charcoal/30">—</span>
              </div>
            )}
          </div>
        </div>

        {/* Snacks Section */}
        <div className="flex-1 min-h-[60px]">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs">🍿</span>
            <span className="text-[10px] text-charcoal/50 font-medium uppercase tracking-wide">Snacks</span>
          </div>
          <div className="space-y-1">
            {snacks.map((entry) => (
              <DraggableSnackCard
                key={entry.snackId}
                entry={entry}
                snack={getSnackById(entry.snackId)}
                onView={onViewSnack}
              />
            ))}
            {snacks.length === 0 && (
              <div className="h-8 rounded border border-dashed border-charcoal/10 flex items-center justify-center">
                <span className="text-[10px] text-charcoal/30">—</span>
              </div>
            )}
          </div>
        </div>

        {/* Desserts Section */}
        <div className="flex-1 min-h-[60px]">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs">🧁</span>
            <span className="text-[10px] text-charcoal/50 font-medium uppercase tracking-wide">Desserts</span>
          </div>
          <div className="space-y-1">
            {desserts.map((entry) => (
              <DraggableDessertCard
                key={entry.mealId}
                entry={entry}
                meal={getMealById(entry.mealId)}
                onView={onViewDessert}
              />
            ))}
            {desserts.length === 0 && (
              <div className="h-8 rounded border border-dashed border-charcoal/10 flex items-center justify-center">
                <span className="text-[10px] text-charcoal/30">—</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
