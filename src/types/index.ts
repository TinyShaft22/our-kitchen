import { Timestamp } from 'firebase/firestore';

// Store type - the stores available in the app
export type Store = 'costco' | 'trader-joes' | 'safeway' | 'bel-air' | 'walmart' | 'winco';

// Category type - grocery item categories
export type Category =
  | 'produce'
  | 'meat'
  | 'dairy'
  | 'pantry'
  | 'frozen'
  | 'bakery'
  | 'snacks'
  | 'beverages'
  | 'baking';

// Store options for UI display
export const STORES: { id: Store; name: string }[] = [
  { id: 'costco', name: 'Costco' },
  { id: 'trader-joes', name: "Trader Joe's" },
  { id: 'safeway', name: 'Safeway' },
  { id: 'bel-air', name: 'Bel Air' },
  { id: 'walmart', name: 'Walmart' },
  { id: 'winco', name: 'WinCo' },
];

// Category options for UI display
export const CATEGORIES: { id: Category; name: string }[] = [
  { id: 'produce', name: 'Produce' },
  { id: 'meat', name: 'Meat' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'pantry', name: 'Pantry' },
  { id: 'frozen', name: 'Frozen' },
  { id: 'bakery', name: 'Bakery' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'baking', name: 'Baking' },
];

// Baking unit options for ingredient quantities
export const BAKING_UNITS = [
  'tsp',
  'tbsp',
  'cup',
  'oz',
  'lb',
  'g',
  'kg',
  'ml',
  'L',
  'pinch',
  'dash',
  'each',
  'pkg',
] as const;

export type BakingUnit = typeof BAKING_UNITS[number];

// Ingredient - used within meals (simplified: no qty/unit for regular meals, optional for baking)
export interface Ingredient {
  name: string;
  category: Category;
  defaultStore: Store;
  qty?: number;   // Optional quantity (used for baking recipes)
  unit?: string;  // Optional unit (used for baking recipes)
}

// Meal - a recipe with ingredients
export interface Meal {
  id: string;
  name: string;
  servings: number;
  ingredients: Ingredient[];
  isBaking: boolean;
  instructions?: string;
  imageUrl?: string;
  subcategory?: string;  // Optional folder/group name (e.g., "Indian", "Broma Recipes")
  householdCode: string;
}

// WeeklyMealEntry - a meal reference within a weekly plan
export interface WeeklyMealEntry {
  mealId: string;
  servings: number;
}

// WeeklySnackEntry - a snack reference within a weekly plan
export interface WeeklySnackEntry {
  snackId: string;
  qty: number;
}

// WeeklyMeal - the weekly meal plan
export interface WeeklyMeal {
  id: string;
  weekId: string;
  meals: WeeklyMealEntry[];
  snacks?: WeeklySnackEntry[]; // Optional snacks for the week
  householdCode: string;
  alreadyHave?: string[]; // Ingredient names (lowercase) to exclude from grocery generation
}

// GroceryItem status type
export type GroceryStatus = 'need' | 'out' | 'in-cart' | 'bought';

// GroceryItem source type
export type GrocerySource = 'meal' | 'manual' | 'quick-add' | 'staple' | 'baking' | 'snack';

// GroceryItem - an item on the grocery list
export interface GroceryItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: Category;
  store: Store;
  status: GroceryStatus;
  source: GrocerySource;
  householdCode: string;
}

// Staple - an always-grab item
export interface Staple {
  id: string;
  name: string;
  store: Store;
  category: Category;
  enabled: boolean;
  householdCode: string;
}

// BakingEssential status type
export type BakingStatus = 'stocked' | 'low' | 'out';

// BakingEssential - Bella's baking inventory item
export interface BakingEssential {
  id: string;
  name: string;
  store: Store;
  status: BakingStatus;
  imageUrl?: string;
  householdCode: string;
}

// BoughtHistoryItem - a grocery item that was purchased (historical record)
export interface BoughtHistoryItem {
  name: string;
  qty: number;
  unit: string;
  category: Category;
  store: Store;
  status: GroceryStatus;
  source: GrocerySource;
}

// BoughtHistory - a record of a completed shopping trip
export interface BoughtHistory {
  id: string;
  items: BoughtHistoryItem[];
  date: Timestamp;
  householdCode: string;
}

// Household - the household document
export interface Household {
  members: string[];
}

// Snack - a quick grab item that can be added to weekly plan
export interface Snack {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category: Category;
  defaultStore: Store;
  imageUrl?: string;
  householdCode: string;
}

// ScannedProduct - cached barcode lookup result
export interface ScannedProduct {
  id: string;
  barcode: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  source: 'off' | 'manual'; // 'off' = Open Food Facts, 'manual' = user entered
  householdCode: string;
  lastUpdated: Date;
}
