---
phase: 41-global-product-database
plan: 03
subsystem: scanner
tags: [open-food-facts, contribution, barcode, community]
dependency-graph:
  requires: ["41-01"]
  provides: ["OFF contribution API", "share toggle UI"]
  affects: []
tech-stack:
  added: []
  patterns: ["fire-and-forget async", "opt-out toggle"]
key-files:
  created: []
  modified:
    - src/services/openFoodFacts.ts
    - src/components/scanner/ManualProductEntry.tsx
    - src/components/scanner/BarcodeScannerModal.tsx
decisions:
  - id: "41-03-01"
    decision: "Anonymous OFF contributions with matching user_id/password pair"
    reason: "OFF write API allows anonymous contributions without OAuth for basic product data"
  - id: "41-03-02"
    decision: "Share toggle defaults to ON (opt-out)"
    reason: "Maximize community contributions while giving users control"
metrics:
  duration: "~5 min"
  completed: "2026-01-31"
---

# Phase 41 Plan 03: OFF Contribute-Back Summary

**One-liner:** Real Open Food Facts contribution via POST API with opt-out share toggle in manual product entry.

## What Was Done

### Task 1: Implement real contributeProduct
- Replaced placeholder with real POST to `https://world.openfoodfacts.org/cgi/product_jqm2.pl`
- Uses URLSearchParams for form-encoded body with barcode, product_name, brands
- Anonymous contribution via user_id/password "our-kitchen-app" pair
- Returns true on success (status=1), false on failure, wrapped in try/catch

### Task 2: Add share toggle and wire contribution
- Added `shareWithOFF` boolean state (default true) to ManualProductEntry
- Replaced placeholder info box with functional checkbox toggle
- Extended onSubmit interface to include `shareWithOFF: boolean`
- BarcodeScannerModal calls `contributeProduct()` fire-and-forget when share enabled

## Decisions Made

| ID | Decision | Reason |
|----|----------|--------|
| 41-03-01 | Anonymous OFF contributions | OFF allows basic product data without OAuth |
| 41-03-02 | Share defaults to ON | Maximize community contributions |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npx tsc --noEmit` passes
- `npm run build` succeeds
- contributeProduct makes real POST to OFF API
- ManualProductEntry has share checkbox defaulting to on
- BarcodeScannerModal calls contributeProduct fire-and-forget when enabled
