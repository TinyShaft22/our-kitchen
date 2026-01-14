import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

// Type definitions matching the PWA
type Category =
  | "produce"
  | "meat"
  | "dairy"
  | "pantry"
  | "frozen"
  | "bakery"
  | "snacks"
  | "beverages"
  | "baking";

type Store =
  | "costco"
  | "trader-joes"
  | "safeway"
  | "bel-air"
  | "walmart"
  | "winco";

interface Ingredient {
  name: string;
  category: Category;
  defaultStore: Store;
  qty?: number;
  unit?: string;
}

interface ImportRecipeRequest {
  name: string;
  servings: number;
  ingredients: string[]; // Raw ingredient strings from shortcut
  instructions: string;
  imageBase64?: string; // Optional screenshot
  sourceUrl?: string;
  householdCode: string;
}

/**
 * Parse ingredient string into structured Ingredient object
 * Input formats: "1 cup flour", "flour", "2 tbsp sugar", etc.
 * Default category: pantry, Default store: safeway
 */
function parseIngredient(raw: string): Ingredient {
  // Remove emojis and trim
  const cleaned = raw
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/^[-•*]\s*/, "")
    .trim();

  // Try to extract quantity and unit
  const qtyUnitMatch = cleaned.match(
    /^([\d./]+)\s*(tsp|tbsp|cup|cups|oz|lb|lbs|g|kg|ml|L|pinch|dash|each|pkg|can|cans|cloves?|pieces?|slices?)?\s+(.+)$/i
  );

  if (qtyUnitMatch) {
    const qty = parseFloat(qtyUnitMatch[1]) || 1;
    const unit = qtyUnitMatch[2]?.toLowerCase() || "each";
    const name = qtyUnitMatch[3].trim();

    return {
      name,
      category: "pantry",
      defaultStore: "safeway",
      qty,
      unit: normalizeUnit(unit),
    };
  }

  // No quantity found, just use the name
  return {
    name: cleaned,
    category: "pantry",
    defaultStore: "safeway",
  };
}

/**
 * Normalize unit strings (cups -> cup, lbs -> lb, etc.)
 */
function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase();
  const mapping: Record<string, string> = {
    cups: "cup",
    lbs: "lb",
    cans: "can",
    cloves: "clove",
    pieces: "piece",
    slices: "slice",
  };
  return mapping[normalized] || normalized;
}

/**
 * Import Recipe from iOS Shortcut
 * 
 * POST /importRecipe
 * Body: ImportRecipeRequest
 * 
 * Returns: { success: boolean, mealId?: string, error?: string }
 */
export const importRecipe = functions.https.onRequest(async (req, res) => {
  // Enable CORS for iOS Shortcuts
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

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

  try {
    const data = req.body as ImportRecipeRequest;

    // Validate required fields
    if (!data.householdCode) {
      res.status(400).json({ success: false, error: "Missing householdCode" });
      return;
    }
    if (!data.name) {
      res.status(400).json({ success: false, error: "Missing recipe name" });
      return;
    }

    // Validate household exists
    const householdRef = db.collection("households").doc(data.householdCode);
    const householdDoc = await householdRef.get();
    
    if (!householdDoc.exists) {
      res.status(404).json({ 
        success: false, 
        error: "Household not found. Check your household code." 
      });
      return;
    }

    // Parse ingredients
    const ingredients: Ingredient[] = (data.ingredients || [])
      .filter((i) => i && i.trim())
      .map(parseIngredient);

    // Prepare meal document
    const mealData: Record<string, unknown> = {
      name: data.name.trim(),
      servings: data.servings || 4,
      ingredients,
      isBaking: false,
      instructions: data.instructions || "",
      householdCode: data.householdCode,
    };

    // Add source URL if provided
    if (data.sourceUrl) {
      mealData.sourceUrl = data.sourceUrl;
    }

    // Create meal document first to get ID
    const mealRef = await db.collection("meals").add(mealData);
    const mealId = mealRef.id;

    // Upload image if provided
    if (data.imageBase64) {
      try {
        // Decode base64 image
        const imageBuffer = Buffer.from(data.imageBase64, "base64");
        
        // Upload to Storage
        const bucket = storage.bucket();
        const filePath = `meals/${data.householdCode}/${mealId}/photo.jpg`;
        const file = bucket.file(filePath);
        
        await file.save(imageBuffer, {
          metadata: {
            contentType: "image/jpeg",
          },
        });

        // Make file publicly accessible
        await file.makePublic();

        // Get public URL
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

        // Update meal with image URL
        await mealRef.update({ imageUrl });
      } catch (imageError) {
        // Log but don't fail - meal was created successfully
        console.error("Failed to upload image:", imageError);
      }
    }

    res.status(200).json({
      success: true,
      mealId,
      message: `Recipe "${data.name}" imported successfully!`,
    });
  } catch (error) {
    console.error("Import recipe error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});
