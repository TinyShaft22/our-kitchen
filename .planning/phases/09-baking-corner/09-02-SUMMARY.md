# Plan 09-02 Summary: CRUD Modals

## What Was Built

### AddBakingModal Component
**File:** `src/components/baking/AddBakingModal.tsx`

Bottom-sheet modal for adding new baking essentials:
- Name input (required)
- Quantity input (number, required)
- Unit select (cups, oz, lbs, tbsp, tsp, each, bags, boxes)
- Status select (stocked, low, out) - defaults to stocked
- Form validation with error display
- Loading state during save

### EditBakingModal Component
**File:** `src/components/baking/EditBakingModal.tsx`

Bottom-sheet modal for editing existing essentials:
- Pre-fills form with existing data
- Same fields as AddBakingModal
- Updates via `updateEssential` hook

### BakingPage Integration
**File:** `src/pages/BakingPage.tsx`

Full CRUD wiring:
- FAB (floating action button) to open AddBakingModal
- Edit button on cards opens EditBakingModal
- Delete button shows ConfirmDialog with danger styling
- All operations sync to Firestore in real-time

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Common BAKING_UNITS array | Baking-specific units (cups, tbsp, etc.) |
| Default status "stocked" for new items | Most common case when adding inventory |
| Danger variant for delete confirmation | Clear visual warning for destructive action |

## Files Changed

- `src/components/baking/AddBakingModal.tsx` (new)
- `src/components/baking/EditBakingModal.tsx` (new)
- `src/pages/BakingPage.tsx` (updated with modal/FAB integration)

## Verification

- [x] `npm run build` succeeds without errors
- [x] FAB appears on BakingPage
- [x] Tapping FAB opens AddBakingModal
- [x] AddBakingModal creates new essential
- [x] Tapping edit on card opens EditBakingModal with data
- [x] EditBakingModal updates essential
- [x] Tapping delete on card shows ConfirmDialog
- [x] Confirming delete removes essential
- [x] Form validation works (name/qty required)

## Next Step

Plan 09-03: Restock to grocery list integration
