/**
 * Bulk Load Products from Open Food Facts
 *
 * One-time admin script to pre-populate the globalProducts Firestore collection
 * with ~5K popular US products sorted by scan popularity.
 *
 * Prerequisites:
 *   gcloud auth application-default login
 *
 * Usage:
 *   npm run bulk-load-products
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin with Application Default Credentials
initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const OFF_BASE_URL = 'https://world.openfoodfacts.org/api/v2/search';
const PAGE_SIZE = 100;
const TOTAL_PAGES = 50;
const BATCH_LIMIT = 500;
const DELAY_MS = 1000;

interface OFFProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  image_front_small_url?: string;
  categories_tags?: string[];
}

interface OFFSearchResponse {
  count: number;
  page: number;
  page_size: number;
  products: OFFProduct[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(page: number): Promise<OFFProduct[]> {
  const params = new URLSearchParams({
    countries_tags_en: 'united-states',
    fields: 'code,product_name,brands,image_front_small_url,categories_tags',
    page_size: String(PAGE_SIZE),
    page: String(page),
    sort_by: 'unique_scans_n',
  });

  const url = `${OFF_BASE_URL}?${params}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'OurKitchen-BulkLoad/1.0' },
  });

  if (!response.ok) {
    console.error(`Page ${page}: HTTP ${response.status} - skipping`);
    return [];
  }

  const data = (await response.json()) as OFFSearchResponse;
  return data.products || [];
}

async function main() {
  let totalLoaded = 0;
  let totalSkipped = 0;
  const allProducts: Array<{ barcode: string; data: Record<string, unknown> }> = [];

  console.log(`Fetching up to ${TOTAL_PAGES * PAGE_SIZE} products from Open Food Facts...`);

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const products = await fetchPage(page);

    if (products.length === 0 && page > 1) {
      console.log(`Page ${page}/${TOTAL_PAGES} - No more products, stopping`);
      break;
    }

    let pageLoaded = 0;
    for (const p of products) {
      if (!p.code || !p.product_name || p.code.length < 8) {
        totalSkipped++;
        continue;
      }

      allProducts.push({
        barcode: p.code,
        data: {
          barcode: p.code,
          name: p.product_name,
          brand: p.brands || null,
          imageUrl: p.image_front_small_url || null,
          categories: p.categories_tags || [],
          source: 'bulk',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
      });
      pageLoaded++;
    }

    totalLoaded += pageLoaded;
    totalSkipped += products.length - pageLoaded - (products.length - pageLoaded); // already counted
    console.log(`Page ${page}/${TOTAL_PAGES} - ${pageLoaded} products loaded (${totalLoaded} total)`);

    if (page < TOTAL_PAGES) {
      await sleep(DELAY_MS);
    }
  }

  // Write to Firestore in batches of 500
  console.log(`\nWriting ${allProducts.length} products to Firestore...`);
  let batchCount = 0;

  for (let i = 0; i < allProducts.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    const chunk = allProducts.slice(i, i + BATCH_LIMIT);

    for (const { barcode, data } of chunk) {
      const ref = db.collection('globalProducts').doc(barcode);
      batch.set(ref, data, { merge: true });
    }

    await batch.commit();
    batchCount++;
    console.log(`Batch ${batchCount} committed (${Math.min(i + BATCH_LIMIT, allProducts.length)}/${allProducts.length})`);
  }

  console.log(`\nBulk load complete: ${allProducts.length} products loaded, ${totalSkipped} skipped`);
}

main().catch((err) => {
  console.error('Bulk load failed:', err);
  process.exit(1);
});
