---
phase: 12-auto-populate-grocery
plan: 01
subsystem: data
tags: [firestore, hooks, grocery, ingredients]

# Dependency graph
requires:
  - phase: 11-simplify-ingredients
    provides: Simplified Ingredient type (name/category/store only)
  - phase: 06-grocery-generation
    provides: generateGroceryItems utility function
provides:
  - alreadyHave field on WeeklyMeal type
  - toggleAlreadyHave hook method for atomic toggle
  - generateGroceryItems excludes alreadyHave ingredients
affects: [12-02-auto-sync-ui, grocery-generation, weekly-planning]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Firestore arrayUnion/arrayRemove for atomic array operations
    - Optional parameter with default for backward compatibility

key-files:
  created: []
  modified:
    - src/types/index.ts
    - src/hooks/useWeeklyPlan.ts
    - src/utils/generateGroceryItems.ts

key-decisions:
  - "Store alreadyHave as lowercase strings for case-insensitive matching"
  - "Use Firestore arrayUnion/arrayRemove for atomic toggle (no race conditions)"
  - "Default alreadyHave to empty array for backward compatibility"

patterns-established:
  - "Atomic array toggle pattern using Firestore array operators"

issues-created: []

# Metrics
duration: 2min
completed: 2026-01-13
---

# Phase 12 Plan 01: Already Have Data Model Summary

**Added alreadyHave field to WeeklyMeal type with hook toggle method and exclusion logic in grocery generation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-13T23:36:06Z
- **Completed:** 2026-01-13T23:38:27Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Added `alreadyHave?: string[]` optional field to WeeklyMeal interface
- Implemented `toggleAlreadyHave(ingredientName)` method in useWeeklyPlan hook with atomic Firestore operations
- Updated generateGroceryItems to exclude ingredients in alreadyHave list using O(1) Set lookup

## Task Commits

Each task was committed atomically:

1. **Task 1: Add alreadyHave field to WeeklyMeal type** - `f786cd2` (feat)
2. **Task 2: Add toggleAlreadyHave method to useWeeklyPlan hook** - `3ce6310` (feat)
3. **Task 3: Update generateGroceryItems to exclude alreadyHave items** - `b8a6310` (feat)

## Files Created/Modified

- `src/types/index.ts` - Added alreadyHave optional string array to WeeklyMeal interface
- `src/hooks/useWeeklyPlan.ts` - Added toggleAlreadyHave method with Firestore arrayUnion/arrayRemove
- `src/utils/generateGroceryItems.ts` - Added alreadyHave parameter, excludes matching ingredients

## Decisions Made

- Store alreadyHave names as lowercase for consistent case-insensitive matching
- Use Firestore arrayUnion/arrayRemove instead of reading/modifying/writing to prevent race conditions
- Make alreadyHave parameter optional with empty array default for backward compatibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Data model ready for UI integration
- toggleAlreadyHave method ready to wire to checkboxes
- generateGroceryItems ready to receive alreadyHave from WeeklyMeal document
- Ready for 12-02-PLAN.md (Auto-Sync & UI)

---
*Phase: 12-auto-populate-grocery*
*Completed: 2026-01-13*
