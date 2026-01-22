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
 * GET /lookupHouseholdItem - Lookup a saved household item by name
 *
 * Query params: { householdCode: string, item: string }
 * Response: { found: boolean, item?: { id, name, store, category, brand?, notes? } }
 *
 * Uses nameLower field for case-insensitive matching.
 */
export const lookupHouseholdItem = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
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
    res.status(405).json({ found: false, error: "Method not allowed" });
    return;
  }

  // Check API key
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  if (apiKey !== API_KEY) {
    res.status(401).json({ found: false, error: "Invalid API key" });
    return;
  }

  try {
    const householdCode = req.query.householdCode as string;
    const itemName = req.query.item as string;

    // Validate required params
    if (!householdCode || !itemName) {
      res.status(400).json({ found: false, error: "Missing householdCode or item" });
      return;
    }

    const db = getFirestore();
    const normalizedName = itemName.trim().toLowerCase();

    // Query by nameLower for case-insensitive match
    const snapshot = await db.collection("householdItems")
      .where("householdCode", "==", householdCode)
      .where("nameLower", "==", normalizedName)
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(200).json({ found: false });
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    res.status(200).json({
      found: true,
      item: {
        id: doc.id,
        name: data.name,
        store: data.store,
        category: data.category,
        brand: data.brand || null,
        notes: data.notes || null
      }
    });
  } catch (error) {
    console.error("lookupHouseholdItem error:", error);
    res.status(500).json({ found: false, error: "Internal server error" });
  }
});
