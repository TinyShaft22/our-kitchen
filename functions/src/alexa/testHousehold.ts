/**
 * Test Household Seeder for Amazon Certification
 *
 * Creates a test household with sample data so Amazon reviewers
 * can verify skill functionality during certification.
 *
 * HTTPS callable Cloud Function - idempotent (deletes and recreates on each call).
 *
 * Test credentials:
 *   Household ID: "test-household-cert"
 *   PIN: "9999"
 */

import { onRequest } from "firebase-functions/v2/https";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function ensureInitialized() {
  if (getApps().length === 0) {
    initializeApp();
  }
}

const HOUSEHOLD_ID = "test-household-cert";
const TEST_PIN = "9999";

interface SeedIngredient {
  name: string;
  category: string;
  defaultStore: string;
  qty?: number;
  unit?: string;
}

interface SeedMeal {
  name: string;
  servings: number;
  ingredients: SeedIngredient[];
  isBaking: boolean;
  instructions: string;
  subcategory?: string;
  householdCode: string;
}

interface SeedGroceryItem {
  name: string;
  qty: number;
  unit: string;
  category: string;
  store: string;
  status: string;
  source: string;
  householdCode: string;
}

interface SeedHouseholdItem {
  name: string;
  nameLower: string;
  store: string;
  category: string;
  householdCode: string;
}

const TEST_MEALS: SeedMeal[] = [
  {
    name: "Spaghetti Bolognese",
    servings: 4,
    isBaking: false,
    subcategory: "Italian",
    householdCode: HOUSEHOLD_ID,
    ingredients: [
      { name: "spaghetti", category: "pantry", defaultStore: "safeway", qty: 1, unit: "lb" },
      { name: "ground beef", category: "meat", defaultStore: "costco", qty: 1, unit: "lb" },
      { name: "marinara sauce", category: "pantry", defaultStore: "safeway", qty: 1, unit: "each" },
      { name: "garlic", category: "produce", defaultStore: "safeway", qty: 3, unit: "clove" },
      { name: "onion", category: "produce", defaultStore: "safeway", qty: 1, unit: "each" },
      { name: "parmesan cheese", category: "dairy", defaultStore: "costco", qty: 0.5, unit: "cup" },
    ],
    instructions:
      "1. Bring a large pot of salted water to a boil and cook spaghetti according to package directions.\n\n" +
      "2. While pasta cooks, dice onion and mince garlic.\n\n" +
      "3. Brown ground beef in a large skillet over medium-high heat, breaking it up as it cooks. Drain excess fat.\n\n" +
      "4. Add onion and garlic to the beef and cook 3-4 minutes until softened.\n\n" +
      "5. Pour in marinara sauce, stir well, and simmer 10 minutes.\n\n" +
      "6. Drain pasta and serve topped with sauce and parmesan cheese.",
  },
  {
    name: "Chicken Stir Fry",
    servings: 4,
    isBaking: false,
    householdCode: HOUSEHOLD_ID,
    ingredients: [
      { name: "chicken breast", category: "meat", defaultStore: "costco", qty: 1.5, unit: "lb" },
      { name: "broccoli", category: "produce", defaultStore: "safeway", qty: 2, unit: "cup" },
      { name: "bell pepper", category: "produce", defaultStore: "safeway", qty: 2, unit: "each" },
      { name: "soy sauce", category: "pantry", defaultStore: "safeway", qty: 3, unit: "tbsp" },
      { name: "rice", category: "pantry", defaultStore: "costco", qty: 2, unit: "cup" },
      { name: "sesame oil", category: "pantry", defaultStore: "safeway", qty: 1, unit: "tbsp" },
    ],
    instructions:
      "1. Cook rice according to package directions.\n\n" +
      "2. Cut chicken into bite-sized pieces. Chop broccoli and slice bell peppers.\n\n" +
      "3. Heat sesame oil in a wok or large skillet over high heat.\n\n" +
      "4. Add chicken and cook 5-6 minutes until golden and cooked through. Remove and set aside.\n\n" +
      "5. Add broccoli and bell pepper to the wok. Stir fry 3-4 minutes until crisp-tender.\n\n" +
      "6. Return chicken to the wok, add soy sauce, and toss everything together.\n\n" +
      "7. Serve over rice.",
  },
  {
    name: "Chocolate Chip Cookies",
    servings: 24,
    isBaking: true,
    subcategory: "Cookies",
    householdCode: HOUSEHOLD_ID,
    ingredients: [
      { name: "all-purpose flour", category: "baking", defaultStore: "safeway", qty: 2.25, unit: "cup" },
      { name: "butter", category: "dairy", defaultStore: "costco", qty: 1, unit: "cup" },
      { name: "granulated sugar", category: "baking", defaultStore: "safeway", qty: 0.75, unit: "cup" },
      { name: "brown sugar", category: "baking", defaultStore: "safeway", qty: 0.75, unit: "cup" },
      { name: "eggs", category: "dairy", defaultStore: "safeway", qty: 2, unit: "each" },
      { name: "vanilla extract", category: "baking", defaultStore: "safeway", qty: 1, unit: "tsp" },
      { name: "chocolate chips", category: "baking", defaultStore: "costco", qty: 2, unit: "cup" },
      { name: "baking soda", category: "baking", defaultStore: "safeway", qty: 1, unit: "tsp" },
      { name: "salt", category: "pantry", defaultStore: "safeway", qty: 1, unit: "tsp" },
    ],
    instructions:
      "1. Preheat oven to 375 degrees F.\n\n" +
      "2. Cream together butter, granulated sugar, and brown sugar until fluffy.\n\n" +
      "3. Beat in eggs one at a time, then add vanilla extract.\n\n" +
      "4. In a separate bowl, whisk flour, baking soda, and salt.\n\n" +
      "5. Gradually mix dry ingredients into the wet mixture until just combined.\n\n" +
      "6. Fold in chocolate chips.\n\n" +
      "7. Drop rounded tablespoons onto ungreased baking sheets.\n\n" +
      "8. Bake 9-11 minutes until golden brown. Cool on baking sheet for 2 minutes before transferring to a wire rack.",
  },
];

const TEST_GROCERY_ITEMS: SeedGroceryItem[] = [
  {
    name: "Milk",
    qty: 1,
    unit: "gallon",
    category: "dairy",
    store: "safeway",
    status: "need",
    source: "manual",
    householdCode: HOUSEHOLD_ID,
  },
  {
    name: "Bread",
    qty: 1,
    unit: "each",
    category: "bakery",
    store: "safeway",
    status: "need",
    source: "manual",
    householdCode: HOUSEHOLD_ID,
  },
  {
    name: "Chicken breast",
    qty: 2,
    unit: "lb",
    category: "meat",
    store: "costco",
    status: "need",
    source: "manual",
    householdCode: HOUSEHOLD_ID,
  },
];

const TEST_HOUSEHOLD_ITEMS: SeedHouseholdItem[] = [
  {
    name: "Paper towels",
    nameLower: "paper towels",
    store: "costco",
    category: "pantry",
    householdCode: HOUSEHOLD_ID,
  },
  {
    name: "Dish soap",
    nameLower: "dish soap",
    store: "safeway",
    category: "pantry",
    householdCode: HOUSEHOLD_ID,
  },
];

export const seedTestHousehold = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  ensureInitialized();
  const db = getFirestore();

  try {
    // Step 1: Delete existing test data (idempotent)
    const batch = db.batch();

    // Delete existing meals for this household
    const existingMeals = await db.collection("meals").where("householdCode", "==", HOUSEHOLD_ID).get();
    existingMeals.forEach((doc) => batch.delete(doc.ref));

    // Delete existing grocery items
    const existingGrocery = await db.collection("groceryItems").where("householdCode", "==", HOUSEHOLD_ID).get();
    existingGrocery.forEach((doc) => batch.delete(doc.ref));

    // Delete existing household items
    const existingHousehold = await db.collection("householdItems").where("householdCode", "==", HOUSEHOLD_ID).get();
    existingHousehold.forEach((doc) => batch.delete(doc.ref));

    // Delete existing weekly meals
    const existingWeekly = await db.collection("weeklyMeals").where("householdCode", "==", HOUSEHOLD_ID).get();
    existingWeekly.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();

    // Step 2: Create household document with PIN
    await db.collection("households").doc(HOUSEHOLD_ID).set({
      members: ["test-reviewer"],
      alexaPin: TEST_PIN,
      name: "Test Kitchen",
    });

    // Step 3: Seed meals
    const mealIds: string[] = [];
    for (const meal of TEST_MEALS) {
      const ref = await db.collection("meals").add(meal);
      mealIds.push(ref.id);
    }

    // Step 4: Seed grocery items
    for (const item of TEST_GROCERY_ITEMS) {
      await db.collection("groceryItems").add(item);
    }

    // Step 5: Seed household items
    for (const item of TEST_HOUSEHOLD_ITEMS) {
      await db.collection("householdItems").add(item);
    }

    // Step 6: Create weekly meal plan with first 2 meals assigned to days
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    const weekId = weekStart.toISOString().split("T")[0];

    await db.collection("weeklyMeals").add({
      weekId,
      householdCode: HOUSEHOLD_ID,
      meals: [
        { mealId: mealIds[0], servings: 4, day: 2 }, // Spaghetti on Tuesday
        { mealId: mealIds[1], servings: 4, day: 4 }, // Stir Fry on Thursday
      ],
      desserts: [
        { mealId: mealIds[2], servings: 24, day: 6 }, // Cookies on Saturday
      ],
    });

    res.status(200).json({
      success: true,
      householdId: HOUSEHOLD_ID,
      pin: TEST_PIN,
      mealsSeeded: mealIds.length,
      groceryItemsSeeded: TEST_GROCERY_ITEMS.length,
      householdItemsSeeded: TEST_HOUSEHOLD_ITEMS.length,
      weeklyPlanCreated: true,
    });
  } catch (error) {
    console.error("seedTestHousehold error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});
