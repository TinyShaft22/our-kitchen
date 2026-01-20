import { useState } from 'react';
import { EmptyState } from '../ui/EmptyState';
import type { Meal } from '../../types';

interface AddToWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals: Meal[];
  onAdd: (mealId: string, servings: number) => Promise<void>;
}

export function AddToWeekModal({ isOpen, onClose, meals, onAdd }: AddToWeekModalProps) {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [servings, setServings] = useState(4);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setSelectedMeal(null);
    setServings(4);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleMealSelect = (meal: Meal) => {
    setSelectedMeal(meal);
    setServings(meal.servings);
    setError(null);
  };

  const handleBack = () => {
    setSelectedMeal(null);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedMeal) return;

    setSaving(true);
    setError(null);

    try {
      await onAdd(selectedMeal.id, servings);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add meal to week');
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
          {selectedMeal ? (
            <button
              onClick={handleBack}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream text-charcoal"
              aria-label="Back to meal list"
            >
              <span className="text-2xl">&larr;</span>
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-cream text-charcoal"
              aria-label="Close"
            >
              <span className="text-2xl">&times;</span>
            </button>
          )}
          <h2 className="text-lg font-semibold text-charcoal">
            {selectedMeal ? 'Set Servings' : 'Add Meal to Week'}
          </h2>
          {selectedMeal ? (
            <button
              onClick={handleConfirm}
              disabled={saving}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-terracotta text-white hover:bg-terracotta/90 disabled:opacity-50"
              aria-label="Confirm add"
            >
              {saving ? (
                <span className="text-sm">...</span>
              ) : (
                <span className="text-lg font-bold">&#10003;</span>
              )}
            </button>
          ) : (
            <div className="w-11 h-11" /> /* Spacer for alignment */
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-soft text-sm mb-4">
              {error}
            </div>
          )}

          {selectedMeal ? (
            /* Servings Input View */
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-charcoal font-medium text-lg">{selectedMeal.name}</p>
                <p className="text-charcoal/60 text-sm mt-1">
                  Default: {selectedMeal.servings} servings
                </p>
              </div>

              <div className="flex flex-col items-center">
                <label
                  htmlFor="servings-input"
                  className="block text-sm font-medium text-charcoal mb-2"
                >
                  Servings for this week
                </label>
                <input
                  id="servings-input"
                  type="number"
                  min="1"
                  max="99"
                  value={servings}
                  onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 h-11 px-3 rounded-soft border border-charcoal/20 bg-white text-charcoal text-center focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>
          ) : (
            /* Meal Selection List */
            meals.length === 0 ? (
              <EmptyState
                icon="🍽️"
                title="No meals in library"
                description="Add some meals to your library first, then you can plan your week."
                variant="terracotta"
              />
            ) : (
              <div className="space-y-2">
                {meals.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => handleMealSelect(meal)}
                    className="w-full text-left p-4 rounded-soft bg-white border border-charcoal/10 hover:border-terracotta/50 hover:bg-terracotta/5 transition-colors min-h-[44px]"
                  >
                    <p className="text-charcoal font-medium">{meal.name}</p>
                    <p className="text-charcoal/60 text-sm">
                      {meal.servings} servings | {meal.ingredients.length} ingredients
                    </p>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
