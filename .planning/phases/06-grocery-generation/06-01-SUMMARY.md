---
phase: 06-grocery-generation
plan: 01
subsystem: api
tags: [firebase, firestore, typescript, batch-operations]

# Dependency graph
requires:
  - phase: 03-data-layer
    provides: Types (Meal, Ingredient, WeeklyMealEntry, GroceryItem), Firestore hooks
  - phase: 05-weekly-planning
    provides: Weekly plan structure with meal entries
provides:
  - generateGroceryItems utility for ingredient scaling and combining
  - generateFromWeeklyPlan batch method for atomic grocery list updates
affects: [06-02-generate-button, 07-shopping-mode]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scaling utility separate from hook (pure function)"
    - "Batch delete + add in single commit for atomicity"
    - "Case-insensitive duplicate detection with original casing preserved"

key-files:
  created:
    - src/utils/generateGroceryItems.ts
  modified:
    - src/hooks/useGroceryList.ts

key-decisions:
  - "GroceryItemInput intermediate type excludes id/householdCode/status/source"
  - "Duplicates matched by lowercase name + unit, first occurrence casing kept"

patterns-established:
  - "Utility functions in src/utils/ for pure transformations"
  - "writeBatch for atomic multi-document operations"

issues-created: []

# Metrics
duration: 2 min
completed: 2026-01-12
---

# Phase 6 Plan 1: Grocery Generation Summary

**Core grocery generation logic with ingredient scaling, duplicate combining, and atomic batch operations**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-12T04:51:04Z
- **Completed:** 2026-01-12T04:53:02Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created generateGroceryItems utility that scales ingredients by planned vs recipe servings
- Implemented duplicate detection (case-insensitive name + unit matching)
- Added generateFromWeeklyPlan method with atomic batch operations (delete old meal items + add new)
- Edge case handling: skips deleted meals, zero/negative servings, prevents division by zero

## Task Commits

Each task was committed atomically:

1. **Task 1: Create generateGroceryItems utility** - `80b8a24` (feat)
2. **Task 2: Add generateFromWeeklyPlan to useGroceryList** - `b719140` (feat)

**Plan metadata:** (this commit) (docs: complete plan)

## Files Created/Modified

- `src/utils/generateGroceryItems.ts` - Pure function for scaling & combining ingredients
- `src/hooks/useGroceryList.ts` - Added generateFromWeeklyPlan method + GroceryItemInput export

## Decisions Made

- GroceryItemInput intermediate type excludes id, householdCode, status, source (added by hook)
- Duplicates matched by lowercase name + unit, preserving first occurrence casing
- Single atomic batch for delete + add to prevent inconsistent state

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Generation logic complete, ready for UI integration
- Next: 06-02 will add "Generate List" button to connect UI to this logic

---
*Phase: 06-grocery-generation*
*Completed: 2026-01-12*
