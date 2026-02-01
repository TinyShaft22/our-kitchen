---
phase: 41-global-product-database
plan: 02
subsystem: data
tags: [open-food-facts, firestore, bulk-load, admin-script]
dependency-graph:
  requires: [41-01]
  provides: [bulk-load-script]
  affects: [41-03]
tech-stack:
  added: []
  patterns: [firebase-admin-adc, off-search-api, batch-writes]
key-files:
  created: [scripts/bulk-load-products.ts]
  modified: [package.json]
decisions:
  - id: bulk-source
    choice: "OFF search API v2 sorted by unique_scans_n"
    why: "Most scanned products = most likely to be scanned by users"
  - id: write-strategy
    choice: "batch.set with merge:true"
    why: "Avoids overwriting manual edits while bulk populating"
metrics:
  duration: ~3min
  completed: 2026-01-31
---

# Phase 41 Plan 02: Bulk Load Products Summary

One-liner: Node.js admin script fetching ~5K popular US products from Open Food Facts into globalProducts Firestore collection via batch writes

## What Was Done

### Task 1: Create bulk load script
- Created `scripts/bulk-load-products.ts` using Firebase Admin SDK with Application Default Credentials
- Fetches from OFF Search API v2 with US country filter, sorted by unique_scans_n (most popular first)
- Paginates through 50 pages of 100 products each (5K max)
- Validates: skips products without barcode, name, or barcodes < 8 chars
- Maps OFF fields to GlobalProduct shape with source: 'bulk'
- Writes via Firestore batch commits (max 500 per batch) with merge:true
- 1-second delay between API page fetches
- Added `npm run bulk-load-products` script entry point
- **Commit:** 0d31870

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **OFF search API v2 sorted by unique_scans_n** - Most scanned products are most likely to match user barcode scans
2. **batch.set with merge:true** - Safe for re-runs; won't overwrite manual product edits

## Verification

- [x] scripts/bulk-load-products.ts exists and compiles (TypeScript transpilation verified)
- [x] package.json has "bulk-load-products" script
- [x] Script uses Firebase Admin SDK (firebase-admin/app, firebase-admin/firestore)
- [x] Script fetches from OFF search API with US filter
- [x] Script uses batch writes with barcode as document ID
- [x] Script has progress logging

## Next Phase Readiness

Script is ready to run. User needs to:
1. `gcloud auth application-default login`
2. `npm run bulk-load-products`

Phase 41-03 (OFF contribute-back) can proceed independently.
