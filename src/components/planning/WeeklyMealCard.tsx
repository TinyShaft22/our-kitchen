import type { WeeklyMealEntry } from '../../types';

interface WeeklyMealCardProps {
  entry: WeeklyMealEntry;
  mealName: string;
  onEditServings: (entry: WeeklyMealEntry) => void;
  onRemove: (entry: WeeklyMealEntry) => void;
}

export function WeeklyMealCard({
  entry,
  mealName,
  onEditServings,
  onRemove,
}: WeeklyMealCardProps) {
  return (
    <div className="bg-white rounded-soft shadow-soft p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-charcoal truncate">
            {mealName}
          </h3>
          <p className="text-sm text-warm-gray mt-1">
            {entry.servings} servings
          </p>
        </div>
        <div className="flex gap-2 ml-2">
          <button
            onClick={() => onEditServings(entry)}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream-dark active:bg-cream-dark transition-colors"
            aria-label={`Edit servings for ${mealName}`}
          >
            <span className="text-lg">✏️</span>
          </button>
          <button
            onClick={() => onRemove(entry)}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream-dark active:bg-cream-dark transition-colors"
            aria-label={`Remove ${mealName} from weekly plan`}
          >
            <span className="text-lg">🗑️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
