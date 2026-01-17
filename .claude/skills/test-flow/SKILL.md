---
name: test-flow
description: Guide manual testing of Our Kitchen app user flows. Use when testing household, meal, grocery, shopping, baking, or PWA flows. Triggers on requests to test specific features, validate functionality, or run through user scenarios.
---

# Test Flow

Guide manual testing of specific user flows.

## Available Flows

- **household** - Create/join household, code persistence, sync
- **meal** - Add/edit/delete meals, ingredients
- **grocery** - List generation, store grouping, quantity combining
- **shopping** - Store filter, in-cart tracking, complete trip
- **baking** - Inventory tracking, restock to grocery
- **pwa** - Install, offline mode, sync on reconnect

## Test Checklists

### Household Flow
1. Clear localStorage, refresh - should see JoinHousehold
2. Create new household - 4-digit code displayed
3. Join from another device with same code
4. Add item on device 1 - appears on device 2 within 2 seconds
5. Close/reopen browser - still logged in

### Meal Flow
1. Add meal with 3+ ingredients
2. Verify meal appears in library
3. Edit meal name and ingredients
4. Delete meal - removed from library

### Grocery Flow
1. Add meal to weekly plan
2. Check Grocery tab - ingredients appear grouped by store/category
3. Add two meals sharing an ingredient - quantities combined
4. Toggle item status (need/out/in-cart)

### Shopping Flow
1. Enter Shopping Mode, select store
2. Only that store's items visible
3. Tap item to mark in-cart
4. Complete trip - in-cart items cleared

### Baking Flow
1. View baking inventory with status
2. Change item status (stocked/low/out)
3. Restock "out" item - appears in grocery list

### PWA Flow
1. Add to home screen (iOS Safari or Android Chrome)
2. Open from icon - standalone mode
3. Enable Airplane Mode - app still loads
4. Make changes offline, reconnect - changes sync
