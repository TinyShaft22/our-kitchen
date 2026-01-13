import { useState } from 'react';
import type { Staple } from '../../types';
import { STORES, CATEGORIES } from '../../types';

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
      className="bg-white rounded-soft shadow-soft p-3 min-h-[44px] flex items-center justify-between gap-3"
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
      <button
        role="switch"
        aria-checked={staple.enabled}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(!staple.enabled);
        }}
        className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
          staple.enabled ? 'bg-sage' : 'bg-charcoal/20'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
            staple.enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
