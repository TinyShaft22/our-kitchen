import { useState } from 'react';
import type { GroceryItem, Store } from '../../types';
import { STORES, CATEGORIES } from '../../types';

interface GroceryItemCardProps {
  item: GroceryItem;
  onToggleInCart?: () => void;
  onDelete?: () => void;
  onStoreChange?: (store: Store) => void;
}

export function GroceryItemCard({ item, onToggleInCart, onDelete, onStoreChange }: GroceryItemCardProps) {
  const [showStorePicker, setShowStorePicker] = useState(false);

  // Get display names for store and category
  const storeName = STORES.find((s) => s.id === item.store)?.name || item.store;
  const categoryName = CATEGORIES.find((c) => c.id === item.category)?.name || item.category;
  const isInCart = item.status === 'in-cart';
  const isStaple = item.source === 'staple';

  const handleStoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStoreChange) {
      setShowStorePicker(true);
    }
  };

  const handleStoreSelect = (store: Store) => {
    setShowStorePicker(false);
    if (onStoreChange) {
      onStoreChange(store);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="relative">
      <div
        className={`w-full text-left rounded-soft shadow-soft p-4 min-h-[44px] transition-colors ${
          isInCart ? 'bg-sage/10' : 'bg-white'
        }`}
      >
        <div className="flex justify-between items-start">
          {/* Main clickable area for toggle */}
          <button
            type="button"
            onClick={onToggleInCart}
            className="flex-1 min-w-0 text-left"
          >
            <h3 className={`font-semibold truncate ${
              isInCart ? 'line-through text-charcoal/50' : 'text-charcoal'
            }`}>
              {isInCart && <span className="mr-1">&#10003;</span>}
              {item.name}
              {isStaple && (
                <span className="ml-1.5 text-xs font-normal text-charcoal/50">staple</span>
              )}
            </h3>
            <p className={`text-sm mt-0.5 ${
              isInCart ? 'text-charcoal/40' : 'text-charcoal/70'
            }`}>
              {item.qty} {item.unit}
            </p>
          </button>

          {/* Tags and delete button */}
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            {/* Store tag - clickable */}
            <button
              type="button"
              onClick={handleStoreClick}
              className={`text-xs px-2 py-0.5 rounded-full bg-terracotta/20 text-terracotta transition-colors ${
                onStoreChange ? 'hover:bg-terracotta/30 cursor-pointer' : ''
              }`}
              disabled={!onStoreChange}
            >
              {storeName}
            </button>

            {/* Category tag */}
            <span className="text-xs px-2 py-0.5 rounded-full bg-sage/20 text-sage">
              {categoryName}
            </span>

            {/* Delete button */}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-6 h-6 flex items-center justify-center rounded-full text-charcoal/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                aria-label="Delete item"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Store picker dropdown */}
      {showStorePicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowStorePicker(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-soft shadow-lg border border-charcoal/10 py-1 min-w-[120px]">
            {STORES.map((store) => (
              <button
                key={store.id}
                type="button"
                onClick={() => handleStoreSelect(store.id)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  store.id === item.store
                    ? 'bg-terracotta/10 text-terracotta font-medium'
                    : 'text-charcoal hover:bg-charcoal/5'
                }`}
              >
                {store.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
