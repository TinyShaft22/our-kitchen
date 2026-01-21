// Seed script to add standard baking supplies to Firestore
// Run with: node scripts/seed-baking-supplies.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { config } from 'dotenv';

// Load environment variables
config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const HOUSEHOLD_CODE = '0428';
const DEFAULT_STORE = 'costco';
const DEFAULT_STATUS = 'stocked';

// Standard baking supplies from Costco (bulk sizes) with subcategories
const bakingSupplies = [
  // Flours & Grains
  { name: 'All-Purpose Flour', subcategory: 'flours' },
  { name: 'Bread Flour', subcategory: 'flours' },
  { name: 'Whole Wheat Flour', subcategory: 'flours' },
  { name: 'Almond Flour', subcategory: 'flours' },
  { name: 'Oat Flour', subcategory: 'flours' },
  { name: 'Cornstarch', subcategory: 'flours' },

  // Sugars & Sweeteners
  { name: 'Granulated Sugar', subcategory: 'sugars' },
  { name: 'Brown Sugar', subcategory: 'sugars' },
  { name: 'Powdered Sugar', subcategory: 'sugars' },
  { name: 'Pure Maple Syrup', subcategory: 'sugars' },
  { name: 'Honey', subcategory: 'sugars' },
  { name: 'Vanilla Extract', subcategory: 'sugars' },

  // Leavening & Baking Essentials
  { name: 'Baking Soda', subcategory: 'leavening' },
  { name: 'Baking Powder', subcategory: 'leavening' },
  { name: 'Active Dry Yeast', subcategory: 'leavening' },
  { name: 'Cream of Tartar', subcategory: 'leavening' },

  // Fats & Oils
  { name: 'Unsalted Butter', subcategory: 'fats' },
  { name: 'Salted Butter', subcategory: 'fats' },
  { name: 'Vegetable Oil', subcategory: 'fats' },
  { name: 'Canola Oil', subcategory: 'fats' },
  { name: 'Coconut Oil', subcategory: 'fats' },
  { name: 'Olive Oil', subcategory: 'fats' },
  { name: 'Vegetable Shortening', subcategory: 'fats' },

  // Dairy & Eggs
  { name: 'Large Eggs', subcategory: 'dairy' },
  { name: 'Heavy Whipping Cream', subcategory: 'dairy' },
  { name: 'Whole Milk', subcategory: 'dairy' },
  { name: 'Buttermilk', subcategory: 'dairy' },
  { name: 'Cream Cheese', subcategory: 'dairy' },
  { name: 'Sour Cream', subcategory: 'dairy' },

  // Chocolate & Chips
  { name: 'Semi-Sweet Chocolate Chips', subcategory: 'chocolate' },
  { name: 'Dark Chocolate Chips', subcategory: 'chocolate' },
  { name: 'White Chocolate Chips', subcategory: 'chocolate' },
  { name: 'Cocoa Powder', subcategory: 'chocolate' },
  { name: 'Baking Chocolate (Unsweetened)', subcategory: 'chocolate' },

  // Nuts & Dried Fruits
  { name: 'Walnuts', subcategory: 'nuts' },
  { name: 'Pecans', subcategory: 'nuts' },
  { name: 'Almonds (Sliced)', subcategory: 'nuts' },
  { name: 'Raisins', subcategory: 'nuts' },
  { name: 'Dried Cranberries', subcategory: 'nuts' },
  { name: 'Shredded Coconut', subcategory: 'nuts' },

  // Spices & Flavorings
  { name: 'Cinnamon (Ground)', subcategory: 'spices' },
  { name: 'Nutmeg (Ground)', subcategory: 'spices' },
  { name: 'Ginger (Ground)', subcategory: 'spices' },
  { name: 'Allspice', subcategory: 'spices' },
  { name: 'Cloves (Ground)', subcategory: 'spices' },
  { name: 'Salt (Fine)', subcategory: 'spices' },
  { name: 'Sea Salt (Flaky)', subcategory: 'spices' },
  { name: 'Almond Extract', subcategory: 'spices' },
  { name: 'Lemon Extract', subcategory: 'spices' },
  { name: 'Peppermint Extract', subcategory: 'spices' },

  // Misc Baking Items
  { name: 'Rolled Oats', subcategory: 'misc' },
  { name: 'Peanut Butter', subcategory: 'misc' },
  { name: 'Sweetened Condensed Milk', subcategory: 'misc' },
  { name: 'Evaporated Milk', subcategory: 'misc' },
  { name: 'Pumpkin Puree', subcategory: 'misc' },
  { name: 'Molasses', subcategory: 'misc' },
  { name: 'Corn Syrup', subcategory: 'misc' },
  { name: 'Gelatin (Unflavored)', subcategory: 'misc' },
  { name: 'Food Coloring Set', subcategory: 'misc' },
  { name: 'Sprinkles', subcategory: 'misc' },
];

async function seedBakingSupplies() {
  console.log(`Adding ${bakingSupplies.length} baking supplies to household ${HOUSEHOLD_CODE}...`);
  console.log('Using collection: bakingEssentials\n');

  const essentialsRef = collection(db, 'bakingEssentials');
  let added = 0;

  for (const item of bakingSupplies) {
    try {
      await addDoc(essentialsRef, {
        name: item.name,
        subcategory: item.subcategory,
        store: DEFAULT_STORE,
        status: DEFAULT_STATUS,
        householdCode: HOUSEHOLD_CODE,
      });
      added++;
      console.log(`  + [${item.subcategory}] ${item.name}`);
    } catch (error) {
      console.error(`  x Failed to add ${item.name}:`, error.message);
    }
  }

  console.log(`\nDone! Added ${added}/${bakingSupplies.length} items.`);
  process.exit(0);
}

seedBakingSupplies();
