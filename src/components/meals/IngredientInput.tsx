import type { Ingredient, Category, Store } from '../../types';
import { STORES, CATEGORIES } from '../../types';

interface IngredientInputProps {
  ingredient: Ingredient;
  onChange: (updated: Ingredient) => void;
  onRemove: () => void;
}

export function IngredientInput({
  ingredient,
  onChange,
  onRemove,
}: IngredientInputProps) {
  const handleChange = (field: keyof Ingredient, value: string | number) => {
    onChange({
      ...ingredient,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-soft shadow-soft p-3 space-y-3">
      {/* Row 1: Name and Remove Button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={ingredient.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ingredient name"
          className="flex-1 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
        />
        <button
          type="button"
          onClick={onRemove}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream-dark text-charcoal/60 hover:text-charcoal transition-colors"
          aria-label="Remove ingredient"
        >
          <span className="text-xl">&times;</span>
        </button>
      </div>

      {/* Row 2: Qty and Unit */}
      <div className="flex gap-2">
        <input
          type="number"
          value={ingredient.qty}
          onChange={(e) => handleChange('qty', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.25"
          placeholder="Qty"
          className="w-20 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
        />
        <input
          type="text"
          value={ingredient.unit}
          onChange={(e) => handleChange('unit', e.target.value)}
          placeholder="Unit (e.g., cups)"
          className="flex-1 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
        />
      </div>

      {/* Row 3: Category and Store */}
      <div className="flex gap-2">
        <select
          value={ingredient.category}
          onChange={(e) => handleChange('category', e.target.value as Category)}
          className="flex-1 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={ingredient.defaultStore}
          onChange={(e) => handleChange('defaultStore', e.target.value as Store)}
          className="flex-1 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
        >
          {STORES.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
