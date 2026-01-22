/**
 * Alexa REST API Endpoints
 *
 * All endpoints require X-API-Key header with valid API key (from ALEXA_API_KEY env var)
 *
 * POST /verifyPin - Verify household PIN
 *   Body: { pin: string }
 *   Response: { valid: boolean, householdCode?: string }
 *
 * GET /meals - Get weekly meal plan
 *   Params: householdCode
 *   Response: { meals: [{ id, name, day? }] }
 *
 * GET /recipe - Get recipe details
 *   Params: householdCode, mealId
 *   Response: { name, ingredients: [{ name, qty?, unit? }], instructions: string[] }
 *
 * GET /groceryList - Get unchecked grocery items
 *   Params: householdCode
 *   Response: { items: [{ id, name, category, quantity?, unit? }] }
 *
 * POST /addGroceryItem - Add item to grocery list
 *   Body: { householdCode, item, quantity? }
 *   Response: { success: boolean, itemId?: string }
 *
 * POST /removeGroceryItem - Remove item from grocery list
 *   Body: { householdCode, item }
 *   Response: { success: boolean, error?: string }
 *
 * IMPORTANT: Household documents must have an "alexaPin" field (4-digit string)
 * for PIN verification to work. Users can set this in the app UI or manually
 * in Firestore until the PIN management UI is built.
 */

export { verifyPin } from "./verifyPin";
export { meals } from "./meals";
export { recipe } from "./recipe";
export { groceryList } from "./groceryList";
export { addGroceryItem } from "./addGroceryItem";
export { removeGroceryItem } from "./removeGroceryItem";
export { checkDuplicateGrocery } from "./checkDuplicateGrocery";
export { lookupHouseholdItem } from "./lookupHouseholdItem";
