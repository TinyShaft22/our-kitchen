import { useState, useEffect } from 'react';
import type { Meal, Ingredient } from '../../types';

interface ExportMealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals: Meal[];
}

interface ExportedIngredient {
  name: string;
  category: string;
  defaultStore: string;
  qty?: number;
  unit?: string;
}

interface ExportedMeal {
  name: string;
  servings: number;
  isBaking: boolean;
  instructions?: string;
  ingredients: ExportedIngredient[];
}

interface ExportFormat {
  version: number;
  exportedAt: string;
  meals: ExportedMeal[];
}

export function ExportMealsModal({ isOpen, onClose, meals }: ExportMealsModalProps) {
  const [selectedMealIds, setSelectedMealIds] = useState<Set<string>>(new Set());
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  // Select all meals by default when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMealIds(new Set(meals.map((m) => m.id)));
      setShareSuccess(null);
      setShareError(null);
    }
  }, [isOpen, meals]);

  const handleSelectAll = () => {
    setSelectedMealIds(new Set(meals.map((m) => m.id)));
  };

  const handleDeselectAll = () => {
    setSelectedMealIds(new Set());
  };

  const handleToggleMeal = (mealId: string) => {
    const newSelected = new Set(selectedMealIds);
    if (newSelected.has(mealId)) {
      newSelected.delete(mealId);
    } else {
      newSelected.add(mealId);
    }
    setSelectedMealIds(newSelected);
  };

  const createExportData = (): ExportFormat => {
    const selectedMeals = meals.filter((m) => selectedMealIds.has(m.id));

    const exportedMeals: ExportedMeal[] = selectedMeals.map((meal) => ({
      name: meal.name,
      servings: meal.servings,
      isBaking: meal.isBaking,
      instructions: meal.instructions || undefined,
      ingredients: meal.ingredients.map((ing: Ingredient) => ({
        name: ing.name,
        category: ing.category,
        defaultStore: ing.defaultStore,
        qty: ing.qty,
        unit: ing.unit,
      })),
    }));

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      meals: exportedMeals,
    };
  };

  const handleShare = async () => {
    if (selectedMealIds.size === 0) return;

    setSharing(true);
    setShareError(null);
    setShareSuccess(null);

    try {
      const exportData = createExportData();
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], 'meals-export.json', { type: 'application/json' });

      // Try Web Share API first (works on iOS Safari)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Meal Export',
          text: `${selectedMealIds.size} meal${selectedMealIds.size === 1 ? '' : 's'} from your household`,
          files: [file],
        });
        setShareSuccess('Meals shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(jsonString);
        setShareSuccess('Copied to clipboard! Paste this JSON to import on another device.');
      }
    } catch (err) {
      // User cancelled share dialog - not an error
      if (err instanceof Error && err.name === 'AbortError') {
        setSharing(false);
        return;
      }
      setShareError(err instanceof Error ? err.message : 'Failed to share meals');
    } finally {
      setSharing(false);
    }
  };

  if (!isOpen) return null;

  const selectedCount = selectedMealIds.size;
  const allSelected = selectedCount === meals.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative bg-cream rounded-softer w-full max-w-lg max-h-[85vh] overflow-hidden shadow-lg flex flex-col">
        {/* Header */}
        <div className="bg-cream border-b border-charcoal/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-charcoal/5 text-charcoal"
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </button>
          <h2 className="text-lg font-semibold text-charcoal">Export Meals</h2>
          <div className="w-11" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Select/Deselect buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              disabled={allSelected}
              className="flex-1 h-10 rounded-soft border border-charcoal/20 text-sm font-medium text-charcoal hover:bg-charcoal/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              disabled={selectedCount === 0}
              className="flex-1 h-10 rounded-soft border border-charcoal/20 text-sm font-medium text-charcoal hover:bg-charcoal/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Deselect All
            </button>
          </div>

          {/* Meals list */}
          {meals.length === 0 ? (
            <p className="text-center text-charcoal/60 py-8">
              No meals to export. Add some meals first!
            </p>
          ) : (
            <div className="space-y-2">
              {meals.map((meal) => (
                <label
                  key={meal.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-soft border border-charcoal/10 cursor-pointer hover:border-terracotta/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedMealIds.has(meal.id)}
                    onChange={() => handleToggleMeal(meal.id)}
                    className="w-5 h-5 rounded border-charcoal/30 text-terracotta focus:ring-terracotta"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-charcoal truncate">
                      {meal.name}
                    </div>
                    <div className="text-sm text-charcoal/60">
                      {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? 's' : ''}
                      {meal.isBaking && ' · Baking'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Success/Error messages */}
          {shareSuccess && (
            <div className="mt-4 bg-green-100 text-green-700 px-4 py-3 rounded-soft text-sm">
              {shareSuccess}
            </div>
          )}
          {shareError && (
            <div className="mt-4 bg-red-100 text-red-700 px-4 py-3 rounded-soft text-sm">
              {shareError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-charcoal/10 p-4">
          <button
            onClick={handleShare}
            disabled={selectedCount === 0 || sharing}
            className="w-full h-12 rounded-soft bg-terracotta text-white font-medium hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sharing
              ? 'Sharing...'
              : `Share ${selectedCount} Meal${selectedCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
