import { useState } from 'react';
import type { HouseholdItem } from '../../types';
import { STORES, CATEGORIES } from '../../types';
import { Button } from '@/components/ui/button';

interface HouseholdItemCardProps {
  item: HouseholdItem;
  onAddToList: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function HouseholdItemCard({ item, onAddToList, onEdit, onDelete }: HouseholdItemCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [adding, setAdding] = useState(false);

  const storeName = STORES.find((s) => s.id === item.store)?.name || item.store;
  const categoryName = CATEGORIES.find((c) => c.id === item.category)?.name || item.category;

  // Build subtitle from brand and notes
  const subtitle = [item.brand, item.notes].filter(Boolean).join(' - ');

  const handleAddToList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    try {
      await onAddToList();
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="bg-white rounded-soft shadow-soft hover:shadow-lifted p-3 min-h-[44px] flex items-center justify-between gap-3 transition-shadow duration-200 transition-spring cursor-pointer"
      onClick={() => setShowActions(!showActions)}
    >
      {/* Left side: Name and brand/notes */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-charcoal truncate">{item.name}</p>
        {subtitle && (
          <p className="text-sm text-charcoal/60 truncate">{subtitle}</p>
        )}
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
            aria-label="Edit household item"
          >
            <span className="text-lg">&#9998;</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-charcoal/10 transition-colors"
            aria-label="Delete household item"
          >
            <span className="text-lg">&#128465;</span>
          </button>
        </div>
      )}

      {/* Right side: Add to List button */}
      <Button
        variant="default"
        size="sm"
        onClick={handleAddToList}
        disabled={adding}
        className="rounded-full whitespace-nowrap"
        aria-label={`Add ${item.name} to grocery list`}
      >
        {adding ? '...' : '+ Add'}
      </Button>
    </div>
  );
}
