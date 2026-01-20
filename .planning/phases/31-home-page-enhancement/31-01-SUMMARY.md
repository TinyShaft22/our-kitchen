---
phase: 31-home-page-enhancement
plan: 01
subsystem: planning
tags: [types, hooks, weekly-plan, day-assignment, week-view]

# Dependency graph
requires:
  - phase: 05-weekly-planning
    provides: WeeklyMealEntry and WeeklySnackEntry types, useWeeklyPlan hook
provides:
  - DayOfWeek type (1-7 for Mon-Sun, ISO 8601)
  - DAY_NAMES and DAY_ABBREVIATIONS constants
  - updateMealDay function in useWeeklyPlan hook
  - updateSnackDay function in useWeeklyPlan hook
affects: [31-02 (UI components), 31-03 (Week View), 31-04 (Drag-and-drop)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Optional day field for backward-compatible data model extension
    - ISO 8601 day numbering (1=Monday, 7=Sunday)

key-files:
  created: []
  modified:
    - src/types/index.ts
    - src/hooks/useWeeklyPlan.ts

key-decisions:
  - "DayOfWeek uses ISO 8601 numbering (1=Monday) for consistency with week IDs"
  - "Day field is optional to maintain backward compatibility with existing data"
  - "Both DAY_NAMES (full) and DAY_ABBREVIATIONS (short) exported for UI flexibility"

patterns-established:
  - "Optional fields for non-breaking schema evolution"
  - "Hook functions accept undefined to clear values (day=undefined removes assignment)"

issues-created: []

# Metrics
duration: 3min
completed: 2026-01-20
---

# Phase 31 Plan 01: Data Model for Day Assignment Summary

**DayOfWeek type with day constants and hook functions for assigning meals/snacks to specific days of the week**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-20
- **Completed:** 2026-01-20
- **Tasks:** 2
- **Files modified:** 2 (src/types/index.ts, src/hooks/useWeeklyPlan.ts)

## Accomplishments

- Added DayOfWeek type (1-7 for Monday-Sunday following ISO 8601)
- Added DAY_NAMES constant for full day names
- Added DAY_ABBREVIATIONS constant for short day names (Mon, Tue, etc.)
- Added optional `day` field to WeeklyMealEntry interface
- Added optional `day` field to WeeklySnackEntry interface
- Added updateMealDay function to useWeeklyPlan hook
- Added updateSnackDay function to useWeeklyPlan hook

## Task Commits

Each task was committed atomically:

1. **Task 1: Add DayOfWeek type and update entry interfaces** - `30448cc` (feat)
2. **Task 2: Add updateMealDay and updateSnackDay functions to hook** - `08c4504` (feat)

## Files Created/Modified

- `src/types/index.ts` - Added DayOfWeek type, constants, optional day fields
- `src/hooks/useWeeklyPlan.ts` - Added updateMealDay and updateSnackDay functions

## Decisions Made

- **ISO 8601 day numbering:** Using 1=Monday through 7=Sunday to align with the existing ISO week ID format (YYYY-WNN).
- **Optional day field:** The day field is optional (`day?: DayOfWeek`) so existing weekly plan data without day assignments continues to work without migration.
- **Both full and abbreviated names:** Exported both DAY_NAMES and DAY_ABBREVIATIONS to support different UI contexts (full names for headers, abbreviations for compact views).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks executed as planned.

## Next Phase Readiness

- Data model ready for Week View components
- Hook functions ready for drag-and-drop day assignment
- Backward compatible with existing weekly plan data
- Ready for Plan 31-02 (UI components: quick-add buttons, LoadMealsModal)

---
*Phase: 31-home-page-enhancement*
*Completed: 2026-01-20*
