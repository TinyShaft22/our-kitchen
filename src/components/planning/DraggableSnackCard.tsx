import { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { WeeklySnackEntry, Snack } from '../../types';

interface DraggableSnackCardProps {
  entry: WeeklySnackEntry;
  snack: Snack | null;
  onView?: (snack: Snack, entry: WeeklySnackEntry) => void;
}

export function DraggableSnackCard({ entry, snack, onView }: DraggableSnackCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `snack-${entry.snackId}`,
    data: {
      type: 'snack',
      entry,
    },
  });

  // Track if this is a tap vs drag
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const [wasDragged, setWasDragged] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setWasDragged(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startPosRef.current) {
      const dx = Math.abs(e.clientX - startPosRef.current.x);
      const dy = Math.abs(e.clientY - startPosRef.current.y);
      if (dx > 5 || dy > 5) {
        setWasDragged(true);
      }
    }
  };

  const handleClick = () => {
    if (!wasDragged && snack && onView) {
      onView(snack, entry);
    }
  };

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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      className={`
        p-2 bg-sage/10 rounded-soft touch-none
        ${isDragging ? 'ring-2 ring-sage z-50 shadow-lg' : 'active:bg-sage/20'}
      `}
    >
      {/* Compact layout for narrow columns */}
      <div className="flex items-start gap-1.5">
        {snack.imageUrl ? (
          <img
            src={snack.imageUrl}
            alt=""
            className="w-6 h-6 rounded object-cover flex-shrink-0 mt-0.5"
          />
        ) : (
          <div className="w-6 h-6 rounded bg-sage/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs">🍿</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {/* Name wraps to multiple lines instead of truncating */}
          <div className="font-medium text-charcoal text-xs leading-tight line-clamp-2">
            {snack.name}
          </div>
          <div className="text-[10px] text-charcoal/50 mt-0.5">
            ×{entry.qty}
          </div>
        </div>
      </div>
    </div>
  );
}
