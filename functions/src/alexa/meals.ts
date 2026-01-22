import { onRequest } from "firebase-functions/v2/https";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getApiKey } from "../config";

// Helper to ensure Firebase is initialized
function ensureInitialized() {
  if (getApps().length === 0) {
    initializeApp();
  }
}

interface MealResponse {
  id: string;
  name: string;
  day?: number; // DayOfWeek (1-7)
}

/**
 * GET /meals - Get weekly meal plan for a household
 *
 * Params: householdCode (required)
 * Response: { meals: [{ id, name, day? }] }
 *
 * Fetches weeklyMeals collection and enriches with meal names from meals collection.
 */
export const meals = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  ensureInitialized();

  // Get API key from environment (lazy evaluation ensures env is loaded)
  const API_KEY = getApiKey();

  // CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Only allow GET
  if (req.method !== "GET") {
    res.status(405).json({ meals: [], error: "Method not allowed" });
    return;
  }

  // Check API key
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  if (apiKey !== API_KEY) {
    res.status(401).json({ meals: [], error: "Invalid API key" });
    return;
  }

  try {
    const householdCode = req.query.householdCode as string;

    // Validate householdCode is provided
    if (!householdCode) {
      res.status(400).json({ meals: [], error: "Missing householdCode parameter" });
      return;
    }

    const db = getFirestore();

    // Get weekly meals for this household
    const weeklyMealsRef = db.collection("weeklyMeals");
    const weeklySnapshot = await weeklyMealsRef
      .where("householdCode", "==", householdCode)
      .limit(1)
      .get();

    if (weeklySnapshot.empty) {
      // No weekly plan yet - return empty array (not an error)
      res.status(200).json({ meals: [] });
      return;
    }

    const weeklyDoc = weeklySnapshot.docs[0];
    const weeklyData = weeklyDoc.data();
    const mealEntries = weeklyData.meals || [];

    if (mealEntries.length === 0) {
      res.status(200).json({ meals: [] });
      return;
    }

    // Fetch meal names for each entry
    const mealIds = mealEntries.map((entry: { mealId: string }) => entry.mealId);
    const mealsRef = db.collection("meals");

    // Fetch all meals in parallel
    const mealDocs = await Promise.all(
      mealIds.map((id: string) => mealsRef.doc(id).get())
    );

    // Build response with meal names and days
    const mealsResponse: MealResponse[] = [];
    for (let i = 0; i < mealEntries.length; i++) {
      const entry = mealEntries[i];
      const mealDoc = mealDocs[i];

      if (mealDoc.exists) {
        const mealData = mealDoc.data();
        const mealResponse: MealResponse = {
          id: entry.mealId,
          name: mealData?.name || "Unknown Meal",
        };

        // Include day if present
        if (entry.day) {
          mealResponse.day = entry.day;
        }

        mealsResponse.push(mealResponse);
      }
    }

    res.status(200).json({ meals: mealsResponse });
  } catch (error) {
    console.error("meals error:", error);
    res.status(500).json({ meals: [], error: "Internal server error" });
  }
});
