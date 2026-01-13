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
 * 1. Collecting unique ingredients by name (case-insensitive)
 * 2. Each ingredient becomes qty=1, unit='item'
 *
 * @param meals - Array of available meals with ingredients
 * @param weeklyEntries - Array of weekly plan entries with mealId and servings
 * @returns Array of grocery item inputs ready for database insertion
 */
export function generateGroceryItems(
  meals: Meal[],
  weeklyEntries: WeeklyMealEntry[]
): GroceryItemInput[] {
  // Map to track unique ingredients: key is lowercased name
  const uniqueMap = new Map<string, GroceryItemInput>();

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

    // Process each ingredient
    for (const ingredient of meal.ingredients) {
      // Skip ingredients without a name
      if (!ingredient.name.trim()) {
        continue;
      }

      // Create key for deduplication (case-insensitive name only)
      const key = ingredient.name.toLowerCase().trim();

      // Only add if not already present (first occurrence wins)
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          name: ingredient.name.trim(),
          qty: 1,
          unit: 'item',
          category: ingredient.category,
          store: ingredient.defaultStore,
        });
      }
    }
  }

  // Convert map values to array
  return Array.from(uniqueMap.values());
}
