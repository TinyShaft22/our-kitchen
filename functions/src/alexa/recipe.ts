import { onRequest } from "firebase-functions/v2/https";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Helper to ensure Firebase is initialized
function ensureInitialized() {
  if (getApps().length === 0) {
    initializeApp();
  }
}

// Simple API key for Alexa access
const API_KEY = "ourkitchen2024";

interface IngredientResponse {
  name: string;
  qty?: number;
  unit?: string;
}

interface RecipeResponse {
  name: string;
  ingredients: IngredientResponse[];
  instructions: string[];
}

/**
 * Parse instructions text into array of steps
 * Handles numbered lists, bullet points, or newline-separated text
 */
function parseInstructions(raw: string | undefined): string[] {
  if (!raw || typeof raw !== "string") {
    return [];
  }

  // Split by newlines first
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);

  // Remove numbering/bullets from each line
  const steps = lines.map((line) => {
    // Remove patterns like "1.", "1)", "Step 1:", "-", "•", etc.
    return line
      .replace(/^(\d+[\.\):]?\s*|step\s*\d+[\.:]\s*|[-•*]\s*)/i, "")
      .trim();
  }).filter((step) => step.length > 0);

  return steps;
}

/**
 * GET /recipe - Get recipe details for a specific meal
 *
 * Params: householdCode (required), mealId (required)
 * Response: { name, ingredients: [{ name, qty?, unit? }], instructions: string[] }
 *
 * Fetches meal document and returns structured recipe data for Alexa reading.
 */
export const recipe = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  ensureInitialized();

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
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Check API key
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  if (apiKey !== API_KEY) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  try {
    const householdCode = req.query.householdCode as string;
    const mealId = req.query.mealId as string;

    // Validate required params
    if (!householdCode) {
      res.status(400).json({ error: "Missing householdCode parameter" });
      return;
    }
    if (!mealId) {
      res.status(400).json({ error: "Missing mealId parameter" });
      return;
    }

    const db = getFirestore();

    // Fetch meal document
    const mealRef = db.collection("meals").doc(mealId);
    const mealDoc = await mealRef.get();

    if (!mealDoc.exists) {
      res.status(404).json({ error: "Meal not found" });
      return;
    }

    const mealData = mealDoc.data();

    // Security check: verify meal belongs to this household
    if (mealData?.householdCode !== householdCode) {
      res.status(403).json({ error: "Access denied - meal belongs to different household" });
      return;
    }

    // Build ingredients response
    const ingredients: IngredientResponse[] = (mealData?.ingredients || []).map(
      (ing: { name: string; qty?: number; unit?: string }) => {
        const response: IngredientResponse = { name: ing.name };
        if (ing.qty) response.qty = ing.qty;
        if (ing.unit) response.unit = ing.unit;
        return response;
      }
    );

    // Parse instructions into steps
    const instructions = parseInstructions(mealData?.instructions);

    const recipeResponse: RecipeResponse = {
      name: mealData?.name || "Unknown Recipe",
      ingredients,
      instructions,
    };

    res.status(200).json(recipeResponse);
  } catch (error) {
    console.error("recipe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
