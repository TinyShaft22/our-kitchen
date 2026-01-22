const axios = require('axios');

// Cloud Functions base URL - our-kitchen-prod is the Firebase project
const CLOUD_FUNCTIONS_BASE = 'https://us-central1-grocery-store-app-c3aa5.cloudfunctions.net';
const API_KEY = 'ourkitchen2024';
const DEFAULT_TIMEOUT = 5000; // 5 seconds - leaves buffer for Alexa's 8s timeout

const client = axios.create({
  baseURL: CLOUD_FUNCTIONS_BASE,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  }
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

module.exports = {
  verifyPin,
  getMeals,
  getRecipe,
  getGroceryList,
  addGroceryItem,
  removeGroceryItem,
  checkDuplicateGrocery,
  lookupHouseholdItem,
  addGroceryItemWithDefaults
};
