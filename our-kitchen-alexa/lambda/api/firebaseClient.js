const axios = require('axios');

// Cloud Functions base URL - our-kitchen-prod is the Firebase project
const CLOUD_FUNCTIONS_BASE = 'https://us-central1-grocery-store-app-c3aa5.cloudfunctions.net';
const DEFAULT_TIMEOUT = 5000; // 5 seconds - leaves buffer for Alexa's 8s timeout

/**
 * Get API key from environment variable
 *
 * For Alexa-Hosted Skills, set ALEXA_API_KEY in:
 * - Alexa Developer Console > Build > Code > Environment Variables
 * - Or via ASK CLI when deploying
 *
 * @throws Error if ALEXA_API_KEY is not set
 */
function getApiKey() {
  const apiKey = process.env.ALEXA_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ALEXA_API_KEY environment variable is not set. ' +
      'Set it in the Alexa Developer Console under Build > Code > Environment Variables.'
    );
  }
  return apiKey;
}

// Create axios client with lazy API key evaluation
// Note: Headers are set per-request to ensure env var is loaded
const client = axios.create({
  baseURL: CLOUD_FUNCTIONS_BASE,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add API key to every request via interceptor (ensures env var is loaded at request time)
client.interceptors.request.use((config) => {
  config.headers['X-API-Key'] = getApiKey();
  return config;
});

async function verifyPin(pin) {
  const response = await client.post('/verifyPin', { pin });
  return response.data;
}

async function getMeals(householdCode) {
  const response = await client.get('/meals', {
    params: { householdCode }
  });
  return response.data;
}

async function getRecipe(householdCode, mealId) {
  const response = await client.get('/recipe', {
    params: { householdCode, mealId }
  });
  return response.data;
}

async function getGroceryList(householdCode, store = null) {
  const params = { householdCode };
  if (store) {
    params.store = store;
  }
  const response = await client.get('/groceryList', { params });
  return response.data;
}

async function addGroceryItem(householdCode, item, quantity) {
  const response = await client.post('/addGroceryItem', {
    householdCode,
    item,
    quantity
  });
  return response.data;
}

async function removeGroceryItem(householdCode, item) {
  const response = await client.post('/removeGroceryItem', {
    householdCode,
    item
  });
  return response.data;
}

async function checkDuplicateGrocery(householdCode, item) {
  const response = await client.get('/checkDuplicateGrocery', {
    params: { householdCode, item }
  });
  return response.data;
}

async function lookupHouseholdItem(householdCode, item) {
  const response = await client.get('/lookupHouseholdItem', {
    params: { householdCode, item }
  });
  return response.data;
}

async function addGroceryItemWithDefaults(householdCode, item, quantity, store, category) {
  const response = await client.post('/addGroceryItem', {
    householdCode,
    item,
    quantity,
    store,
    category
  });
  return response.data;
}

/**
 * Mark an item as low stock
 * @param {string} householdCode - Household identifier
 * @param {string} item - Item name to search for
 * @param {string} [itemId] - Optional specific item ID (for disambiguation)
 * @returns {Promise<Object>} Result with success/needsDisambiguation/found status
 */
async function markAsLow(householdCode, item, itemId = null) {
  const body = { householdCode, item };
  if (itemId) {
    body.itemId = itemId;
  }
  const response = await client.post('/markAsLow', body);
  return response.data;
}

module.exports = {
  verifyPin,
  getMeals,
  getRecipe,
  getGroceryList,
  addGroceryItem,
  removeGroceryItem,
  checkDuplicateGrocery,
  lookupHouseholdItem,
  addGroceryItemWithDefaults,
  markAsLow
};
