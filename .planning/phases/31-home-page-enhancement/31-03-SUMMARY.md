---
phase: 31-home-page-enhancement
plan: 03
subsystem: planning-ui
tags: [week-view, day-columns, responsive-grid]

dependency-graph:
  requires: ["31-01", "31-02"]
  provides: ["week-view-static", "day-column-rendering", "unassigned-section"]
  affects: ["31-04"]

tech-stack:
  added: []
  patterns: ["day-grouping", "responsive-grid-layout", "conditional-view-rendering"]

key-files:
  created:
    - src/components/planning/DayColumn.tsx
    - src/components/planning/UnassignedSection.tsx
    - src/components/planning/WeekView.tsx
  modified:
    - src/pages/Home.tsx

decisions:
  - id: "31-03-a"
    choice: "Use ternary conditional for view mode switching"
    rationale: "Simple pattern that keeps list and week views cleanly separated"

metrics:
  duration: "~2 min"
  completed: "2026-01-20"
---

# Phase 31 Plan 03: Week View Summary

Static 7-day week view with day columns, responsive grid layout, and unassigned section for meals/snacks without day assignment.

## What Was Built

### DayColumn Component (src/components/planning/DayColumn.tsx)
- Shows day header with full name (desktop) or abbreviation (mobile)
- Renders meals with image/placeholder, name, and servings count
- Renders snacks with image/placeholder, name, and quantity
- Displays item count in header
- Highlights today's column with terracotta border/background
- Empty state when no items assigned
- Min-height for consistent layout

### UnassignedSection Component (src/components/planning/UnassignedSection.tsx)
- Horizontal wrap layout for items without day assignment
- Meal cards with image/placeholder and servings
- Snack cards with image/placeholder and quantity
- Help text: "Drag items to a day to schedule them"
- Hides automatically when no unassigned items

### WeekView Component (src/components/planning/WeekView.tsx)
- Groups meals and snacks by day using useMemo
- Separates unassigned items (day === undefined)
- Renders 7 DayColumns in responsive grid (2 cols mobile, 4 tablet, 7 desktop)
- Calculates current day for highlighting (ISO week: 1=Monday, 7=Sunday)
- Renders UnassignedSection at top

### Home.tsx Updates
- Added WeekView import
- Conditional rendering: list view when viewMode='list', week view when viewMode='week'
- Updated EmptyWeeklyPlan to open LoadMealsModal instead of AddToWeekModal
- Simplified quick add buttons visibility logic

## Technical Details

**Responsive Grid:**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
```

**Day of Week Calculation:**
```tsx
function getCurrentDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0=Sunday, 6=Saturday
  return (jsDay === 0 ? 7 : jsDay) as DayOfWeek; // ISO: 1=Mon, 7=Sun
}
```

**Grouping Pattern:**
```tsx
const mealsByDay = useMemo(() => {
  const grouped: Record<DayOfWeek | 'unassigned', WeeklyMealEntry[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
    unassigned: [],
  };
  for (const entry of meals) {
    entry.day ? grouped[entry.day].push(entry) : grouped.unassigned.push(entry);
  }
  return grouped;
}, [meals]);
```

## Commits

| Hash | Message |
|------|---------|
| 50ba81f | feat(31-03): create DayColumn component for week view |
| fa70c97 | feat(31-03): create WeekView and UnassignedSection components |
| 44986d7 | feat(31-03): add conditional view rendering to Home.tsx |

## Verification

- [x] TypeScript compilation passes
- [x] DayColumn shows day name, meals, snacks, empty state (129 lines)
- [x] UnassignedSection shows items without day assignment (92 lines)
- [x] WeekView renders responsive 7-day grid (87 lines)
- [x] Toggle in header switches between views
- [x] Today's column visually distinct (terracotta highlight)
- [x] Responsive: 2 cols mobile, 4 tablet, 7 desktop

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Phase 31-04 (Drag-and-Drop)** can proceed:
- WeekView provides the 7-day grid structure
- DayColumn ready to receive useDroppable hook
- UnassignedSection can serve as draggable source area
- Need to install @dnd-kit and create DraggableMealCard/DraggableSnackCard
