import { useState } from 'react';
import type { Meal, Ingredient } from '../../types';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Omit<Meal, 'id' | 'householdCode'>) => Promise<void>;
}

export function AddMealModal({ isOpen, onClose, onSave }: AddMealModalProps) {
  const [name, setName] = useState('');
  const [servings, setServings] = useState(4);
  const [isBaking, setIsBaking] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suppress unused variable warnings - will be used in 04-02 Task 2
  void ingredients;
  void setIngredients;

  const resetForm = () => {
    setName('');
    setServings(4);
    setIsBaking(false);
    setIngredients([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    // Validate
    if (!name.trim()) {
      setError('Meal name is required');
      return;
    }

    // Ingredients validation will be added in Task 2
    // For now, just save with empty ingredients

    setSaving(true);
    setError(null);

    try {
      await onSave({
        name: name.trim(),
        servings,
        isBaking,
        ingredients,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meal');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative bg-cream rounded-t-softer w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b border-charcoal/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream text-charcoal"
            aria-label="Cancel"
          >
            <span className="text-2xl">&times;</span>
          </button>
          <h2 className="text-lg font-semibold text-charcoal">Add Meal</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
            aria-label="Save meal"
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
              htmlFor="meal-name"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Meal Name
            </label>
            <input
              id="meal-name"
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
              htmlFor="servings"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Servings
            </label>
            <input
              id="servings"
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
              htmlFor="is-baking"
              className="text-sm font-medium text-charcoal"
            >
              Baking Recipe
            </label>
            <button
              id="is-baking"
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

          {/* Ingredients section placeholder - will be built in Task 2 */}
          <div className="border-t border-charcoal/10 pt-4 mt-4">
            <h3 className="text-sm font-medium text-charcoal mb-2">
              Ingredients
            </h3>
            <p className="text-sm text-charcoal/60">
              Ingredient entry coming in Task 2...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
