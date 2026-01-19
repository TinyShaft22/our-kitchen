---
phase: 22-recipe-image-upload
plan: 01
subsystem: baking-recipes
tags: [firestore, images, broma-bakery, recipes]

dependency-graph:
  requires: [19-muffins-batch, 20-brownies-batch]
  provides: [recipe-images-populated]
  affects: []

tech-stack:
  added: []
  patterns:
    - external-image-urls
    - firestore-batch-update

files:
  created:
    - scripts/update-recipe-images.ts
  modified: []

decisions:
  - id: external-urls-over-upload
    choice: "Use external Broma Bakery URLs directly instead of uploading images"
    rationale: "Simpler implementation, no storage costs, images already hosted"

metrics:
  duration: "15 min"
  completed: "2026-01-19"
---

# Phase 22 Plan 01: Recipe Image Upload Summary

**Broma Bakery image URLs added to 42 muffin and brownie recipes via Firestore script update**

## What Was Done

### Task 1: Create Firestore Update Script
- Created `scripts/update-recipe-images.ts` to update recipe imageUrl fields
- Script reads image mappings from JSON files in phases 19 and 20
- Queries Firestore by recipe name and subcategory
- Updates imageUrl field with Broma Bakery external URL
- Handles case-insensitive matching and logs results
- **Commit:** 06257ba, 417395b

### Task 2: Run Update Script
- Executed script: `npx tsx scripts/update-recipe-images.ts`
- Successfully updated 21/21 muffin recipes
- Successfully updated 21/21 brownie recipes
- **Total: 42 recipes now have imageUrl fields**

### Task 3: Verify Images Display
- User verified in browser at localhost:5173
- Muffin recipes display thumbnail images in Baking > Broma > Muffins
- Brownie recipes display thumbnail images in Baking > Broma > Brownies
- Images load correctly from Broma Bakery URLs
- **User confirmed: "all muffins and brownies have images"**

## Verification Results

- [x] Update script created and compiles
- [x] Script executed successfully
- [x] All 21 muffin recipes have imageUrl set
- [x] All 21 brownie recipes have imageUrl set
- [x] Images display correctly in recipe cards

## Success Criteria Met

- [x] 42 recipes (21 muffins + 21 brownies) have imageUrl fields populated
- [x] Images load from Broma Bakery URLs
- [x] Recipe cards show thumbnails in collapsed view
- [x] Full images visible in expanded view
- [x] v1.3 Broma Bakery Import milestone complete

## Deviations from Plan

None - plan executed exactly as written.

## Key Files

| File | Purpose |
|------|---------|
| `scripts/update-recipe-images.ts` | Firestore batch update script for recipe images |
| `.planning/phases/19-muffins-batch/muffins-images.json` | Image URL mappings for 21 muffins |
| `.planning/phases/20-brownies-batch/brownies-images.json` | Image URL mappings for 21 brownies |

## Commits

| Hash | Message |
|------|---------|
| 06257ba | feat(22-01): create Firestore update script for recipe images |
| 417395b | fix(22-01): improve auth error message in update script |

## v1.3 Broma Bakery Import - COMPLETE

With this plan, the v1.3 milestone is fully complete:

| Category | Recipes | Images |
|----------|---------|--------|
| Cookies | 27 | 27 |
| Bars | 36 | 36 |
| Muffins | 21 | 21 |
| Brownies | 21 | 21 |
| **Total** | **105** | **105** |

All 105 Broma Bakery recipes are imported with images displaying correctly.
