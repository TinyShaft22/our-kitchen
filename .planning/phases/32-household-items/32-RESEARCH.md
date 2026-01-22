# Phase 32: Household Items - Research

**Researched:** 2026-01-21
**Domain:** Firebase CRUD + Alexa Voice Integration
**Confidence:** HIGH

## Summary

Phase 32 adds a "Household Items" library - recurring non-food products (paper towels, toothpaste, etc.) that can be quickly added to the grocery list via voice or UI. This is distinct from Staples (which auto-add every time) - household items are on-demand additions.

The implementation follows well-established patterns already in the codebase:
- **Data model**: Mirrors the existing `Staple` interface with minor adjustments
- **Hook pattern**: Follows `useStaples.ts` / `useSnacks.ts` CRUD pattern exactly
- **UI pattern**: Reuses collapsible section pattern from GroceryListPage + Add/Edit modal pattern
- **Alexa integration**: Extends `addGroceryItem` Cloud Function to lookup saved items, enhances `AddGroceryIntentHandler` to use item defaults

**Primary recommendation:** Clone the Staples pattern entirely (hook, modals, card component), add a new `householdItems` Firestore collection, and enhance the Alexa add flow to lookup saved items before creating generic grocery entries.

## Standard Stack

No new libraries required. This phase extends existing patterns.

### Core (Already Installed)
| Library | Purpose | Usage in Phase |
|---------|---------|----------------|
| Firebase/Firestore | Database | `householdItems` collection |
| React hooks pattern | State management | `useHouseholdItems.ts` hook |
| shadcn/ui components | UI components | Dialog, Select, Input, Button |

### Supporting (Already Installed)
| Library | Purpose | Usage |
|---------|---------|-------|
| axios | HTTP client | Lambda -> Cloud Functions calls |
| firebase-functions | Cloud Functions | New lookup endpoint |

**No installation required** - all dependencies are already in the project.

## Architecture Patterns

### Recommended Project Structure

**PWA Files:**
```
src/
├── hooks/
│   └── useHouseholdItems.ts          # NEW - CRUD hook (clone useStaples.ts)
├── types/
│   └── index.ts                       # MODIFY - add HouseholdItem interface
├── components/
│   └── household/                     # NEW folder
│       ├── HouseholdItemCard.tsx      # NEW - display card (clone StapleCard)
│       ├── AddHouseholdItemModal.tsx  # NEW - add modal (clone AddStapleModal)
│       └── EditHouseholdItemModal.tsx # NEW - edit modal (clone EditStapleModal)
├── pages/
│   └── GroceryListPage.tsx            # MODIFY - add collapsible section
```

**Cloud Functions Files:**
```
functions/src/
├── alexa/
│   ├── lookupHouseholdItem.ts         # NEW - lookup by name
│   ├── addGroceryItem.ts              # MODIFY - use saved item defaults
│   └── index.ts                       # MODIFY - export new function
└── index.ts                           # MODIFY - export new function
```

**Lambda Files:**
```
our-kitchen-alexa/lambda/
├── api/
│   └── firebaseClient.js              # MODIFY - add lookupHouseholdItem
├── handlers/
│   └── GroceryHandlers.js             # MODIFY - enhance AddGroceryIntentHandler
```

### Pattern 1: HouseholdItem Data Model

**What:** TypeScript interface for household items
**When to use:** Always for type safety
**Source:** Based on existing `Staple` interface (src/types/index.ts)

```typescript
// src/types/index.ts - ADD this interface
export interface HouseholdItem {
  id: string;
  name: string;                    // "Paper Towels"
  store: Store;                    // Where to buy
  category: Category;              // Grocery category
  brand?: string;                  // Optional: "Bounty"
  notes?: string;                  // Optional: "Get the big rolls"
  householdCode: string;
}
```

**Key differences from Staple:**
- NO `enabled` field (these are on-demand, not auto-add)
- ADDS `brand` and `notes` fields for product specifics

### Pattern 2: CRUD Hook Pattern

**What:** React hook with real-time Firestore subscription
**When to use:** All collection CRUD operations
**Source:** Existing `useStaples.ts` pattern

```typescript
// src/hooks/useHouseholdItems.ts
interface UseHouseholdItemsReturn {
  items: HouseholdItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<HouseholdItem, 'id' | 'householdCode'>) => Promise<string>;
  updateItem: (id: string, updates: Partial<Omit<HouseholdItem, 'id' | 'householdCode'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

// Implementation: Clone useStaples.ts, change collection name to 'householdItems'
```

### Pattern 3: Collapsible Section UI

**What:** Expandable section with item count badge
**When to use:** Grouping related items in a list view
**Source:** GroceryListPage.tsx Staples section (lines 251-309)

```tsx
// GroceryListPage.tsx - Add after Staples section
<div className="mt-4">
  <button
    onClick={() => setHouseholdExpanded(!householdExpanded)}
    className="w-full flex items-center justify-between py-2"
  >
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-display font-semibold text-charcoal">Household Items</h2>
      <span className="text-xs px-2 py-0.5 rounded-full bg-charcoal/10 text-charcoal/70">
        {householdItems.length}
      </span>
    </div>
    {/* Add button + expand arrow */}
  </button>
  {householdExpanded && (
    <div className="space-y-2 mt-2">
      {householdItems.map((item) => (
        <HouseholdItemCard
          key={item.id}
          item={item}
          onEdit={() => setEditingItem(item)}
          onDelete={() => setDeleteConfirmItem(item)}
          onAddToList={() => addToGroceryList(item)}
        />
      ))}
    </div>
  )}
</div>
```

### Pattern 4: Add to Grocery Flow (UI)

**What:** One-tap add household item to grocery list
**When to use:** User wants to add saved item without opening modal
**Source:** Extends existing `useGroceryList.addItem` pattern

```typescript
// In GroceryListPage.tsx
const addToGroceryList = async (item: HouseholdItem) => {
  await addItem({
    name: item.name,
    qty: 1,
    unit: 'each',
    category: item.category,
    store: item.store,
    status: 'need',
    source: 'quick-add',  // New source type or reuse 'manual'
  });
};
```

### Pattern 5: Alexa Lookup-First Flow

**What:** When user says "add paper towels", lookup saved item first
**When to use:** All AddGroceryIntent requests
**Source:** Extends existing addGroceryItem flow

```
User: "Add paper towels"
           |
           v
    AddGroceryIntentHandler
           |
           v
    lookupHouseholdItem(householdCode, "paper towels")
           |
    +------+------+
    |             |
  Found        Not Found
    |             |
    v             v
Use saved    Use defaults
defaults     (pantry/safeway)
    |             |
    +------+------+
           |
           v
    addGroceryItem(householdCode, item, ...)
```

### Anti-Patterns to Avoid

- **Creating a separate page for household items:** They belong in the Grocery page context, not a new nav item
- **Making household items auto-add like staples:** The key distinction is on-demand vs automatic
- **Voice-only addition:** Must have UI for managing the library, not just voice add

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CRUD hook | Custom state management | Clone `useStaples.ts` | Pattern is battle-tested |
| Modal components | Custom dialog | shadcn Dialog | Already used everywhere |
| Form validation | Custom validation | Inline checks + error state | Simple validation needs only |
| Real-time sync | Polling | Firestore `onSnapshot` | Already works in all hooks |
| Fuzzy name matching | Complex algorithm | Case-insensitive `.toLowerCase()` contains | Sufficient for household item names |

## Common Pitfalls

### Pitfall 1: Confusing with Staples
**What goes wrong:** User/developer conflates household items with staples
**Why it happens:** Similar data structure, both are "saved items"
**How to avoid:** Clear naming and UI separation
- Staples: "Items that auto-add to every grocery list" (with toggle)
- Household Items: "Saved items you can quickly add" (with "Add to List" button)
**Warning signs:** UI lacks clear call-to-action difference

### Pitfall 2: Alexa Lookup Performance
**What goes wrong:** Slow response when looking up item
**Why it happens:** Extra network hop adds latency
**How to avoid:**
- Make lookup endpoint fast (single Firestore query)
- Use `where('householdCode', '==', code).where('nameLower', '==', name.toLowerCase())`
- Store `nameLower` field for case-insensitive matching
**Warning signs:** > 1s added to voice response time

### Pitfall 3: Missing Firestore Index
**What goes wrong:** Query fails or is slow
**Why it happens:** Composite queries need indexes
**How to avoid:** Pre-create index for `householdItems` collection
```
Collection: householdItems
Index: householdCode (ASC), nameLower (ASC)
```
**Warning signs:** Console errors about missing index

### Pitfall 4: No Clear Add-to-List CTA
**What goes wrong:** Users don't know how to use household items
**Why it happens:** Card just shows item info without action
**How to avoid:** Prominent "+ Add" button on each card, distinct from edit/delete
**Warning signs:** Users creating duplicate items instead of adding to list

## Code Examples

### Cloud Function: lookupHouseholdItem

```typescript
// functions/src/alexa/lookupHouseholdItem.ts
import { onRequest } from "firebase-functions/v2/https";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function ensureInitialized() {
  if (getApps().length === 0) {
    initializeApp();
  }
}

const API_KEY = "ourkitchen2024";

export const lookupHouseholdItem = onRequest({ cors: true, invoker: "public" }, async (req, res) => {
  ensureInitialized();

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ found: false, error: "Method not allowed" });
    return;
  }

  const apiKey = req.headers["x-api-key"] || req.query.apiKey;
  if (apiKey !== API_KEY) {
    res.status(401).json({ found: false, error: "Invalid API key" });
    return;
  }

  try {
    const householdCode = req.query.householdCode as string;
    const itemName = req.query.item as string;

    if (!householdCode || !itemName) {
      res.status(400).json({ found: false, error: "Missing parameters" });
      return;
    }

    const db = getFirestore();
    const normalizedName = itemName.trim().toLowerCase();

    // Query by nameLower for case-insensitive match
    const snapshot = await db.collection("householdItems")
      .where("householdCode", "==", householdCode)
      .where("nameLower", "==", normalizedName)
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(200).json({ found: false });
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    res.status(200).json({
      found: true,
      item: {
        id: doc.id,
        name: data.name,
        store: data.store,
        category: data.category,
        brand: data.brand || null,
        notes: data.notes || null
      }
    });
  } catch (error) {
    console.error("lookupHouseholdItem error:", error);
    res.status(500).json({ found: false, error: "Internal server error" });
  }
});
```

### Lambda: Enhanced AddGroceryIntentHandler

```javascript
// In GroceryHandlers.js - modify AddGroceryIntentHandler.handle()
async handle(handlerInput) {
  // ... existing linked check ...

  const householdCode = getHouseholdCode(handlerInput);
  const slots = handlerInput.requestEnvelope.request.intent.slots;
  const item = slots.GroceryItem?.value;
  const quantity = slots.Quantity?.value ? parseInt(slots.Quantity.value) : null;

  if (!item) {
    return handlerInput.responseBuilder
      .speak("What would you like to add to the list?")
      .reprompt("Say the name of the item to add.")
      .getResponse();
  }

  try {
    // NEW: Lookup saved household item first
    const lookup = await lookupHouseholdItem(householdCode, item);

    // Check for duplicate (using saved name if found)
    const itemName = lookup.found ? lookup.item.name : item;
    const dupCheck = await checkDuplicateGrocery(householdCode, itemName);

    if (dupCheck.exists) {
      // ... existing duplicate handling ...
    }

    // Add item - use saved defaults if found
    let result;
    if (lookup.found) {
      result = await addGroceryItemWithDefaults(
        householdCode,
        lookup.item.name,
        quantity,
        lookup.item.store,
        lookup.item.category
      );
    } else {
      result = await addGroceryItem(householdCode, item, quantity);
    }

    // ... rest of existing handler ...
  }
}
```

### Hook: useHouseholdItems (skeleton)

```typescript
// src/hooks/useHouseholdItems.ts
import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { HouseholdItem } from '../types';

interface UseHouseholdItemsReturn {
  items: HouseholdItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<HouseholdItem, 'id' | 'householdCode'>) => Promise<string>;
  updateItem: (id: string, updates: Partial<Omit<HouseholdItem, 'id' | 'householdCode'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export function useHouseholdItems(householdCode: string | null): UseHouseholdItemsReturn {
  // Clone useStaples.ts implementation
  // Change collection name from 'staples' to 'householdItems'
  // Remove 'enabled' field handling
  // Add 'nameLower' field on write for case-insensitive lookup
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Generic pantry items | Saved item library | Phase 32 | Smarter voice adds |
| Manual entry every time | One-tap quick-add | Phase 32 | Faster UI workflow |

**Note:** This phase introduces the household items concept. No deprecated approaches exist.

## Open Questions

None. The implementation path is clear based on existing patterns.

All questions were answerable through codebase analysis:
1. **Data model**: Mirrors Staple with brand/notes instead of enabled
2. **Firestore patterns**: Same as existing hooks
3. **Alexa flow**: Extends AddGroceryIntent with lookup step
4. **UI placement**: GroceryListPage collapsible section

## Sources

### Primary (HIGH confidence)
- `/mnt/c/Users/Nick M/Desktop/Food App Idea/src/types/index.ts` - Existing type definitions
- `/mnt/c/Users/Nick M/Desktop/Food App Idea/src/hooks/useStaples.ts` - CRUD hook pattern
- `/mnt/c/Users/Nick M/Desktop/Food App Idea/src/hooks/useSnacks.ts` - CRUD hook pattern
- `/mnt/c/Users/Nick M/Desktop/Food App Idea/functions/src/alexa/addGroceryItem.ts` - Cloud Function pattern
- `/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/lambda/handlers/GroceryHandlers.js` - Lambda handler pattern
- `/mnt/c/Users/Nick M/Desktop/Food App Idea/our-kitchen-alexa/lambda/api/firebaseClient.js` - HTTP client pattern
- `/mnt/c/Users/Nick M/Desktop/Food App Idea/src/pages/GroceryListPage.tsx` - UI pattern
- `/mnt/c/Users/Nick M/Desktop/Food App Idea/src/components/grocery/AddStapleModal.tsx` - Modal pattern

### Secondary (MEDIUM confidence)
- `.planning/ROADMAP.md` - Phase 32 requirements and context
- `.planning/phases/25-lambda-backend/25-CONTEXT.md` - REST API decisions
- `.planning/phases/29-grocery-integration/29-CONTEXT.md` - Grocery voice decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All patterns exist in codebase
- Architecture: HIGH - Direct clones of existing code
- Pitfalls: HIGH - Based on real code review

**Research date:** 2026-01-21
**Valid until:** Indefinite - patterns are internal and stable
