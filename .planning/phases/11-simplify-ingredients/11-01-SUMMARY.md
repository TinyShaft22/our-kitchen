---
phase: 11-simplify-ingredients
plan: 01
subsystem: meals
tags: [ingredient, types, refactor, ux]

# Dependency graph
requires:
  - phase: 10-pwa-polish
    provides: PWA foundation
provides:
  - Simplified Ingredient interface (name/category/store only)
  - 2-row IngredientInput component
  - Simplified grocery generation (no scaling)
affects: [12-auto-populate-grocery]

# Tech tracking
tech-stack:
  added: []
  patterns: [simplified-data-model]

key-files:
  created: []
  modified:
    - src/types/index.ts
    - src/components/meals/IngredientInput.tsx
    - src/components/meals/AddMealModal.tsx
    - src/components/meals/EditMealModal.tsx
    - src/utils/generateGroceryItems.ts

key-decisions:
  - "Remove qty/unit from Ingredient - users just need 'what' not 'how much'"
  - "All meal-sourced grocery items default to qty=1, unit='item'"
  - "Deduplicate ingredients by name only (case-insensitive)"

patterns-established:
  - "Simplified ingredient model: name + category + store"

issues-created: []

# Metrics
duration: 4min
completed: 2026-01-13
---

# Phase 11-01 Summary: Simplify Ingredients

**Removed qty/unit from Ingredient interface, streamlined IngredientInput to 2-row component, simplified grocery generation to name-based deduplication**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-13T23:20:00Z
- **Completed:** 2026-01-13T23:24:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Ingredient interface now only has name, category, defaultStore (no qty/unit)
- IngredientInput component simplified from 3 rows to 2 rows (removed qty/unit row)
- Grocery generation simplified: no scaling, deduplication by name only, all items qty=1

## Task Commits

Each task was committed atomically:

1. **Task 1: Simplify Ingredient type and IngredientInput** - `ee90d65` (feat)
2. **Task 2: Update modal default ingredients** - `d0dcef8` (feat)
3. **Task 3: Simplify grocery generation** - `6a54cf8` (feat)

## Files Created/Modified

- `src/types/index.ts` - Removed qty/unit from Ingredient interface
- `src/components/meals/IngredientInput.tsx` - Removed qty/unit row (now 2-row component)
- `src/components/meals/AddMealModal.tsx` - Updated createDefaultIngredient
- `src/components/meals/EditMealModal.tsx` - Updated createDefaultIngredient
- `src/utils/generateGroceryItems.ts` - Simplified to name-based deduplication

## Decisions Made

- **Qty/Unit removal:** Users don't need to specify quantities when adding meals. The app focuses on "what do I need" not "how much."
- **Default qty=1:** All meal-sourced grocery items get qty=1, unit='item' for display consistency
- **Name-only deduplication:** Same ingredient name from different meals = same grocery item (first occurrence wins for category/store)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Step

Ready for Phase 11 plan 02 or Phase 12 (Auto-Populate Grocery) if no additional plans in Phase 11.

---
*Phase: 11-simplify-ingredients*
*Completed: 2026-01-13*
