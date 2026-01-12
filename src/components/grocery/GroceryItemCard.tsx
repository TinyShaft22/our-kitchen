import type { GroceryItem } from '../../types';
import { STORES, CATEGORIES } from '../../types';

interface GroceryItemCardProps {
  item: GroceryItem;
}

export function GroceryItemCard({ item }: GroceryItemCardProps) {
  // Get display names for store and category
  const storeName = STORES.find((s) => s.id === item.store)?.name || item.store;
  const categoryName = CATEGORIES.find((c) => c.id === item.category)?.name || item.category;

  return (
    <div className="bg-white rounded-soft shadow-soft p-4 min-h-[44px]">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-charcoal truncate">{item.name}</h3>
          <p className="text-sm text-charcoal/70 mt-0.5">
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
    </div>
  );
}
