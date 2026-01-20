import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { WeeklyMealEntry, Meal } from '../../types';

interface DraggableMealCardProps {
  entry: WeeklyMealEntry;
  meal: Meal | null;
}

export function DraggableMealCard({ entry, meal }: DraggableMealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `meal-${entry.mealId}`,
    data: {
      type: 'meal',
      entry,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  if (!meal) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-2 bg-white rounded-soft shadow-soft text-sm
        ${isDragging ? 'ring-2 ring-terracotta z-50' : ''}
      `}
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
          <div className="text-xs text-charcoal/50">
            {entry.servings} serving{entry.servings !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
