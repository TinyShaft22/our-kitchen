import type { Snack, WeeklySnackEntry } from '../../types';

interface WeeklySnackCardProps {
  entry: WeeklySnackEntry;
  snack: Snack | null;
  onEditQty: (entry: WeeklySnackEntry) => void;
  onRemove: (entry: WeeklySnackEntry) => void;
}

export function WeeklySnackCard({
  entry,
  snack,
  onEditQty,
  onRemove,
}: WeeklySnackCardProps) {
  if (!snack) {
    return (
      <div className="bg-white/80 rounded-soft p-4 shadow-soft animate-pulse">
        <div className="h-6 bg-charcoal/10 rounded w-32 mb-2" />
        <div className="h-4 bg-charcoal/10 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-soft shadow-soft overflow-hidden">
      <div className="flex items-center p-4">
        {/* Image/Icon */}
        {snack.imageUrl ? (
          <img
            src={snack.imageUrl}
            alt=""
            className="w-14 h-14 rounded-soft object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-soft bg-sage/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🍿</span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 ml-3 min-w-0">
          <h3 className="font-semibold text-charcoal truncate">{snack.name}</h3>
          {snack.brand && (
            <p className="text-xs text-charcoal/60 truncate">{snack.brand}</p>
          )}
        </div>

        {/* Quantity Badge */}
        <button
          onClick={() => onEditQty(entry)}
          className="ml-2 px-3 py-1 bg-sage/20 rounded-full hover:bg-sage/30 transition-colors"
        >
          <span className="text-sm font-medium text-sage">×{entry.qty}</span>
        </button>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(entry)}
          className="ml-2 w-10 h-10 rounded-full hover:bg-red-50 active:bg-red-100 transition-colors flex items-center justify-center"
          aria-label={`Remove ${snack.name}`}
        >
          <span className="text-lg">🗑️</span>
        </button>
      </div>
    </div>
  );
}
