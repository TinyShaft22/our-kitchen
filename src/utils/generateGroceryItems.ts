import type { Meal, WeeklyMealEntry, Category, Store } from '../types';

/**
 * Input structure for generating grocery items
 * Does not include id, householdCode, status, or source - those are added by the hook
 */
export interface GroceryItemInput {
  name: string;
  qty: number;
  unit: string;
  category: Category;
  store: Store;
}

/**
 * Generate grocery items from weekly meal plan entries
 *
 * Transforms weekly planned meals into a combined grocery list by:
 * 1. Scaling ingredient quantities based on planned vs recipe servings
 * 2. Combining duplicates (same name AND unit) by summing quantities
 *
 * @param meals - Array of available meals with ingredients
 * @param weeklyEntries - Array of weekly plan entries with mealId and servings
 * @returns Array of grocery item inputs ready for database insertion
 */
export function generateGroceryItems(
  meals: Meal[],
  weeklyEntries: WeeklyMealEntry[]
): GroceryItemInput[] {
  // Map to track combined ingredients: key is "lowercaseName|unit"
  const combinedMap = new Map<string, GroceryItemInput>();

  for (const entry of weeklyEntries) {
    // Skip entries with zero or negative servings
    if (entry.servings <= 0) {
      continue;
    }

    // Find the meal by mealId
    const meal = meals.find((m) => m.id === entry.mealId);

    // Skip if meal not found (deleted meal)
    if (!meal) {
      continue;
    }

    // Skip if meal has zero servings (prevent division by zero)
    if (meal.servings <= 0) {
      continue;
    }

    // Calculate scaling factor
    const scaleFactor = entry.servings / meal.servings;

    // Process each ingredient
    for (const ingredient of meal.ingredients) {
      const scaledQty = ingredient.qty * scaleFactor;

      // Skip ingredients with zero quantity
      if (scaledQty <= 0) {
        continue;
      }

      // Create key for deduplication (case-insensitive name + unit)
      const key = `${ingredient.name.toLowerCase()}|${ingredient.unit.toLowerCase()}`;

      if (combinedMap.has(key)) {
        // Add to existing quantity
        const existing = combinedMap.get(key)!;
        existing.qty += scaledQty;
      } else {
        // Create new entry (keep original casing from first occurrence)
        combinedMap.set(key, {
          name: ingredient.name,
          qty: scaledQty,
          unit: ingredient.unit,
          category: ingredient.category,
          store: ingredient.defaultStore,
        });
      }
    }
  }

  // Convert map values to array
  return Array.from(combinedMap.values());
}
