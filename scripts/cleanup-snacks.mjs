// Cleanup script to delete baking supplies from snacks collection (added by mistake)
// Run with: node scripts/cleanup-snacks.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
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

// Names of baking items that were mistakenly added to snacks
const bakingItemNames = [
  'All-Purpose Flour', 'Bread Flour', 'Whole Wheat Flour', 'Almond Flour', 'Oat Flour', 'Cornstarch',
  'Granulated Sugar', 'Brown Sugar', 'Powdered Sugar', 'Pure Maple Syrup', 'Honey', 'Vanilla Extract',
  'Baking Soda', 'Baking Powder', 'Active Dry Yeast', 'Cream of Tartar',
  'Unsalted Butter', 'Salted Butter', 'Vegetable Oil', 'Canola Oil', 'Coconut Oil', 'Olive Oil', 'Vegetable Shortening',
  'Large Eggs', 'Heavy Whipping Cream', 'Whole Milk', 'Buttermilk', 'Cream Cheese', 'Sour Cream',
  'Semi-Sweet Chocolate Chips', 'Dark Chocolate Chips', 'White Chocolate Chips', 'Cocoa Powder', 'Baking Chocolate (Unsweetened)',
  'Walnuts', 'Pecans', 'Almonds (Sliced)', 'Raisins', 'Dried Cranberries', 'Shredded Coconut',
  'Cinnamon (Ground)', 'Nutmeg (Ground)', 'Ginger (Ground)', 'Allspice', 'Cloves (Ground)', 'Salt (Fine)', 'Sea Salt (Flaky)', 'Almond Extract', 'Lemon Extract', 'Peppermint Extract',
  'Rolled Oats', 'Peanut Butter', 'Sweetened Condensed Milk', 'Evaporated Milk', 'Pumpkin Puree', 'Molasses', 'Corn Syrup', 'Gelatin (Unflavored)', 'Food Coloring Set', 'Sprinkles',
];

async function cleanupSnacks() {
  console.log(`Cleaning up baking items from snacks collection for household ${HOUSEHOLD_CODE}...`);

  const snacksRef = collection(db, 'snacks');
  const q = query(snacksRef, where('householdCode', '==', HOUSEHOLD_CODE));

  const snapshot = await getDocs(q);
  let deleted = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (bakingItemNames.includes(data.name)) {
      await deleteDoc(doc(db, 'snacks', docSnap.id));
      deleted++;
      console.log(`  - Deleted: ${data.name}`);
    }
  }

  console.log(`\nDone! Deleted ${deleted} items from snacks collection.`);
  process.exit(0);
}

cleanupSnacks();
