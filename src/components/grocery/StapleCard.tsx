import { useState } from 'react';
import type { Staple } from '../../types';
import { STORES, CATEGORIES } from '../../types';
import { Switch } from '@/components/ui/switch';

interface StapleCardProps {
  staple: Staple;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function StapleCard({ staple, onToggle, onEdit, onDelete }: StapleCardProps) {
  const [showActions, setShowActions] = useState(false);

  const storeName = STORES.find((s) => s.id === staple.store)?.name || staple.store;
  const categoryName = CATEGORIES.find((c) => c.id === staple.category)?.name || staple.category;

  return (
    <div
      className="bg-white rounded-soft shadow-soft hover:shadow-lifted p-3 min-h-[44px] flex items-center justify-between gap-3 transition-shadow duration-200 transition-spring cursor-pointer"
      onClick={() => setShowActions(!showActions)}
    >
      {/* Left side: Name and badges */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-charcoal truncate">{staple.name}</p>
        <div className="flex gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta">
            {storeName}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-charcoal/10 text-charcoal/70">
            {categoryName}
          </span>
        </div>
      </div>

      {/* Action buttons (shown on tap/hover) */}
      {showActions && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-charcoal/10 transition-colors"
            aria-label="Edit staple"
          >
            <span className="text-lg">✏️</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-charcoal/10 transition-colors"
            aria-label="Delete staple"
          >
            <span className="text-lg">🗑️</span>
          </button>
        </div>
      )}

      {/* Right side: Toggle switch */}
      <Switch
        checked={staple.enabled}
        onCheckedChange={(checked) => {
          onToggle(checked);
        }}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Toggle ${staple.name}`}
      />
    </div>
  );
}
