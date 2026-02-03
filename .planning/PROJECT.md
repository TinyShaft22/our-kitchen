# Our Kitchen

## What This Is

A PWA for Nick and Bella to manage weekly meals and grocery shopping. Solves the ADHD problem of "I can't think of what I need when asked" by letting you capture meal ideas in the moment and auto-generating grocery lists from a saved meal rotation. Bella shops weekends with an organized list, Nick cooks during the week.

## Core Value

Quick capture → meal library → auto-populated grocery list → store-organized shopping. The complete cycle from "oh that TikTok recipe looks good" to "Bella's Costco list is ready."

## Requirements

### Validated

**v1.0 MVP:**
- [x] Household sync with 4-digit code (Firestore real-time) — v1.0
- [x] Meal library with ingredients (name, category, store) — v1.0
- [x] Weekly meal planning (simple list, no day assignments) — v1.0
- [x] Grocery list organized by store first, then category — v1.0
- [x] Quick add with floating "+" button — v1.0
- [x] Voice input (Web Speech API + AI enhancement) — v1.0
- [x] Shopping mode (filter by store, in-cart tracking, complete trip) — v1.0
- [x] Staples section (always-grab items like Costco rotisserie chicken) — v1.0
- [x] Baking corner for Bella (inventory tracking, restock to grocery) — v1.0
- [x] PWA (installable, offline-capable) — v1.0
- [x] Warm & cozy UI theme (cream background, terracotta primary) — v1.0

**v1.1 Meal & Grocery Refactor:**
- [x] Simplified ingredients (name/category/store only, no qty/unit) — v1.1
- [x] Auto-populate grocery from weekly meals with "already have" toggle — v1.1
- [x] Recipe instructions (markdown notes for cooking) — v1.1
- [x] Meal images (Firebase Storage) — v1.1

**v1.2 Baking Organization:**
- [x] Nested baking folders (unlimited depth, Broma/Cookies/Holiday) — v1.2

**v1.3 Broma Bakery Import:**
- [x] Recipe scraping infrastructure (WebFetch + JSON import) — v1.3
- [x] 105 Broma Bakery recipes imported (Cookies, Bars, Muffins, Brownies) — v1.3
- [x] Recipe images (Firebase Storage + external URLs) — v1.3
- [x] Paste URL option for adding images — v1.3

### Active

- [ ] Alexa voice integration (Echo Show)
- [ ] Hands-free meal browsing and recipe viewing
- [ ] Cooking mode with step-by-step navigation
- [ ] Voice grocery list management

### Out of Scope

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
- GitHub repo exists (https://github.com/SunsetSystemsAI/our-kitchen)
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
| 4-digit code auth | No passwords to remember, low friction for household | ✓ Good — simple and works |
| Store-first grouping | Matches how they shop (one store at a time) | ✓ Good — natural workflow |
| No day assignments | Flexibility > rigid planning, reduces friction | ✓ Good — less cognitive load |
| Web Speech API + AI | Browser built-in + Claude for intelligence | ✓ Good — accurate item parsing |
| Separate baking tab | Bella's domain, keeps it visible and accessible | ✓ Good — clear separation |
| PWA over native | One codebase, instant updates, no app store friction | ✓ Good — installs on iOS/Android |
| Simplified ingredients | Name/category/store only, no qty/unit | ✓ Good — reduced friction |
| External image URLs | For Broma recipes, no Firebase re-upload needed | ✓ Good — simpler implementation |
| Nested folders for Baking | Unlimited depth for recipe organization | ✓ Good — scales with imports |

## Current State

**Shipped:** v1.3 Broma Bakery Import (2026-01-19)
**Codebase:** 15,221 lines TypeScript
**Tech stack:** React, TypeScript, Vite, Tailwind CSS, Firebase Firestore, Firebase Storage

**Recipe Library:**
- Main Dishes: User-added meals
- Baking: 105 Broma Bakery recipes (Cookies, Bars, Muffins, Brownies)

**Known Issues:**
- NestedFolderPicker step-by-step UI not working in modals (JSON imports work fine)
- Mixed image storage: some Firebase Storage, some external URLs

---
*Last updated: 2026-01-19 after v1.3 milestone*
