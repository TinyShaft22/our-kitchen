import { useState } from 'react';
import type { Meal, Ingredient, Category, Store } from '../../types';
import { CATEGORIES, STORES } from '../../types';

interface ImportMealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (meals: Omit<Meal, 'id' | 'householdCode'>[]) => Promise<void>;
}

interface ParsedMeal extends Omit<Meal, 'id' | 'householdCode'> {}

// Valid values for validation
const VALID_CATEGORIES = CATEGORIES.map((c) => c.id);
const VALID_STORES = STORES.map((s) => s.id);

function isValidCategory(value: string): value is Category {
  return VALID_CATEGORIES.includes(value as Category);
}

function isValidStore(value: string): value is Store {
  return VALID_STORES.includes(value as Store);
}

function validateAndParseExport(jsonString: string): { meals: ParsedMeal[]; errors: string[] } {
  const errors: string[] = [];
  let data: unknown;

  try {
    data = JSON.parse(jsonString);
  } catch {
    return { meals: [], errors: ['Invalid JSON format'] };
  }

  // Check basic structure
  if (!data || typeof data !== 'object') {
    return { meals: [], errors: ['Invalid export format'] };
  }

  const exportData = data as Record<string, unknown>;

  if (exportData.version !== 1) {
    return { meals: [], errors: ['Unsupported export version'] };
  }

  if (!Array.isArray(exportData.meals)) {
    return { meals: [], errors: ['No meals array found'] };
  }

  const meals: ParsedMeal[] = [];

  for (let i = 0; i < exportData.meals.length; i++) {
    const mealData = exportData.meals[i] as Record<string, unknown>;
    const mealIndex = i + 1;

    // Validate required fields
    if (typeof mealData.name !== 'string' || !mealData.name.trim()) {
      errors.push(`Meal ${mealIndex}: Missing name`);
      continue;
    }

    if (typeof mealData.servings !== 'number' || mealData.servings < 1) {
      errors.push(`Meal ${mealIndex}: Invalid servings`);
      continue;
    }

    if (typeof mealData.isBaking !== 'boolean') {
      errors.push(`Meal ${mealIndex}: Invalid isBaking flag`);
      continue;
    }

    if (!Array.isArray(mealData.ingredients)) {
      errors.push(`Meal ${mealIndex}: Missing ingredients`);
      continue;
    }

    // Parse ingredients
    const ingredients: Ingredient[] = [];
    let ingredientValid = true;

    for (let j = 0; j < mealData.ingredients.length; j++) {
      const ingData = mealData.ingredients[j] as Record<string, unknown>;

      if (typeof ingData.name !== 'string' || !ingData.name.trim()) {
        errors.push(`Meal ${mealIndex}, Ingredient ${j + 1}: Missing name`);
        ingredientValid = false;
        continue;
      }

      if (!isValidCategory(ingData.category as string)) {
        errors.push(`Meal ${mealIndex}, Ingredient ${j + 1}: Invalid category "${ingData.category}"`);
        ingredientValid = false;
        continue;
      }

      if (!isValidStore(ingData.defaultStore as string)) {
        errors.push(`Meal ${mealIndex}, Ingredient ${j + 1}: Invalid store "${ingData.defaultStore}"`);
        ingredientValid = false;
        continue;
      }

      const ingredient: Ingredient = {
        name: ingData.name as string,
        category: ingData.category as Category,
        defaultStore: ingData.defaultStore as Store,
      };

      // Optional qty/unit for baking
      if (typeof ingData.qty === 'number') {
        ingredient.qty = ingData.qty;
      }
      if (typeof ingData.unit === 'string') {
        ingredient.unit = ingData.unit;
      }

      ingredients.push(ingredient);
    }

    if (!ingredientValid) {
      continue;
    }

    if (ingredients.length === 0) {
      errors.push(`Meal ${mealIndex}: No valid ingredients`);
      continue;
    }

    // Build parsed meal
    const meal: ParsedMeal = {
      name: mealData.name as string,
      servings: mealData.servings as number,
      isBaking: mealData.isBaking as boolean,
      ingredients,
    };

    if (typeof mealData.instructions === 'string' && mealData.instructions.trim()) {
      meal.instructions = mealData.instructions;
    }

    if (typeof mealData.subcategory === 'string' && mealData.subcategory.trim()) {
      meal.subcategory = mealData.subcategory;
    }

    meals.push(meal);
  }

  return { meals, errors };
}

export function ImportMealsModal({ isOpen, onClose, onImport }: ImportMealsModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedMeals, setParsedMeals] = useState<ParsedMeal[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleClose = () => {
    setJsonInput('');
    setParsedMeals(null);
    setParseErrors([]);
    setSelectedIndices(new Set());
    setImporting(false);
    setImportError(null);
    onClose();
  };

  const handleLoadMeals = () => {
    setImportError(null);
    const { meals, errors } = validateAndParseExport(jsonInput);
    setParseErrors(errors);

    if (meals.length > 0) {
      setParsedMeals(meals);
      setSelectedIndices(new Set(meals.map((_, i) => i)));
    } else {
      setParsedMeals(null);
    }
  };

  const handleSelectAll = () => {
    if (parsedMeals) {
      setSelectedIndices(new Set(parsedMeals.map((_, i) => i)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedIndices(new Set());
  };

  const handleToggleMeal = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const handleImport = async () => {
    if (!parsedMeals || selectedIndices.size === 0) return;

    setImporting(true);
    setImportError(null);

    try {
      const mealsToImport = parsedMeals.filter((_, i) => selectedIndices.has(i));
      await onImport(mealsToImport);
      handleClose();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import meals');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  const selectedCount = selectedIndices.size;
  const showMealList = parsedMeals !== null && parsedMeals.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative bg-cream rounded-softer w-full max-w-lg max-h-[85vh] overflow-hidden shadow-lg flex flex-col">
        {/* Header */}
        <div className="bg-cream border-b border-charcoal/10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-charcoal/5 text-charcoal"
            aria-label="Close"
          >
            <span className="text-2xl">&times;</span>
          </button>
          <h2 className="text-lg font-semibold text-charcoal">Import Meals</h2>
          <div className="w-11" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!showMealList ? (
            <>
              {/* JSON Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Paste exported JSON
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{"version": 1, "meals": [...]}'
                  rows={8}
                  className="w-full px-3 py-2 rounded-soft border border-charcoal/20 bg-white text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta font-mono text-sm resize-none"
                />
              </div>

              {/* Parse errors */}
              {parseErrors.length > 0 && (
                <div className="mb-4 bg-red-100 text-red-700 px-4 py-3 rounded-soft text-sm">
                  <div className="font-medium mb-1">Validation errors:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {parseErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parseErrors.length > 5 && (
                      <li>...and {parseErrors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Load button */}
              <button
                onClick={handleLoadMeals}
                disabled={!jsonInput.trim()}
                className="w-full h-12 rounded-soft bg-terracotta text-white font-medium hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Load Meals
              </button>
            </>
          ) : (
            <>
              {/* Select/Deselect buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleSelectAll}
                  disabled={selectedCount === parsedMeals.length}
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

              {/* Back button */}
              <button
                onClick={() => {
                  setParsedMeals(null);
                  setSelectedIndices(new Set());
                }}
                className="mb-4 text-sm text-terracotta hover:text-terracotta/80"
              >
                ← Back to paste JSON
              </button>

              {/* Meals list */}
              <div className="space-y-2">
                {parsedMeals.map((meal, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white rounded-soft border border-charcoal/10 cursor-pointer hover:border-terracotta/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIndices.has(index)}
                      onChange={() => handleToggleMeal(index)}
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

              {/* Import error */}
              {importError && (
                <div className="mt-4 bg-red-100 text-red-700 px-4 py-3 rounded-soft text-sm">
                  {importError}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - only show when meal list is visible */}
        {showMealList && (
          <div className="border-t border-charcoal/10 p-4">
            <button
              onClick={handleImport}
              disabled={selectedCount === 0 || importing}
              className="w-full h-12 rounded-soft bg-terracotta text-white font-medium hover:bg-terracotta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importing
                ? 'Importing...'
                : `Import ${selectedCount} Meal${selectedCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
