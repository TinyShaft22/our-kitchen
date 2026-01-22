import { onRequest } from "firebase-functions/v2/https";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Helper to ensure Firebase is initialized
function ensureInitialized() {
  if (getApps().length === 0) {
    initializeApp();
  }
}

// Simple API key for Alexa access
const API_KEY = "ourkitchen2024";

/**
 * POST /addGroceryItem - Add an item to the grocery list
 *
 * Body: { householdCode: string, item: string, quantity?: number }
 * Response: { success: boolean, itemId?: string }
 *
 * Creates a new grocery item with default category "pantry" and store "safeway".
 * These can be refined later in the app UI.
 */
export const addGroceryItem = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  ensureInitialized();

  // CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  // Check API key
  const apiKey = req.headers["x-api-key"] || req.body?.apiKey;
  if (apiKey !== API_KEY) {
    res.status(401).json({ success: false, error: "Invalid API key" });
    return;
  }

  try {
    const { householdCode, item, quantity, store, category } = req.body;

    // Validate required params
    if (!householdCode) {
      res.status(400).json({ success: false, error: "Missing householdCode" });
      return;
    }
    if (!item || typeof item !== "string") {
      res.status(400).json({ success: false, error: "Missing or invalid item name" });
      return;
    }

    const db = getFirestore();

    // Create new grocery item document
    // Use provided store/category if given (from household item lookup), otherwise defaults
    const groceryData = {
      name: item.trim(),
      householdCode,
      category: category || "pantry", // Use provided or default to pantry
      store: store || "safeway", // Use provided or default to safeway
      qty: quantity || 1,
      unit: "each",
      status: "need",
      source: "manual", // Voice-added items are manual source
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("groceryItems").add(groceryData);

    res.status(200).json({
      success: true,
      itemId: docRef.id,
    });
  } catch (error) {
    console.error("addGroceryItem error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
