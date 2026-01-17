import type { Ingredient, Category, Store } from '../../types';
import { STORES, CATEGORIES, BAKING_UNITS } from '../../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
        <Input
          type="text"
          value={ingredient.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ingredient name"
          className="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          onClick={onRemove}
          className="w-11 h-11 rounded-full hover:bg-charcoal/5 text-charcoal/60 hover:text-charcoal p-0"
          aria-label="Remove ingredient"
        >
          <span className="text-xl">&times;</span>
        </Button>
      </div>

      {/* Row 2: Quantity and Unit (only for baking recipes) */}
      {isBaking && (
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            step={0.25}
            value={ingredient.qty ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              handleChange('qty', val === '' ? undefined : parseFloat(val));
            }}
            placeholder="Amount"
            className="w-24"
          />
          <Select
            value={ingredient.unit || ''}
            onValueChange={(value) => handleChange('unit', value || undefined)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select unit..." />
            </SelectTrigger>
            <SelectContent>
              {BAKING_UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Row 3: Category and Store */}
      <div className="flex gap-2">
        <Select
          value={ingredient.category}
          onValueChange={(value) => handleChange('category', value as Category)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={ingredient.defaultStore}
          onValueChange={(value) => handleChange('defaultStore', value as Store)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STORES.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
