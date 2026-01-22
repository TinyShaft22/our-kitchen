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
 * POST /verifyPin - Verify household PIN for Alexa linking
 *
 * Body: { pin: string }
 * Response: { valid: boolean, householdCode?: string }
 *
 * Queries households collection for document where alexaPin matches.
 * The alexaPin field stores the 4-digit PIN as a string on each household doc.
 */
export const verifyPin = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
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
    res.status(405).json({ valid: false, error: "Method not allowed" });
    return;
  }

  // Check API key
  const apiKey = req.headers["x-api-key"] || req.body?.apiKey;
  if (apiKey !== API_KEY) {
    res.status(401).json({ valid: false, error: "Invalid API key" });
    return;
  }

  try {
    const { pin } = req.body;

    // Validate PIN is provided
    if (!pin || typeof pin !== "string") {
      res.status(400).json({ valid: false, error: "Missing or invalid PIN" });
      return;
    }

    // Look up household by document ID (the PIN IS the household code)
    const db = getFirestore();
    const householdRef = db.collection("households").doc(pin);
    const householdDoc = await householdRef.get();

    if (!householdDoc.exists) {
      res.status(200).json({ valid: false });
      return;
    }

    // Found matching household - the PIN is the household code
    res.status(200).json({
      valid: true,
      householdCode: pin,
    });
  } catch (error) {
    console.error("verifyPin error:", error);
    res.status(500).json({ valid: false, error: "Internal server error" });
  }
});
