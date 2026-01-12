---
phase: 03-data-layer
plan: 02
subsystem: database
tags: [firestore, hooks, real-time, crud, react]

# Dependency graph
requires:
  - phase: 03-01
    provides: TypeScript types, Firebase persistence setup
  - phase: 02-02
    provides: useHousehold hook pattern, householdCode
provides:
  - useMeals hook for meal CRUD with real-time sync
  - useGroceryList hook for grocery items with status management
  - useWeeklyPlan hook for weekly meal planning
affects: [04-meal-library, 05-weekly-planning, 06-grocery-generation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Firestore onSnapshot for real-time listeners
    - Compound document IDs for week-scoped data
    - Read-modify-write pattern for array updates

key-files:
  created:
    - src/hooks/useMeals.ts
    - src/hooks/useGroceryList.ts
    - src/hooks/useWeeklyPlan.ts
  modified: []

key-decisions:
  - "Compound doc ID {householdCode}_{weekId} for weekly plans"
  - "Read-modify-write for weekly meals array (not arrayUnion) for complex updates"
  - "ISO week number for weekId format YYYY-WNN"

patterns-established:
  - "Firestore hooks with onSnapshot cleanup on unmount"
  - "Auto-inject householdCode on all create operations"
  - "Batch operations for bulk deletes (clearBoughtItems)"

issues-created: []

# Metrics
duration: 5min
completed: 2026-01-11
---

# Phase 3 Plan 2: Firestore Hooks Summary

**Three Firestore hooks with real-time sync: useMeals (CRUD), useGroceryList (CRUD + status + clear), useWeeklyPlan (week-scoped planning)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-11T23:58:43Z
- **Completed:** 2026-01-12T00:04:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- useMeals hook with real-time listener and CRUD operations
- useGroceryList hook with status updates and batch clear bought items
- useWeeklyPlan hook with ISO week-based document structure and meal array management

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useMeals hook** - `6a6941e` (feat)
2. **Task 2: Create useGroceryList hook** - `794ab16` (feat)
3. **Task 3: Create useWeeklyPlan hook** - `e3c6751` (feat)

**Plan metadata:** (pending)

## Files Created/Modified

- `src/hooks/useMeals.ts` - CRUD for meals with real-time onSnapshot listener
- `src/hooks/useGroceryList.ts` - CRUD + updateStatus + clearBoughtItems with batch operations
- `src/hooks/useWeeklyPlan.ts` - Week-scoped planning with ISO week ID helper

## Decisions Made

- Used compound document ID `{householdCode}_{weekId}` for weekly plans to ensure uniqueness per household per week
- Implemented read-modify-write pattern for weekly meals array instead of arrayUnion/arrayRemove because updates need to handle existing meal servings
- Used ISO 8601 week number calculation for consistent weekId format across years

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- All three hooks ready for use in UI components
- Real-time sync working with automatic cleanup on unmount
- householdCode auto-injected on all create operations
- Ready for 03-03-PLAN.md (Sample Data)

---
*Phase: 03-data-layer*
*Completed: 2026-01-11*
