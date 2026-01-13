import { useState, useEffect } from 'react';
import type { Meal, Ingredient } from '../../types';
import { IngredientInput } from './IngredientInput';

interface EditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal;
  onSave: (updates: Omit<Meal, 'id' | 'householdCode'>) => Promise<void>;
}

// Default ingredient values for new ingredients
const createDefaultIngredient = (): Ingredient => ({
  name: '',
  qty: 1,
  unit: '',
  category: 'produce',
  defaultStore: 'safeway',
});

export function EditMealModal({ isOpen, onClose, meal, onSave }: EditMealModalProps) {
  const [name, setName] = useState(meal.name);
  const [servings, setServings] = useState(meal.servings);
  const [isBaking, setIsBaking] = useState(meal.isBaking);
  const [ingredients, setIngredients] = useState<Ingredient[]>(meal.ingredients);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-initialize state when meal changes
  useEffect(() => {
    setName(meal.name);
    setServings(meal.servings);
    setIsBaking(meal.isBaking);
    setIngredients(meal.ingredients);
    setError(null);
  }, [meal]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, createDefaultIngredient()]);
  };

  const handleUpdateIngredient = (index: number, updated: Ingredient) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = updated;
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validate meal name
    if (!name.trim()) {
      setError('Meal name is required');
      return;
    }

    // Validate at least one ingredient with a name
    const validIngredients = ingredients.filter((ing) => ing.name.trim());
    if (validIngredients.length === 0) {
      setError('At least one ingredient with a name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        servings,
        isBaking,
        ingredients: validIngredients,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meal');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative bg-cream rounded-softer w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b border-charcoal/10 px-4 py-3 flex items-center justify-between z-10">
          <button
            onClick={handleClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream text-charcoal"
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </button>
          <h2 className="text-lg font-semibold text-charcoal">Edit Meal</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
            aria-label="Update meal"
          >
            {saving ? (
              <span className="text-sm">...</span>
            ) : (
              <span className="text-lg font-bold">&#10003;</span>
            )}
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm">
              {error}
            </div>
          )}

          {/* Meal Name */}
          <div>
            <label
              htmlFor="edit-meal-name"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Meal Name
            </label>
            <input
              id="edit-meal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spaghetti Bolognese"
              className="w-full h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Servings */}
          <div>
            <label
              htmlFor="edit-servings"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Servings
            </label>
            <input
              id="edit-servings"
              type="number"
              min="1"
              max="99"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-24 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
            />
          </div>

          {/* Baking Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="edit-is-baking"
              className="text-sm font-medium text-charcoal"
            >
              Baking Recipe
            </label>
            <button
              id="edit-is-baking"
              role="switch"
              aria-checked={isBaking}
              onClick={() => setIsBaking(!isBaking)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                isBaking ? 'bg-terracotta' : 'bg-charcoal/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  isBaking ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Ingredients Section */}
          <div className="border-t border-charcoal/10 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-charcoal">
                Ingredients ({ingredients.length})
              </h3>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="h-11 px-4 rounded-soft bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 active:bg-terracotta/80 transition-colors"
              >
                + Add Ingredient
              </button>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-sm text-charcoal/60 text-center py-4">
                No ingredients yet. Tap &quot;Add Ingredient&quot; to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <IngredientInput
                    key={index}
                    ingredient={ingredient}
                    onChange={(updated) => handleUpdateIngredient(index, updated)}
                    onRemove={() => handleRemoveIngredient(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
