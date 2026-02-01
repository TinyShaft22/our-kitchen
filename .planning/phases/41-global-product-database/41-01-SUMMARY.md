---
phase: 41-global-product-database
plan: 01
subsystem: barcode-scanning
tags: [firestore, barcode, caching, open-food-facts]
dependency-graph:
  requires: []
  provides: [GlobalProduct-type, useGlobalProducts-hook, global-lookup-chain]
  affects: [41-02, 41-03]
tech-stack:
  added: []
  patterns: [write-through-cache, cross-household-shared-collection]
key-files:
  created:
    - src/hooks/useGlobalProducts.ts
  modified:
    - src/types/index.ts
    - src/hooks/useOpenFoodFacts.ts
    - src/components/scanner/ProductLookupResult.tsx
decisions:
  - id: global-product-doc-id
    decision: "Barcode as document ID for O(1) Firestore lookups"
  - id: lookup-chain-order
    decision: "globalProducts -> scannedProducts -> OFF API -> write-through to globalProducts"
  - id: no-realtime-listener
    decision: "On-demand getDoc for globalProducts (no onSnapshot) since shared data rarely changes"
metrics:
  duration: 2m 37s
  completed: 2026-01-31
---

# Phase 41 Plan 01: Global Product Lookup Foundation Summary

**Cross-household barcode cache with globalProducts collection and refactored lookup chain: globalProducts -> scannedProducts -> OFF API with write-through**

## What Was Done

### Task 1: GlobalProduct type and useGlobalProducts hook
- Added `GlobalProduct` interface to `src/types/index.ts` with barcode, name, brand, imageUrl, categories, source, timestamps
- Created `src/hooks/useGlobalProducts.ts` with `getGlobalProduct` (single doc lookup) and `setGlobalProduct` (upsert with merge)
- Top-level `globalProducts` Firestore collection (not nested under households)
- Barcode serves as document ID for O(1) lookups

### Task 2: Refactored useOpenFoodFacts lookup chain
- New lookup order: globalProducts (shared) -> scannedProducts (household) -> OFF API
- OFF API hits now write to globalProducts via `setGlobalProduct` for cross-household caching
- Still writes to scannedProducts for household-level cache (existing behavior preserved)
- Added `'global'` to source union type in `LookupResultWithSource`
- Updated `ProductLookupResult` component props to accept `'global'` source (Rule 3 - blocking build error)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated ProductLookupResult source type**
- **Found during:** Task 2 verification (npm run build)
- **Issue:** ProductLookupResult component had hardcoded `source: 'cache' | 'off' | 'none'` that didn't include `'global'`
- **Fix:** Added `'global'` to the source union type in ProductLookupResult.tsx
- **Files modified:** src/components/scanner/ProductLookupResult.tsx
- **Commit:** 55885c3

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Barcode as document ID | O(1) Firestore lookups without queries |
| No real-time listener for globalProducts | Shared data rarely changes; on-demand getDoc is sufficient |
| Write-through after OFF API hit | Eliminates redundant OFF API calls across households |

## Verification

- TypeScript compilation: PASS
- Production build: PASS (28 precache entries)
- Lookup chain order verified: globalProducts -> scannedProducts -> OFF API
- Write-through to globalProducts confirmed in code
- No breaking changes to consumers

## Next Phase Readiness

Ready for 41-02 (bulk pre-load of US products into globalProducts collection).
