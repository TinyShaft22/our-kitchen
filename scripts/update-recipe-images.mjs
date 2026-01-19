#!/usr/bin/env node
/**
 * Update Recipe Images Script
 *
 * Sets Broma Bakery image URLs on muffin and brownie recipes in Firestore.
 * Run with: node scripts/update-recipe-images.mjs
 *
 * Prerequisites:
 * - Firebase CLI installed and logged in (firebase login)
 * - firebase-admin package installed
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const PROJECT_ID = 'grocery-store-app-c3aa5';
const HOUSEHOLD_CODE = '0428';

// Initialize Firebase Admin with ADC
initializeApp({
  credential: applicationDefault(),
  projectId: PROJECT_ID,
});

const db = getFirestore();

/**
 * Load image mappings from JSON file
 */
function loadImageMappings(jsonPath) {
  const fullPath = join(projectRoot, jsonPath);
  const content = readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Find a meal by name (case-insensitive) and subcategory containing the given type
 */
async function findMeal(name, subcategoryType) {
  // Query for meals with matching household code
  const mealsRef = db.collection('meals');
  const snapshot = await mealsRef
    .where('householdCode', '==', HOUSEHOLD_CODE)
    .where('isBaking', '==', true)
    .get();

  // Find meal with matching name (case-insensitive) and subcategory
  const normalizedName = name.toLowerCase().trim();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const mealName = (data.name || '').toLowerCase().trim();
    const subcategory = data.subcategory || '';

    if (mealName === normalizedName && subcategory.includes(subcategoryType)) {
      return { id: doc.id, data };
    }
  }

  return null;
}

/**
 * Update a meal's imageUrl
 */
async function updateMealImage(mealId, imageUrl) {
  const mealRef = db.collection('meals').doc(mealId);
  await mealRef.update({ imageUrl });
}

/**
 * Process a batch of recipes
 */
async function processBatch(recipes, subcategoryType, batchName) {
  console.log(`\n--- Processing ${batchName} ---\n`);

  let updated = 0;
  let notFound = 0;
  const notFoundList = [];

  for (const recipe of recipes) {
    const meal = await findMeal(recipe.name, subcategoryType);

    if (meal) {
      await updateMealImage(meal.id, recipe.imageUrl);
      console.log(`  [OK] ${recipe.name}`);
      updated++;
    } else {
      console.log(`  [NOT FOUND] ${recipe.name}`);
      notFoundList.push(recipe.name);
      notFound++;
    }
  }

  console.log(`\n${batchName} Summary: ${updated} updated, ${notFound} not found`);
  if (notFoundList.length > 0) {
    console.log(`  Not found: ${notFoundList.join(', ')}`);
  }

  return { updated, notFound, notFoundList };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Update Recipe Images Script');
  console.log('='.repeat(60));
  console.log(`\nProject: ${PROJECT_ID}`);
  console.log(`Household: ${HOUSEHOLD_CODE}`);

  try {
    // Load image mappings
    const muffinsImages = loadImageMappings('.planning/phases/19-muffins-batch/muffins-images.json');
    const browniesImages = loadImageMappings('.planning/phases/20-brownies-batch/brownies-images.json');

    console.log(`\nLoaded ${muffinsImages.length} muffin image mappings`);
    console.log(`Loaded ${browniesImages.length} brownie image mappings`);

    // Process muffins
    const muffinsResult = await processBatch(muffinsImages, 'Muffins', 'Muffins');

    // Process brownies
    const browniesResult = await processBatch(browniesImages, 'Brownies', 'Brownies');

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('FINAL SUMMARY');
    console.log('='.repeat(60));
    console.log(`Muffins: ${muffinsResult.updated}/${muffinsImages.length} updated`);
    console.log(`Brownies: ${browniesResult.updated}/${browniesImages.length} updated`);
    console.log(`Total: ${muffinsResult.updated + browniesResult.updated}/${muffinsImages.length + browniesImages.length} recipes updated`);

    if (muffinsResult.notFound + browniesResult.notFound > 0) {
      console.log(`\n[WARNING] ${muffinsResult.notFound + browniesResult.notFound} recipes not found in Firestore`);
    }

    console.log('\nDone!');
    process.exit(0);

  } catch (error) {
    console.error('\nError:', error.message);
    if (error.code === 'app/invalid-credential') {
      console.error('\nAuthentication failed. Please run: firebase login');
    }
    process.exit(1);
  }
}

main();
