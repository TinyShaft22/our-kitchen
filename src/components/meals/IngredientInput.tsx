import type { Ingredient, Category, Store } from '../../types';
import { STORES, CATEGORIES, BAKING_UNITS } from '../../types';

interface IngredientInputProps {
  ingredient: Ingredient;
  onChange: (updated: Ingredient) => void;
  onRemove: () => void;
  isBaking?: boolean;
}

export function IngredientInput({
  ingredient,
  onChange,
  onRemove,
  isBaking = false,
}: IngredientInputProps) {
  const handleChange = (field: keyof Ingredient, value: string | number | undefined) => {
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

      {/* Row 2: Quantity and Unit (only for baking recipes) */}
      {isBaking && (
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.25"
            value={ingredient.qty ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              handleChange('qty', val === '' ? undefined : parseFloat(val));
            }}
            placeholder="Amount"
            className="w-24 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
          />
          <select
            value={ingredient.unit || ''}
            onChange={(e) => handleChange('unit', e.target.value || undefined)}
            className="flex-1 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
          >
            <option value="">Select unit...</option>
            {BAKING_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      )}

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
