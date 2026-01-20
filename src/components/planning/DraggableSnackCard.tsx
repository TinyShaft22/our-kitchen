import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { WeeklySnackEntry, Snack } from '../../types';

interface DraggableSnackCardProps {
  entry: WeeklySnackEntry;
  snack: Snack | null;
}

export function DraggableSnackCard({ entry, snack }: DraggableSnackCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `snack-${entry.snackId}`,
    data: {
      type: 'snack',
      entry,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  if (!snack) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-2 bg-sage/10 rounded-soft text-sm
        ${isDragging ? 'ring-2 ring-sage z-50' : ''}
      `}
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
}
