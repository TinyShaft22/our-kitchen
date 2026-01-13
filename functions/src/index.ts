import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

// Define the secret for OpenRouter API key
const openRouterKey = defineSecret('OPENROUTER_API_KEY');

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
] as const;

type Category = (typeof VALID_CATEGORIES)[number];

interface ParsedItem {
  name: string;
  category: Category;
  store: string;
}

interface ParseTranscriptRequest {
  transcript: string;
}

interface ParseTranscriptResponse {
  items: ParsedItem[];
}

// The Cloud Function to parse grocery transcript
export const parseGroceryTranscript = onCall<ParseTranscriptRequest>(
  {
    secrets: [openRouterKey],
    cors: true,
    maxInstances: 10,
  },
  async (request): Promise<ParseTranscriptResponse> => {
    const { transcript } = request.data;

    if (!transcript || typeof transcript !== 'string') {
      throw new HttpsError('invalid-argument', 'Transcript is required');
    }

    const apiKey = openRouterKey.value();
    if (!apiKey) {
      throw new HttpsError('internal', 'OpenRouter API key not configured');
    }

    try {
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
              content: `You are a grocery list parser. Extract ONLY grocery/food items from the user's speech transcript.

RULES:
1. ONLY extract actual grocery items (food, drinks, household supplies)
2. IGNORE conversational filler like "um", "uh", "let me think", "I need", "we should get", etc.
3. IGNORE non-grocery statements like "keep talking", "you're doing great", "what else", etc.
4. Separate items that are said together (e.g., "eggs and milk" → two items: "Eggs", "Milk")
5. Capitalize item names properly (e.g., "milk" → "Milk")
6. Assign the most appropriate category to each item

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

Respond with ONLY a JSON array of items. If no valid grocery items are found, return an empty array.

Example input: "um let me think eggs and milk also some bread and uh maybe bananas"
Example output: [{"name":"Eggs","category":"dairy"},{"name":"Milk","category":"dairy"},{"name":"Bread","category":"bakery"},{"name":"Bananas","category":"produce"}]`,
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
        throw new HttpsError('internal', 'Failed to process transcript');
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '[]';

      // Parse the JSON response
      let parsedItems: Array<{ name: string; category: string }>;
      try {
        // Handle potential markdown code blocks in response
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        parsedItems = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse LLM response:', content);
        parsedItems = [];
      }

      // Validate and normalize items
      const items: ParsedItem[] = parsedItems
        .filter(
          (item): item is { name: string; category: string } =>
            typeof item.name === 'string' &&
            item.name.trim().length > 0 &&
            typeof item.category === 'string'
        )
        .map((item) => ({
          name: item.name.trim(),
          category: VALID_CATEGORIES.includes(item.category as Category)
            ? (item.category as Category)
            : 'pantry',
          store: 'safeway', // Default store
        }));

      return { items };
    } catch (error) {
      console.error('Error processing transcript:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to process transcript');
    }
  }
);
