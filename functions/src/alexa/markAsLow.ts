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
 * POST /markAsLow - Mark a baking/household item as low stock
 *
 * Body: { householdCode: string, item: string, itemId?: string }
 *
 * If itemId is provided, mark that specific item (disambiguation resolved).
 * If not, search for matches:
 *   1. Search bakingEssentials first (contains match on name)
 *   2. Fall back to householdItems (exact match on nameLower)
 *
 * Response:
 *   - Single match: { success: true, markedItem: {...}, source: 'baking'|'household' }
 *   - Multiple matches: { needsDisambiguation: true, matches: [...], source: 'baking' }
 *   - No match: { found: false }
 */
export const markAsLow = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
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
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  if (apiKey !== API_KEY) {
    res.status(401).json({ success: false, error: "Invalid API key" });
    return;
  }

  try {
    const { householdCode, item, itemId } = req.body;

    if (!householdCode || !item) {
      res.status(400).json({ success: false, error: "Missing householdCode or item" });
      return;
    }

    const db = getFirestore();
    const normalizedItem = item.trim().toLowerCase();

    // If itemId provided, mark that specific item (disambiguation resolved)
    if (itemId) {
      const result = await markSpecificItem(db, householdCode, itemId);
      res.status(200).json(result);
      return;
    }

    // Step 1: Search bakingEssentials (contains match)
    const bakingSnapshot = await db.collection("bakingEssentials")
      .where("householdCode", "==", householdCode)
      .get();

    // Filter for contains match (case-insensitive)
    const bakingMatches = bakingSnapshot.docs.filter(doc => {
      const name = doc.data().name?.toLowerCase() || "";
      return name.includes(normalizedItem);
    });

    if (bakingMatches.length === 1) {
      // Single baking match - mark as low
      const doc = bakingMatches[0];
      await doc.ref.update({ status: "low" });

      res.status(200).json({
        success: true,
        markedItem: {
          id: doc.id,
          name: doc.data().name,
          store: doc.data().store,
          status: "low"
        },
        source: "baking"
      });
      return;
    }

    if (bakingMatches.length > 1) {
      // Multiple baking matches - need disambiguation
      const matches = bakingMatches.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        store: doc.data().store
      }));

      res.status(200).json({
        needsDisambiguation: true,
        matches,
        source: "baking"
      });
      return;
    }

    // Step 2: Fall back to householdItems (exact match on nameLower)
    const householdSnapshot = await db.collection("householdItems")
      .where("householdCode", "==", householdCode)
      .where("nameLower", "==", normalizedItem)
      .limit(1)
      .get();

    if (!householdSnapshot.empty) {
      // Found in household items - return info for adding to grocery
      // Note: HouseholdItems don't have a status field, so we just return found
      const doc = householdSnapshot.docs[0];
      const data = doc.data();

      res.status(200).json({
        success: true,
        markedItem: {
          id: doc.id,
          name: data.name,
          store: data.store,
          category: data.category
        },
        source: "household"
      });
      return;
    }

    // Not found in either source
    res.status(200).json({ found: false });

  } catch (error) {
    console.error("markAsLow error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

/**
 * Mark a specific item by ID (after disambiguation)
 */
async function markSpecificItem(
  db: FirebaseFirestore.Firestore,
  householdCode: string,
  itemId: string
): Promise<{ success: boolean; markedItem?: Record<string, unknown>; source?: string; error?: string }> {
  // Try bakingEssentials first
  const bakingDoc = await db.collection("bakingEssentials").doc(itemId).get();

  if (bakingDoc.exists && bakingDoc.data()?.householdCode === householdCode) {
    await bakingDoc.ref.update({ status: "low" });
    const data = bakingDoc.data();
    return {
      success: true,
      markedItem: {
        id: bakingDoc.id,
        name: data?.name,
        store: data?.store,
        status: "low"
      },
      source: "baking"
    };
  }

  // Try householdItems
  const householdDoc = await db.collection("householdItems").doc(itemId).get();

  if (householdDoc.exists && householdDoc.data()?.householdCode === householdCode) {
    const data = householdDoc.data();
    return {
      success: true,
      markedItem: {
        id: householdDoc.id,
        name: data?.name,
        store: data?.store,
        category: data?.category
      },
      source: "household"
    };
  }

  return { success: false, error: "Item not found" };
}
