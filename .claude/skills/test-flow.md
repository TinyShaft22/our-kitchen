---
name: test-flow
description: Guide manual testing of specific Our Kitchen app flows
argument-hint: "[flow-name: household, meal, grocery, shopping, baking, pwa]"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
---

<objective>
Guide manual testing of a specific user flow in the Our Kitchen app.

Purpose: Validate end-to-end functionality from the user's perspective.
Output: Test results with any issues documented.
</objective>

<context>
Flow to test: $ARGUMENTS

Available flows:
- **household** - Create/join household, code persistence, sync between devices
- **meal** - Add meal, edit ingredients, delete meal, meal library browsing
- **grocery** - List generation, store grouping, quantity combining, item status
- **shopping** - Store filter, in-cart tracking, complete trip
- **baking** - Inventory tracking, restock to grocery
- **pwa** - Install prompt, offline mode, sync on reconnect

@.planning/PROJECT.md
@.planning/SPEC.md
</context>

<flows>

<flow name="household">
## Household Flow Tests

### Create Household
1. Clear localStorage: `localStorage.removeItem('householdCode')`
2. Refresh app - should see JoinHousehold page
3. Tap "Create New" tab
4. Tap "Create Household" button
5. Verify: 4-digit code displayed
6. Verify: Code saved to localStorage
7. Verify: App navigates to Home

### Join Household
1. Note the code from device 1
2. On device 2, clear localStorage
3. Enter the 4-digit code
4. Tap "Join" button
5. Verify: App navigates to Home
6. Verify: Same householdCode in localStorage

### Sync Test
1. Add item on device 1
2. Verify: Item appears on device 2 within 2 seconds
3. Edit item on device 2
4. Verify: Change reflects on device 1

### Persistence Test
1. Close browser completely
2. Reopen app
3. Verify: Still logged into household (no JoinHousehold page)
</flow>

<flow name="meal">
## Meal Library Flow Tests

### Add Meal
1. Navigate to Meals tab
2. Tap "+" or "Add Meal" button
3. Enter meal name (e.g., "Tacos")
4. Add 3+ ingredients with qty, unit, category, store
5. Save meal
6. Verify: Meal appears in library
7. Verify: Tap meal shows ingredients

### Edit Meal
1. Tap existing meal
2. Tap edit/pencil icon
3. Change meal name
4. Add/remove ingredient
5. Save
6. Verify: Changes persisted

### Delete Meal
1. Long press or tap delete on meal
2. Confirm deletion
3. Verify: Meal removed from library
4. Verify: No orphan data in Firestore
</flow>

<flow name="grocery">
## Grocery List Flow Tests

### Auto-Generation
1. Add meal to weekly plan
2. Navigate to Grocery tab
3. Verify: Meal ingredients appear in list
4. Verify: Items grouped by store first, then category

### Quantity Combining
1. Add two meals that share an ingredient (e.g., eggs)
2. Check Grocery list
3. Verify: Single line with combined quantity

### Quick Add
1. Tap floating "+" button
2. Enter item name
3. Select store and category
4. Save
5. Verify: Item appears in correct store/category section

### Status Toggle
1. Tap item to cycle status (need → out → in-cart)
2. Verify: Visual indicator changes
3. Verify: Status persists on refresh
</flow>

<flow name="shopping">
## Shopping Mode Flow Tests

### Store Filter
1. Enter Shopping Mode
2. Select "Costco"
3. Verify: Only Costco items visible
4. Verify: Items organized by category

### In-Cart Tracking
1. Tap item to mark "in cart"
2. Verify: Item moves to In Cart section
3. Verify: Item visually distinguished

### Complete Trip
1. Mark several items in cart
2. Tap "Complete Trip"
3. Verify: In-cart items cleared from list
4. Verify: Items saved to bought history
5. Verify: "Need" items remain in list
</flow>

<flow name="baking">
## Baking Corner Flow Tests

### Inventory View
1. Navigate to Baking tab
2. Verify: Baking supplies listed with status

### Update Status
1. Tap item to change status (stocked → low → out)
2. Verify: Visual indicator updates
3. Verify: Status persists

### Restock to Grocery
1. Tap "Restock" on an "out" item
2. Navigate to Grocery tab
3. Verify: Item appears in grocery list
4. Verify: Marked as source "baking"
</flow>

<flow name="pwa">
## PWA Flow Tests

### Install Prompt
1. Open app in mobile Safari/Chrome
2. Verify: "Add to Home Screen" banner or prompt appears
3. Add to home screen
4. Verify: App icon appears on device
5. Open from icon
6. Verify: Opens in standalone mode (no browser chrome)

### Offline Mode
1. Open app normally
2. Add a few items
3. Turn on Airplane Mode
4. Verify: App still loads
5. Verify: Can view existing data
6. Try to add item
7. Verify: Queued or appropriate offline message

### Sync on Reconnect
1. While offline, make changes (if supported)
2. Turn off Airplane Mode
3. Verify: Changes sync to Firestore
4. Check device 2 for changes
</flow>

</flows>

<process>
1. Parse $ARGUMENTS to determine which flow to test
2. If no argument, ask user which flow to test
3. Present the test checklist for that flow
4. For each test step, use AskUserQuestion to get result
5. Collect pass/fail for each test
6. If any failures, document the issue details
7. Present summary with recommendations
</process>

<success_criteria>
- [ ] Flow identified from argument or user selection
- [ ] Test checklist presented step by step
- [ ] User guided through each test
- [ ] Results captured (pass/fail)
- [ ] Issues documented with specifics
- [ ] Summary presented with next steps
</success_criteria>
