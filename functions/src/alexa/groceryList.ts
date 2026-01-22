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

interface GroceryItemResponse {
  id: string;
  name: string;
  category: string;
  store: string;
  quantity?: number;
  unit?: string;
}

/**
 * GET /groceryList - Get unchecked grocery items for a household
 *
 * Params: householdCode (required), store (optional - filter by store)
 * Response: { items: [{ id, name, category, store, quantity?, unit? }] }
 *
 * Returns items where status is 'need' or 'out' (not in cart, not bought).
 * When store param provided, filters to only that store (case-insensitive).
 * Sorted by category for organized reading.
 * Capped at 20 items (Alexa can't reasonably read more).
 */
export const groceryList = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
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
    res.status(405).json({ items: [], error: "Method not allowed" });
    return;
  }

  // Check API key
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  if (apiKey !== API_KEY) {
    res.status(401).json({ items: [], error: "Invalid API key" });
    return;
  }

  try {
    const householdCode = req.query.householdCode as string;

    // Validate householdCode is provided
    if (!householdCode) {
      res.status(400).json({ items: [], error: "Missing householdCode parameter" });
      return;
    }

    const db = getFirestore();

    // Query grocery items for this household that aren't in cart
    // Status 'need' or 'out' means item is on the list to buy
    const groceryRef = db.collection("groceryItems");
    const snapshot = await groceryRef
      .where("householdCode", "==", householdCode)
      .where("status", "in", ["need", "out"])
      .get();

    if (snapshot.empty) {
      res.status(200).json({ items: [] });
      return;
    }

    // Get optional store filter param
    const storeFilter = req.query.store as string | undefined;

    // Build response items
    let items: GroceryItemResponse[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const item: GroceryItemResponse = {
        id: doc.id,
        name: data.name,
        category: data.category || "pantry",
        store: data.storeName || "",
      };

      if (data.qty) item.quantity = data.qty;
      if (data.unit) item.unit = data.unit;

      return item;
    });

    // Apply store filter if provided (case-insensitive)
    if (storeFilter) {
      items = items.filter(
        (item) => item.store.toLowerCase() === storeFilter.toLowerCase()
      );
    }

    // Sort by category for organized reading
    const categoryOrder = [
      "produce",
      "meat",
      "dairy",
      "bakery",
      "frozen",
      "pantry",
      "baking",
      "snacks",
      "beverages",
    ];

    items.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      return aIndex - bIndex;
    });

    // Cap at 20 items (Alexa can't reasonably read more)
    const cappedItems = items.slice(0, 20);

    res.status(200).json({ items: cappedItems });
  } catch (error) {
    console.error("groceryList error:", error);
    res.status(500).json({ items: [], error: "Internal server error" });
  }
});
