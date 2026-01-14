import { useState } from 'react';
import type { GroceryItem, Store, Category } from '../../types';
import { STORES, CATEGORIES } from '../../types';

interface GroceryItemCardProps {
  item: GroceryItem;
  onToggleInCart?: () => void;
  onDelete?: () => void;
  onStoreChange?: (store: Store) => void;
  onCategoryChange?: (category: Category) => void;
  onToggleAlreadyHave?: () => void;
}

export function GroceryItemCard({ item, onToggleInCart, onDelete, onStoreChange, onCategoryChange, onToggleAlreadyHave }: GroceryItemCardProps) {
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const isMealSourced = item.source === 'meal';

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

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryChange) {
      setShowCategoryPicker(true);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setShowCategoryPicker(false);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const handleAlreadyHave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleAlreadyHave) {
      onToggleAlreadyHave();
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

            {/* Category tag - clickable */}
            <button
              type="button"
              onClick={handleCategoryClick}
              className={`text-xs px-2 py-0.5 rounded-full bg-sage/20 text-sage transition-colors ${
                onCategoryChange ? 'hover:bg-sage/30 cursor-pointer' : ''
              }`}
              disabled={!onCategoryChange}
            >
              {categoryName}
            </button>

            {/* Already Have button - only for meal-sourced items */}
            {isMealSourced && onToggleAlreadyHave && (
              <button
                type="button"
                onClick={handleAlreadyHave}
                className="w-6 h-6 flex items-center justify-center rounded-full text-charcoal/40 hover:text-charcoal/70 hover:bg-charcoal/10 transition-colors"
                aria-label="Mark as already have"
                title="Mark as already have"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" />
                </svg>
              </button>
            )}

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

      {/* Category picker dropdown */}
      {showCategoryPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCategoryPicker(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-soft shadow-lg border border-charcoal/10 py-1 min-w-[120px]">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  category.id === item.category
                    ? 'bg-sage/10 text-sage font-medium'
                    : 'text-charcoal hover:bg-charcoal/5'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
