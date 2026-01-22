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

/**
 * POST /removeGroceryItem - Remove an item from the grocery list
 *
 * Body: { householdCode: string, item: string }
 * Response: { success: boolean, error?: string }
 *
 * Finds grocery item by name (case-insensitive) and deletes it.
 * Only removes items with status 'need' or 'out' (not already purchased).
 */
export const removeGroceryItem = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  ensureInitialized();

  // Get API key from environment (lazy evaluation ensures env is loaded)
  const API_KEY = getApiKey();

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
    const { householdCode, item } = req.body;

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

    // Query for matching item (case-insensitive match)
    // Firestore doesn't support case-insensitive queries, so we store lowercase
    // For now, do exact match and try lowercase variant
    const itemLower = item.trim().toLowerCase();
    const groceryRef = db.collection("groceryItems");

    // First try exact match
    let snapshot = await groceryRef
      .where("householdCode", "==", householdCode)
      .where("name", "==", item.trim())
      .where("status", "in", ["need", "out"])
      .limit(1)
      .get();

    // If no exact match, try lowercase
    if (snapshot.empty) {
      snapshot = await groceryRef
        .where("householdCode", "==", householdCode)
        .where("name", "==", itemLower)
        .where("status", "in", ["need", "out"])
        .limit(1)
        .get();
    }

    // If still no match, do a full scan with case-insensitive comparison
    // This is less efficient but handles mixed-case items
    if (snapshot.empty) {
      const allItems = await groceryRef
        .where("householdCode", "==", householdCode)
        .where("status", "in", ["need", "out"])
        .get();

      const matchingDoc = allItems.docs.find(
        (doc) => doc.data().name.toLowerCase() === itemLower
      );

      if (matchingDoc) {
        await matchingDoc.ref.delete();
        res.status(200).json({ success: true });
        return;
      }

      res.status(200).json({ success: false, error: "Item not found" });
      return;
    }

    // Delete the matching item
    await snapshot.docs[0].ref.delete();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("removeGroceryItem error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
