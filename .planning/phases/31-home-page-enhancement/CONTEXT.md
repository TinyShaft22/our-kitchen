# Phase 31: Home Page Enhancement

## Overview
Enhance the Home page with better meal/snack quick-add buttons, a folder-organized meal picker, and a week view with drag-and-drop meal planning.

## Changes Summary

### 1. UI Button Changes
- **Rename** "Add Snack to Week" → "Snacks"
- **Add** matching "Meals" button with dashed border style (same as snacks)
- **Remove** FloatingActionButton (FAB)
- **Add** "Load Meals" button in header top-right

### 2. New LoadMealsModal
- Opens from header button or "Meals" quick-add button
- Shows meals organized by folder structure (reuses `buildFolderTree()`)
- Search bar to filter meals by name
- Two-step flow: select meal → set servings → confirm

### 3. Week View Toggle
- Toggle in header to switch between list view and week view
- List view = current layout
- Week view = 7-day grid with drag-and-drop

### 4. Week View with Drag-and-Drop
- 7-day columns (desktop) or stacked cards (mobile)
- Drag meals/snacks between days
- "Unassigned" section for items without a day
- Uses @dnd-kit library for drag-and-drop

---

## Data Model Changes

**File:** `src/types/index.ts`

Add optional `day` field to entry types (backward compatible):

```typescript
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const DAY_NAMES: Record<DayOfWeek, string> = {
  1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday',
  5: 'Friday', 6: 'Saturday', 7: 'Sunday',
};

export interface WeeklyMealEntry {
  mealId: string;
  servings: number;
  day?: DayOfWeek;  // NEW - optional day assignment
}

export interface WeeklySnackEntry {
  snackId: string;
  qty: number;
  day?: DayOfWeek;  // NEW - optional day assignment
}
```

---

## New Components

| Component | Path | Purpose |
|-----------|------|---------|
| `WeekViewToggle` | `src/components/ui/WeekViewToggle.tsx` | List/week toggle button |
| `LoadMealsModal` | `src/components/planning/LoadMealsModal.tsx` | Folder-organized meal picker with search |
| `WeekView` | `src/components/planning/WeekView.tsx` | 7-day grid container |
| `DayColumn` | `src/components/planning/DayColumn.tsx` | Single day drop zone |
| `DraggableMealCard` | `src/components/planning/DraggableMealCard.tsx` | Compact draggable meal card |
| `DraggableSnackCard` | `src/components/planning/DraggableSnackCard.tsx` | Compact draggable snack card |

---

## Home.tsx Modifications

### Header Changes (replace current hero section)
```tsx
<div className="hero-gradient px-4 pt-6 pb-4 mb-4">
  <div className="flex items-start justify-between">
    <div>
      <h1>Week 02, 2026</h1>
      <p>3 meals • 2 snacks</p>
    </div>
    <div className="flex items-center gap-2">
      <WeekViewToggle viewMode={viewMode} onToggle={setViewMode} />
      <button onClick={() => setIsLoadMealsModalOpen(true)}>
        + Load Meals
      </button>
    </div>
  </div>
</div>
```

### Quick-Add Buttons (side by side)
```tsx
<div className="flex gap-3">
  <button className="flex-1 border-dashed border-terracotta/40">
    🍽️ Meals
  </button>
  <button className="flex-1 border-dashed border-sage/40">
    🍿 Snacks
  </button>
</div>
```

### Remove FAB
Delete `<FloatingActionButton>` component (lines 316-319)

### Conditional View Rendering
```tsx
{viewMode === 'list' ? (
  // Current list view
) : (
  <DndContext onDragEnd={handleDragEnd}>
    <WeekView meals={weeklyMeals} snacks={weeklySnacks} ... />
  </DndContext>
)}
```

---

## Hook Updates

**File:** `src/hooks/useWeeklyPlan.ts`

Add new functions:
- `updateMealDay(mealId: string, day: DayOfWeek | undefined)` - assign meal to day
- `updateSnackDay(snackId: string, day: DayOfWeek | undefined)` - assign snack to day

---

## Implementation Phases

### Phase 1: Data Model & Types
1. `src/types/index.ts` - Add DayOfWeek type and update entry interfaces
2. `src/hooks/useWeeklyPlan.ts` - Add updateMealDay/updateSnackDay functions

### Phase 2: UI Components (No Drag-Drop)
1. `src/components/ui/WeekViewToggle.tsx` - NEW toggle component
2. `src/components/planning/LoadMealsModal.tsx` - NEW folder-organized modal
3. `src/pages/Home.tsx` - Update header, rename buttons, remove FAB

### Phase 3: Week View (Static)
1. `src/components/planning/WeekView.tsx` - NEW 7-day grid
2. `src/components/planning/DayColumn.tsx` - NEW day column
3. `src/pages/Home.tsx` - Add conditional view rendering

### Phase 4: Drag-and-Drop
1. Install `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
2. `src/components/planning/DraggableMealCard.tsx` - NEW
3. `src/components/planning/DraggableSnackCard.tsx` - NEW
4. Update DayColumn with useDroppable
5. Update Home.tsx with DndContext and handlers

### Phase 5: Polish
1. Loading states and error handling
2. Empty states for week view
3. Mobile responsiveness testing

---

## Key Files to Modify

- `src/pages/Home.tsx` - Main changes
- `src/types/index.ts` - Type definitions
- `src/hooks/useWeeklyPlan.ts` - Hook updates
- `package.json` - Add @dnd-kit dependencies

## Pattern References

- `src/utils/subcategoryUtils.ts` - buildFolderTree() for folder organization
- `src/pages/MealLibrary.tsx` - NestedFolderSection pattern, view toggle
- `src/components/planning/AddSnackToWeekModal.tsx` - Modal pattern

---

## Verification

1. **Visual Check**:
   - Header shows "Load Meals" button and week toggle
   - "Meals" and "Snacks" buttons appear side-by-side
   - FAB is removed

2. **LoadMealsModal**:
   - Opens from header button
   - Shows folder structure with expandable sections
   - Search filters meals by name
   - Can select meal and set servings

3. **Week View**:
   - Toggle switches between list and week view
   - 7 columns on desktop, stacked on mobile
   - Unassigned section shows items without day

4. **Drag-and-Drop**:
   - Can drag meals between days
   - Can drag snacks between days
   - Visual feedback during drag
   - Firebase updates correctly on drop
