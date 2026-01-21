import { useDroppable } from '@dnd-kit/core';
import type { WeeklyMealEntry, WeeklySnackEntry, WeeklyDessertEntry, Meal, Snack } from '../../types';
import { DraggableMealCard } from './DraggableMealCard';
import { DraggableSnackCard } from './DraggableSnackCard';
import { DraggableDessertCard } from './DraggableDessertCard';

interface UnassignedSectionProps {
  meals: WeeklyMealEntry[];
  snacks: WeeklySnackEntry[];
  desserts: WeeklyDessertEntry[];
  getMealById: (mealId: string) => Meal | null;
  getSnackById: (snackId: string) => Snack | null;
  onViewMeal?: (meal: Meal, entry: WeeklyMealEntry) => void;
  onViewSnack?: (snack: Snack, entry: WeeklySnackEntry) => void;
  onViewDessert?: (meal: Meal, entry: WeeklyDessertEntry) => void;
}

export function UnassignedSection({
  meals,
  snacks,
  desserts,
  getMealById,
  getSnackById,
  onViewMeal,
  onViewSnack,
  onViewDessert,
}: UnassignedSectionProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'unassigned',
    data: { day: undefined },
  });

  const totalItems = meals.length + snacks.length + desserts.length;

  return (
    <div
      ref={setNodeRef}
      className={`
        mb-4 p-3 rounded-soft border-2 border-dashed transition-colors
        ${isOver
          ? 'border-charcoal/40 bg-charcoal/5'
          : totalItems > 0
            ? 'border-charcoal/20 bg-charcoal/5'
            : 'border-charcoal/10'
        }
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-charcoal/60">Unassigned</span>
        {totalItems > 0 && (
          <span className="text-xs text-charcoal/40">({totalItems})</span>
        )}
      </div>

      {totalItems > 0 ? (
        <div className="flex flex-wrap gap-2">
          {/* Meals */}
          {meals.map((entry) => (
            <DraggableMealCard
              key={entry.mealId}
              entry={entry}
              meal={getMealById(entry.mealId)}
              onView={onViewMeal}
            />
          ))}

          {/* Snacks */}
          {snacks.map((entry) => (
            <DraggableSnackCard
              key={entry.snackId}
              entry={entry}
              snack={getSnackById(entry.snackId)}
              onView={onViewSnack}
            />
          ))}

          {/* Desserts */}
          {desserts.map((entry) => (
            <DraggableDessertCard
              key={entry.mealId}
              entry={entry}
              meal={getMealById(entry.mealId)}
              onView={onViewDessert}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-charcoal/40">
          {isOver ? 'Drop here to unassign' : 'Drag items here to unassign from a day'}
        </p>
      )}
    </div>
  );
}
