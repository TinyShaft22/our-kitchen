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
 * GET /checkDuplicateGrocery - Check if item exists on grocery list
 *
 * Params: householdCode (required), item (required)
 * Response: { exists: boolean, existingItem?: { id, name, store } }
 *
 * Uses case-insensitive partial match on item name.
 */
export const checkDuplicateGrocery = onRequest(
  { cors: true, invoker: "public" },
  async (req, res) => {
    ensureInitialized();

    // Get API key from environment (lazy evaluation ensures env is loaded)
    const API_KEY = getApiKey();

    // CORS headers (same as other endpoints)
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ exists: false, error: "Method not allowed" });
      return;
    }

    const apiKey = req.headers["x-api-key"] || req.query.apiKey;
    if (apiKey !== API_KEY) {
      res.status(401).json({ exists: false, error: "Invalid API key" });
      return;
    }

    try {
      const householdCode = req.query.householdCode as string;
      const itemName = req.query.item as string;

      if (!householdCode || !itemName) {
        res
          .status(400)
          .json({ exists: false, error: "Missing householdCode or item parameter" });
        return;
      }

      const db = getFirestore();
      const groceryRef = db.collection("groceryItems");

      // Query for items on the list (not in cart)
      const snapshot = await groceryRef
        .where("householdCode", "==", householdCode)
        .where("status", "in", ["need", "out"])
        .get();

      if (snapshot.empty) {
        res.status(200).json({ exists: false });
        return;
      }

      // Case-insensitive partial match
      const searchLower = itemName.toLowerCase();
      const match = snapshot.docs.find((doc) => {
        const name = doc.data().name?.toLowerCase() || "";
        return name.includes(searchLower) || searchLower.includes(name);
      });

      if (match) {
        const data = match.data();
        res.status(200).json({
          exists: true,
          existingItem: {
            id: match.id,
            name: data.name,
            store: data.storeName || "",
          },
        });
      } else {
        res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error("checkDuplicateGrocery error:", error);
      res.status(500).json({ exists: false, error: "Internal server error" });
    }
  }
);
