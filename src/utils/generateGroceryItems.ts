import type { Meal, WeeklyMealEntry, Category, Store, BakingEssential } from '../types';

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
 * Generate grocery items from weekly meal plan entries (EXCLUDES baking recipes)
 *
 * Transforms weekly planned meals into a combined grocery list by:
 * 1. Collecting unique ingredients by name (case-insensitive)
 * 2. Each ingredient becomes qty=1, unit='item'
 * 3. Excluding ingredients in the alreadyHave list
 * 4. SKIPPING baking recipes (isBaking === true) - those are handled separately
 *
 * @param meals - Array of available meals with ingredients
 * @param weeklyEntries - Array of weekly plan entries with mealId and servings
 * @param alreadyHave - Optional array of ingredient names (lowercase) to exclude
 * @returns Array of grocery item inputs ready for database insertion
 */
export function generateGroceryItems(
  meals: Meal[],
  weeklyEntries: WeeklyMealEntry[],
  alreadyHave: string[] = []
): GroceryItemInput[] {
  // Create a Set for O(1) lookup of already-have ingredients
  const alreadyHaveSet = new Set(alreadyHave.map((name) => name.toLowerCase().trim()));

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

    // SKIP baking recipes - they are handled separately via inventory cross-check
    if (meal.isBaking) {
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

      // Skip ingredients that user already has
      if (alreadyHaveSet.has(key)) {
        continue;
      }

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

/**
 * Generate grocery items for baking recipes based on inventory cross-check
 *
 * For baking recipes in the weekly plan:
 * 1. Collect all ingredient names from baking recipes
 * 2. Cross-check each ingredient against BakingEssentials inventory
 * 3. If a matching BakingEssential has status 'low' or 'out', add to grocery
 * 4. If status is 'stocked', don't add (we have enough)
 *
 * @param meals - Array of available meals with ingredients
 * @param weeklyEntries - Array of weekly plan entries with mealId and servings
 * @param essentials - Array of BakingEssential items for inventory cross-check
 * @returns Array of grocery item inputs ready for database insertion with source 'baking'
 */
export function generateBakingGroceryItems(
  meals: Meal[],
  weeklyEntries: WeeklyMealEntry[],
  essentials: BakingEssential[]
): GroceryItemInput[] {
  // Build a map of baking essentials by lowercased name for O(1) lookup
  const essentialsMap = new Map<string, BakingEssential>();
  for (const essential of essentials) {
    essentialsMap.set(essential.name.toLowerCase().trim(), essential);
  }

  // Set to track unique ingredient names we've already processed
  const processedIngredients = new Set<string>();

  // Result array
  const groceryItems: GroceryItemInput[] = [];

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

    // Only process baking recipes
    if (!meal.isBaking) {
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

      // Skip if we've already processed this ingredient
      if (processedIngredients.has(key)) {
        continue;
      }
      processedIngredients.add(key);

      // Look up this ingredient in baking essentials
      const matchingEssential = essentialsMap.get(key);

      // If there's a matching essential and it's low or out, add to grocery
      if (matchingEssential && (matchingEssential.status === 'low' || matchingEssential.status === 'out')) {
        groceryItems.push({
          name: matchingEssential.name, // Use the essential's name (preserves casing)
          qty: 1,
          unit: 'each',
          category: 'baking',
          store: matchingEssential.store,
        });
      }
    }
  }

  return groceryItems;
}
