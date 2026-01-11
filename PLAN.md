# Our Kitchen - Meal Planning & Grocery App

## Overview
A PWA for Nick and Bella to manage weekly meals and grocery shopping. Solves the ADHD-friendly problem of "I can't think of what I need when asked" by letting you capture needs in the moment and auto-generating lists from saved meals.

---

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS (warm & cozy theme)
- **Backend:** Firebase Firestore (real-time sync)
- **Auth:** Simple 4-digit household code
- **Hosting:** Netlify
- **Voice:** Web Speech API (browser built-in)

---

## UI Theme (Warm & Cozy)

### Color Palette
- Background: Warm cream `#FDF8F3`
- Primary: Terracotta `#C4755B`
- Secondary: Sage green `#87A878`
- Accent: Golden honey `#E8B86D`
- Text: Warm charcoal `#3D3D3D`

### Design
- Rounded corners (12-16px)
- Soft shadows
- Large touch targets (44px min)
- Friendly font (Inter or Nunito)

---

## Navigation (Bottom Tabs)

1. **Home** - This week's meals + grocery status
2. **Meals** - Meal library
3. **Grocery** - Full list by store
4. **Baking** - Bella's corner

---

## Data Structure (Firestore)

```
households/{code}/
  members: ["Nick", "Bella"]

meals/{id}/
  name: string
  servings: number
  ingredients: [{ name, qty, unit, category, defaultStore }]
  isBaking: boolean

weeklyMeals/{weekId}/
  meals: [{ mealId, servings }]

groceryList/{id}/
  name, qty, unit, category, store
  status: "need" | "out" | "in-cart" | "bought"
  source: "meal" | "manual" | "quick-add" | "staple"

staples/{id}/
  name, store, category
  enabled: boolean

bakingEssentials/{id}/
  name, qty, unit
  status: "stocked" | "low" | "out"

boughtHistory/{id}/
  items: [...]
  date: timestamp
```

---

## Features

### Home Page
- This week's meals (simple list, no day assignments)
- Grocery list summary ("12 items across 3 stores")
- Floating "+" quick-add button
- Voice input button

### Meal Library
- All saved meals as cards
- Tap to view/edit ingredients
- Add new meal button
- Serving size stored per meal

### Grocery List
- **Organized by store first** (Costco, Trader Joe's, Safeway, Bel Air)
- **Then by category** (Produce, Meat, Dairy, Pantry, etc.)
- Combined quantities (eggs from 2 meals = single line with total)
- "Out" vs "Need" badges
- Staples section (always-grab items like rotisserie chicken)

### Quick Add
- Floating "+" button always visible
- Type or speak item name
- Select store (remembers last used)
- Select category
- Mark as "out" or "need"

### Voice Input
- Tap microphone
- Say "eggs Costco" or "out of milk"
- Parses: item, optional store, optional status
- Confirm or edit before saving

### Shopping Mode
- Select which store you're at
- Shows only that store's items
- Organized by category/aisle
- Tap to move items to "In Cart" section
- "Complete Trip" saves to bought history and clears list

### Staples
- Separate section for "always grab" items
- Example: Costco rotisserie chicken ($5)
- Toggle on/off per shopping trip

### Bella's Baking Corner
- Separate inventory for baking supplies
- Status: Stocked / Low / Out
- Quick restock button adds to grocery list
- Items: flour, brown sugar, eggs, butter, vanilla, yeast, etc.

### Household Sync
- Create household: generates 4-digit code
- Join household: enter 4-digit code
- Real-time sync via Firestore
- Code stored in localStorage

---

## Pre-loaded Data

### Stores
1. Costco
2. Trader Joe's
3. Safeway
4. Bel Air

### Categories
1. Produce
2. Meat
3. Dairy
4. Pantry
5. Frozen
6. Bakery
7. Snacks
8. Beverages
9. Baking

### Sample Meals

**Ground Meat Bowl** (serves 4)
- 1 lb ground beef (meat, Costco)
- 4 sweet potatoes (produce, Trader Joe's)
- 1.5 cups rice (pantry, Costco)
- 1 container cottage cheese (dairy, Costco)
- 2 avocados (produce, Trader Joe's)
- Seasonings (pantry)

**Chicken & Rice** (serves 4)
- 2 lbs chicken breast (meat, Costco)
- 2 cups rice (pantry, Costco)
- Seasonings (pantry)

### Default Staples
- Costco rotisserie chicken

### Quick-Add Suggestions
- Eggs, Milk, Bread, Butter, Cheese

---

## Key Flows

### Adding Meal to Week
1. Tap "Add Meal" on Home
2. Select from library (or create new)
3. Choose servings (3, 4, 6, 8, or custom)
4. Confirm → ingredients added to grocery list

### Quick Add Item
1. Tap floating "+"
2. Enter item name (type or voice)
3. Select store
4. Select category
5. Choose "out" or "need"
6. Save

### Shopping Trip
1. Tap "Shopping Mode"
2. Select store (e.g., Costco)
3. See only Costco items by category
4. Tap items → move to "In Cart"
5. "Complete Trip" → items saved to history, cleared from list

---

## Build Phases

### Phase 1: Project Setup
- Vite + React + TypeScript
- Tailwind with custom colors
- Firebase config
- Basic navigation shell

### Phase 2: Firebase & Auth
- Firestore security rules
- Household create/join (4-digit code)
- Real-time listeners

### Phase 3: Meal Library
- Meal CRUD
- Ingredient input with store/category
- Pre-load sample meals

### Phase 4: Weekly Planning
- Week view (simple list)
- Add meal with serving selection
- Auto-populate grocery list

### Phase 5: Grocery List
- Store → Category grouping
- Quantity combining
- Status toggles
- Staples section

### Phase 6: Quick Add & Voice
- Floating action button
- Quick add modal
- Web Speech API
- Voice parsing

### Phase 7: Shopping Mode
- Store selection
- Filtered view
- In-cart tracking
- Complete trip → history

### Phase 8: Baking Corner
- Bella's inventory
- Status tracking
- Restock to grocery

### Phase 9: PWA
- manifest.json (name: "Our Kitchen")
- Service worker
- Offline support
- iOS optimizations

### Phase 10: Deploy
- Netlify setup
- Environment variables
- Multi-device testing

---

## File Structure

```
src/
  main.tsx
  App.tsx
  index.css

  config/
    firebase.ts
    stores.ts
    categories.ts

  hooks/
    useHousehold.ts
    useMeals.ts
    useGroceryList.ts
    useWeeklyPlan.ts
    useVoiceInput.ts
    useStaples.ts
    useBaking.ts

  components/
    layout/
      Navigation.tsx
      FloatingAddButton.tsx
    meals/
      MealCard.tsx
      MealForm.tsx
      IngredientInput.tsx
    grocery/
      GroceryList.tsx
      GroceryItem.tsx
      StoreSection.tsx
      StaplesSection.tsx
    weekly/
      WeekView.tsx
      MealSelector.tsx
    shopping/
      ShoppingMode.tsx
      InCartSection.tsx
    baking/
      BakingCorner.tsx
      BakingItem.tsx
    common/
      Button.tsx
      Modal.tsx
      VoiceButton.tsx

  pages/
    Home.tsx
    MealLibrary.tsx
    GroceryListPage.tsx
    ShoppingModePage.tsx
    BakingPage.tsx
    Settings.tsx
    JoinHousehold.tsx

  utils/
    groceryHelpers.ts
    voiceParser.ts
    weekHelpers.ts

  types/
    index.ts

public/
  manifest.json
  icons/
  sw.js
```

---

## Testing Checklist

- [ ] Create household → get 4-digit code
- [ ] Join household on second device
- [ ] Add item on device 1 → appears on device 2
- [ ] Add meal to week → grocery list populates
- [ ] Add same ingredient from 2 meals → quantities combine
- [ ] Quick add item with voice
- [ ] Enter shopping mode → filter by store
- [ ] Check items → move to cart
- [ ] Complete trip → history saved, list cleared
- [ ] PWA: install on iPhone, works offline

---

## Decisions Made

| Topic | Decision |
|-------|----------|
| App name | Our Kitchen |
| Navigation | Bottom tabs |
| Week view | Simple list (no day assignments) |
| Baking section | Main nav tab |
| Store tags | Persist until manually changed |
| Quantities | Combine into single line |
| Scaling | Manual (not auto-multiply) |
| Servings | 3, 4, 6, 8, or custom |
| After shopping | Save to bought history |
| Staples | Separate "always grab" section |
| Voice | Web Speech API |

---

## Firebase Setup (COMPLETE)

- [x] Create Firestore database
- [x] Register web app
- [x] Get config and save to .env

**Project ID:** grocery-store-app-c3aa5

**Files Created:**
- `.env` - Contains actual Firebase credentials (DO NOT COMMIT)
- `.env.example` - Template for other developers
- `.gitignore` - Prevents .env from being committed

---

## GitHub Setup (COMPLETE)

- [x] Create GitHub repository
- [x] Push code to GitHub

**Repository:** https://github.com/TinyShaft22/our-kitchen

---

## Netlify Setup (TODO)

- [ ] Connect Netlify to GitHub repo (https://github.com/TinyShaft22/our-kitchen)
- [ ] Add environment variables in Netlify dashboard
- [ ] Deploy
