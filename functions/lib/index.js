"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGroceryTranscript = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
// Define the secret for OpenRouter API key
const openRouterKey = (0, params_1.defineSecret)('OPENROUTER_API_KEY');
// Valid categories for grocery items
const VALID_CATEGORIES = [
    'produce',
    'meat',
    'dairy',
    'pantry',
    'frozen',
    'bakery',
    'snacks',
    'beverages',
    'baking',
];
// Valid stores
const VALID_STORES = ['costco', 'trader-joes', 'safeway', 'bel-air'];
// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    'https://tinyshaft.netlify.app',
    'http://localhost:5173',
    'http://localhost:5174',
];
// Cloud Function to parse grocery transcript
exports.parseGroceryTranscript = (0, https_1.onRequest)({
    secrets: [openRouterKey],
    maxInstances: 10,
    // Note: Public access must be set manually in Cloud Run console
}, async (req, res) => {
    // Handle CORS
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { data } = req.body;
        const transcript = data?.transcript;
        if (!transcript || typeof transcript !== 'string') {
            res.status(400).json({ error: 'Transcript is required' });
            return;
        }
        const apiKey = openRouterKey.value();
        if (!apiKey) {
            res.status(500).json({ error: 'OpenRouter API key not configured' });
            return;
        }
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://our-kitchen.app',
                'X-Title': 'Our Kitchen Grocery App',
            },
            body: JSON.stringify({
                model: 'anthropic/claude-3-haiku',
                messages: [
                    {
                        role: 'system',
                        content: `You are a grocery list parser. Extract grocery/food items from the user's speech transcript, including which store to get them from if mentioned.

RULES:
1. ONLY extract actual grocery items (food, drinks, household supplies)
2. IGNORE conversational filler like "um", "uh", "let me think", "I need", "we should get", etc.
3. IGNORE non-grocery statements like "keep talking", "you're doing great", "what else", etc.
4. Separate items that are said together (e.g., "eggs and milk" → two items: "Eggs", "Milk")
5. Capitalize item names properly (e.g., "milk" → "Milk")
6. Assign the most appropriate category to each item
7. If the user mentions a store (Costco, Trader Joe's, Safeway, Bel Air), assign that store to the items
8. Items mentioned after a store name belong to that store until a new store is mentioned
9. If no store is mentioned, use "safeway" as the default

STORES (use exactly these IDs):
- costco: Costco
- trader-joes: Trader Joe's (also matches "Trader Joe's", "TJs", "Trader Joes")
- safeway: Safeway
- bel-air: Bel Air (also matches "Bel-Air", "Belair")

CATEGORIES (use exactly these):
- produce: fruits, vegetables, herbs
- meat: meat, poultry, fish, seafood
- dairy: milk, cheese, eggs, yogurt, butter
- pantry: canned goods, pasta, rice, condiments, oils, spices
- frozen: frozen foods, ice cream
- bakery: bread, bagels, pastries
- snacks: chips, crackers, candy, cookies
- beverages: drinks, juice, soda, coffee, tea
- baking: flour, sugar, baking supplies

Respond with ONLY a JSON array of items. Each item must have: name, category, store. If no valid grocery items are found, return an empty array.

Example input: "from Costco I need eggs and milk, and from Safeway get bread and bananas"
Example output: [{"name":"Eggs","category":"dairy","store":"costco"},{"name":"Milk","category":"dairy","store":"costco"},{"name":"Bread","category":"bakery","store":"safeway"},{"name":"Bananas","category":"produce","store":"safeway"}]

Example input: "eggs milk bread"
Example output: [{"name":"Eggs","category":"dairy","store":"safeway"},{"name":"Milk","category":"dairy","store":"safeway"},{"name":"Bread","category":"bakery","store":"safeway"}]`,
                    },
                    {
                        role: 'user',
                        content: transcript,
                    },
                ],
                temperature: 0.1,
                max_tokens: 500,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', errorText);
            res.status(500).json({ error: 'Failed to process transcript' });
            return;
        }
        const responseData = await response.json();
        const content = responseData.choices?.[0]?.message?.content || '[]';
        // Parse the JSON response
        let parsedItems;
        try {
            const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
            parsedItems = JSON.parse(jsonStr);
        }
        catch {
            console.error('Failed to parse LLM response:', content);
            parsedItems = [];
        }
        // Validate and normalize items
        const items = parsedItems
            .filter((item) => typeof item.name === 'string' &&
            item.name.trim().length > 0 &&
            typeof item.category === 'string')
            .map((item) => ({
            name: item.name.trim(),
            category: VALID_CATEGORIES.includes(item.category)
                ? item.category
                : 'pantry',
            store: item.store && VALID_STORES.includes(item.store)
                ? item.store
                : 'safeway',
        }));
        res.status(200).json({ result: { items } });
    }
    catch (error) {
        console.error('Error processing transcript:', error);
        res.status(500).json({ error: 'Failed to process transcript' });
    }
});
//# sourceMappingURL=index.js.map