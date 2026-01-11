# Our Kitchen

## What This Is

A PWA for Nick and Bella to manage weekly meals and grocery shopping. Solves the ADHD problem of "I can't think of what I need when asked" by letting you capture meal ideas in the moment and auto-generating grocery lists from a saved meal rotation. Bella shops weekends with an organized list, Nick cooks during the week.

## Core Value

Quick capture → meal library → auto-populated grocery list → store-organized shopping. The complete cycle from "oh that TikTok recipe looks good" to "Bella's Costco list is ready."

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Household sync with 4-digit code (Firestore real-time)
- [ ] Meal library with ingredients (name, qty, unit, category, store)
- [ ] Weekly meal planning (simple list, no day assignments)
- [ ] Grocery list organized by store first, then category
- [ ] Quantity combining (eggs from 2 meals = single line with total)
- [ ] Quick add with floating "+" button
- [ ] Voice input (Web Speech API)
- [ ] Shopping mode (filter by store, in-cart tracking, complete trip)
- [ ] Staples section (always-grab items like Costco rotisserie chicken)
- [ ] Baking corner for Bella (inventory tracking, restock to grocery)
- [ ] PWA (installable, offline-capable)
- [ ] Warm & cozy UI theme (cream background, terracotta primary)

### Out of Scope

- Recipe instructions — just ingredients, no cooking steps
- Nutrition/calorie tracking — not a diet app
- Price tracking/budgeting — not a finance app
- Day-specific meal assignments — simple weekly list is enough
- Multiple households — just Nick & Bella
- User accounts — 4-digit code is sufficient

## Context

**Workflow:**
- Bella does weekend shopping across multiple stores (Costco, Trader Joe's, Safeway, Bel Air)
- Nick does most of the cooking during the week
- They have rotating go-to meals but want to expand variety
- Current system: verbal/text → forget → never make new meals

**The problem this solves:**
Every weekend Bella asks "what do we need?" and neither can think of anything in the moment. Meal ideas get mentioned (from TikTok, conversations) but forgotten because getting ingredients is friction. This app breaks that cycle by making capture instant and shopping list generation automatic.

**Existing setup:**
- Firebase project configured (grocery-store-app-c3aa5)
- GitHub repo exists (https://github.com/TinyShaft22/our-kitchen)
- Netlify deployment pending
- Detailed implementation spec: `.planning/SPEC.md` (data structures, file structure, sample data)

**Stores:**
1. Costco (bulk, primary)
2. Trader Joe's
3. Safeway
4. Bel Air

**Categories:**
Produce, Meat, Dairy, Pantry, Frozen, Bakery, Snacks, Beverages, Baking

## Constraints

- **Mobile-first**: iPhone is the primary device, 44px minimum touch targets
- **Tech stack**: React + TypeScript + Vite + Tailwind CSS + Firebase Firestore + Netlify
- **Auth**: Simple 4-digit household code (no passwords, no OAuth)
- **Offline**: Must work offline (PWA with service worker)
- **Real-time**: Changes sync immediately between devices

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 4-digit code auth | No passwords to remember, low friction for household | — Pending |
| Store-first grouping | Matches how they shop (one store at a time) | — Pending |
| No day assignments | Flexibility > rigid planning, reduces friction | — Pending |
| Web Speech API | Browser built-in, no external service needed | — Pending |
| Separate baking tab | Bella's domain, keeps it visible and accessible | — Pending |
| PWA over native | One codebase, instant updates, no app store friction | — Pending |

---
*Last updated: 2026-01-11 after initialization*
