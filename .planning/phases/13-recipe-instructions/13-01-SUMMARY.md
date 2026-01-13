---
phase: 13-recipe-instructions
plan: 01
subsystem: ui
tags: [react, typescript, meals, instructions, expandable]

# Dependency graph
requires:
  - phase: 04-meal-library
    provides: MealCard component, Add/Edit modals
provides:
  - Optional instructions field on Meal type
  - Instructions textarea in meal modals
  - Expandable instructions section on MealCard
affects: [14-meal-images]

# Tech tracking
tech-stack:
  added: []
  patterns: [expandable-section-pattern]

key-files:
  created: []
  modified: [src/types/index.ts, src/components/meals/MealCard.tsx, src/components/meals/AddMealModal.tsx, src/components/meals/EditMealModal.tsx]

key-decisions:
  - "Optional field to support existing meals without migration"
  - "whitespace-pre-wrap for simple text formatting (no markdown library)"
  - "Expandable section only renders when instructions exist"

patterns-established:
  - "Expandable content section pattern with chevron indicator"

issues-created: []

# Metrics
duration: 4min
completed: 2026-01-13
---

# Phase 13 Plan 01: Recipe Instructions Summary

**Added optional instructions field to meals with expandable display section on MealCard**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-13T23:53:57Z
- **Completed:** 2026-01-13T23:58:02Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Meal type extended with optional `instructions?: string` field
- Both AddMealModal and EditMealModal have instructions textarea
- MealCard shows expandable instructions section when instructions exist
- Line breaks preserved with whitespace-pre-wrap styling

## Task Commits

Each task was committed atomically:

1. **Task 1: Add instructions field to Meal type and modals** - `b919343` (feat)
2. **Task 2: Add expandable instructions section to MealCard** - `52fcded` (feat)

**Plan metadata:** `e686664` (docs: complete plan)

## Files Created/Modified
- `src/types/index.ts` - Added `instructions?: string` to Meal interface
- `src/components/meals/AddMealModal.tsx` - Added instructions state and textarea
- `src/components/meals/EditMealModal.tsx` - Added instructions state and textarea
- `src/components/meals/MealCard.tsx` - Added isExpanded state and expandable section

## Decisions Made
- Optional field approach to avoid migration for existing meals
- Simple whitespace-pre-wrap for text formatting (no external markdown library)
- Expandable section only renders when instructions exist (cards without instructions unchanged)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Recipe instructions feature complete
- Ready for Phase 14: Meal Images

---
*Phase: 13-recipe-instructions*
*Completed: 2026-01-13*
