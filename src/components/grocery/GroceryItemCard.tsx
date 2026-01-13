import type { GroceryItem } from '../../types';
import { STORES, CATEGORIES } from '../../types';

interface GroceryItemCardProps {
  item: GroceryItem;
  onToggleInCart?: () => void;
}

export function GroceryItemCard({ item, onToggleInCart }: GroceryItemCardProps) {
  // Get display names for store and category
  const storeName = STORES.find((s) => s.id === item.store)?.name || item.store;
  const categoryName = CATEGORIES.find((c) => c.id === item.category)?.name || item.category;
  const isInCart = item.status === 'in-cart';
  const isStaple = item.source === 'staple';

  return (
    <button
      type="button"
      onClick={onToggleInCart}
      className={`w-full text-left rounded-soft shadow-soft p-4 min-h-[44px] cursor-pointer transition-colors ${
        isInCart ? 'bg-sage/10' : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
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
        </div>
        <div className="flex gap-1.5 ml-2 flex-shrink-0">
          <span className="text-xs px-2 py-0.5 rounded-full bg-terracotta/20 text-terracotta">
            {storeName}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-sage/20 text-sage">
            {categoryName}
          </span>
        </div>
      </div>
    </button>
  );
}
