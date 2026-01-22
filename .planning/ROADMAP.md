# Roadmap: Our Kitchen

## Overview

Build a PWA for Nick and Bella to manage weekly meals and grocery shopping. Start with project foundation and Firebase auth, build up the meal library and planning features, then add grocery list generation with shopping mode, and finish with voice input, baking corner, and PWA polish.

## Milestones

- **v1.0 MVP** - Phases 1-10 (complete)
- **v1.1 Meal & Grocery Refactor** - Phases 11-14 (complete)
- **v1.2 Baking Organization** - Phase 15 (complete)
- **v1.3 Broma Bakery Import** - Phases 16-22.1 (complete)
- **v2.0 Alexa Integration** - Phases 23-32 (in progress)
- **v2.1 Natural Language & NFI** - Phases 33-40 (planned)

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Project setup with Vite, React, TypeScript, Tailwind, routing
- [x] **Phase 2: Firebase Setup** - Firestore config, security rules, 4-digit household auth
- [x] **Phase 3: Data Layer** - TypeScript types, Firestore hooks, offline persistence setup
- [x] **Phase 4: Meal Library** - CRUD for meals with ingredients, quick add floating button
- [x] **Phase 5: Weekly Planning** - Select meals for the week from library
- [x] **Phase 6: Grocery Generation** - Auto-generate list from weekly meals, quantity combining
- [x] **Phase 7: Shopping Mode** - Store filtering, in-cart tracking, trip completion
- [x] **Phase 8: Voice & Staples** - Web Speech API input, always-grab staples section
- [x] **Phase 9: Baking Corner** - Bella's inventory tracking, restock to grocery list
- [x] **Phase 10: PWA & Polish** - Service worker, offline support, warm UI theme
- [x] **Phase 11: Simplify Ingredients** - Remove qty/unit, streamline to name/category/store
- [x] **Phase 12: Auto-Populate Grocery** - Real-time sync with "already have" toggle
- [x] **Phase 13: Recipe Instructions** - Markdown notes for cooking instructions
- [x] **Phase 14: Meal Images** - Firebase Storage for meal photos
- [x] **Phase 15: Nested Baking Folders** - Unlimited-depth nested folders for Baking section

## Phase Details

### Phase 1: Foundation
**Goal**: Working React app with routing, Tailwind styling, and basic layout
**Depends on**: Nothing (first phase)
**Research**: Unlikely (standard Vite + React setup)
**Plans**: 2 (01-01: Vite + Tailwind, 01-02: Routing + Navigation)

### Phase 2: Firebase Setup
**Goal**: Firestore connected with security rules, households can join via 4-digit code
**Depends on**: Phase 1
**Research**: Likely (Firestore security rules for household access)
**Research topics**: Firestore security rules patterns for shared household data, 4-digit code validation approach
**Plans**: 2 (02-01: Firebase SDK + Security Rules, 02-02: Household Auth)

### Phase 3: Data Layer
**Goal**: TypeScript types for all entities, Firestore hooks, data flows working
**Depends on**: Phase 2
**Research**: Unlikely (standard Firestore React patterns)
**Plans**: 3 (03-01: Types + Persistence, 03-02: Firestore Hooks, 03-03: Sample Data)

### Phase 4: Meal Library
**Goal**: Add, edit, delete meals with ingredients; floating + button for quick add
**Depends on**: Phase 3
**Research**: Unlikely (CRUD operations, internal patterns)
**Plans**: 3 (04-01: Meal List UI, 04-02: Add Meal Modal, 04-03: Edit/Delete Actions)

### Phase 5: Weekly Planning
**Goal**: Select meals from library for the week, simple list (no day assignments)
**Depends on**: Phase 4
**Research**: Unlikely (internal UI patterns)
**Plans**: 3 (05-01: Weekly Plan Display, 05-02: Add Meals to Week, 05-03: Edit/Remove Actions)

### Phase 6: Grocery Generation
**Goal**: Auto-generate grocery list from weekly meals, combine quantities, organize by store/category
**Depends on**: Phase 5
**Research**: Unlikely (data transformation logic)
**Plans**: 2 (06-01: Core Generation Logic, 06-02: Generate Button UI)

### Phase 7: Shopping Mode
**Goal**: Filter by store, track items in cart, complete shopping trip
**Depends on**: Phase 6
**Research**: Unlikely (internal UI patterns)
**Plans**: 2 (07-01: Store Filter & Item Interaction, 07-02: Shopping Trip Completion)

### Phase 8: Voice & Staples
**Goal**: Voice input for quick capture, staples section for always-grab items
**Depends on**: Phase 4
**Research**: Likely (Web Speech API)
**Research topics**: Web Speech API browser support, mobile Safari implementation quirks
**Plans**: 3 (08-01: Staples UI, 08-02: Voice Input, 08-03: Voice-to-Staple Integration)

### Phase 9: Baking Corner
**Goal**: Bella's baking inventory with quantities, restock items to grocery list
**Depends on**: Phase 6
**Research**: Unlikely (same patterns as meal library)
**Plans**: 3 (09-01: Inventory Display, 09-02: CRUD Modals, 09-03: Restock Integration)

### Phase 10: PWA & Polish
**Goal**: Installable PWA, offline-capable, warm & cozy UI theme applied
**Depends on**: All phases
**Research**: Unlikely (standard Vite PWA patterns, theme already applied)
**Plans**: 3 (10-01: PWA Setup, 10-02: Icons & iOS, 10-03: Final Polish)

---

### v1.1 Meal & Grocery Refactor (Planned)

**Milestone Goal:** Simplify ingredient tracking, add real-time grocery sync with "already have" toggle, and enhance meals with recipes and images.

### Phase 11: Simplify Ingredients
**Goal**: Remove qty/unit from ingredients, simplify to name/category/store only
**Depends on**: Phase 10
**Research**: Unlikely (internal refactor, existing patterns)
**Plans**: 1 (11-01: Simplify types, component, generation)

### Phase 12: Auto-Populate Grocery
**Goal**: Real-time sync from weekly meals to grocery list with "already have" checkboxes per ingredient per week
**Depends on**: Phase 11
**Research**: Unlikely (internal logic, Firestore patterns exist)
**Plans**: 2 (12-01: Data Model & Hook, 12-02: Auto-Sync & UI)

### Phase 13: Recipe Instructions
**Goal**: Add markdown notes field to meals for cooking instructions, display in expandable section on Meals page
**Depends on**: Phase 12
**Research**: Unlikely (simple text field, markdown rendering)
**Plans**: 1 (13-01: Instructions Field & Display)

### Phase 14: Meal Images
**Goal**: Firebase Storage integration for uploading/capturing meal photos, display as thumbnail and in detail view
**Depends on**: Phase 13
**Research**: Unlikely (standard Firebase Storage pattern, SDK already installed)
**Plans**: 2 (14-01: Storage Setup & AddModal, 14-02: EditModal & MealCard Display)

---

### v1.2 Baking Organization

**Milestone Goal:** Add nested folder support to the Baking section for organizing imported recipes (e.g., Broma > Cookies, Broma > Brownies).

### Phase 15: Nested Baking Folders
**Goal**: Unlimited-depth nested folders for Baking section only, with folder manager and step-by-step folder creation
**Depends on**: Phase 14
**Research**: Unlikely (internal UI patterns, path-based string approach)
**Plans**: 3 (15-01: Utilities & FolderManager, 15-02: Nested Display, 15-03: Folder Picker in Modals)

**Key features:**
- Path-based subcategory format: "Broma/Cookies/Holiday"
- Recursive folder rendering with expand/collapse at each level
- "Manage Folders" button for dedicated folder organization
- Step-by-step folder picker in Add/Edit meal modals
- Main Dishes section unchanged (flat folders)

---

<details>
<summary>v1.3 Broma Bakery Import (Phases 16-22.1) - SHIPPED 2026-01-19</summary>

**Delivered:** 105 Broma Bakery recipes imported with images and paste URL feature.

- [x] Phase 16: Scraping Infrastructure (2/2 plans) - completed 2026-01-15
- [x] Phase 17: Cookies Batch (2/2 plans) - completed 2026-01-16
- [x] Phase 18: Bars Batch (2/2 plans) - completed 2026-01-16
- [x] Phase 19: Muffins Batch (2/2 plans) - completed 2026-01-17
- [x] Phase 20: Brownies Batch (2/2 plans) - completed 2026-01-18
- [x] Phase 21: Import & Verification (2/2 plans) - completed 2026-01-19
- [x] Phase 22: Recipe Image Upload (1/1 plan) - completed 2026-01-19
- [x] Phase 22.1: Paste Image URL (1/1 plan) - completed 2026-01-19 (INSERTED)

*Full details: .planning/milestones/v1.3-ROADMAP.md*

</details>

---

### v2.0 Alexa Integration (Planned)

**Milestone Goal:** Add Echo Show voice + visual integration to Our Kitchen, enabling hands-free meal browsing, recipe viewing, cooking mode, and grocery management.

**Key Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Invocation name | "kitchen helper" | Avoids smart home conflicts |
| Authentication | Voice PIN | User says 4-digit code to link |
| Data freshness | Query fresh each time | Voice commands infrequent |
| Cooking steps | Auto-parse markdown | Split on ## headers and numbered lists |
| Visual approach | Voice-first with APL fallback | Works on all Echos |
| API layer | REST via Cloud Functions | Reuse existing pattern |

**Constraints:**
- Free hosting: Alexa-Hosted Skills only
- WSL development: Code in WSL, git push for deployment
- Voice-only fallback: Must work on any Alexa device

#### Phase 23: Alexa Setup
**Goal**: Developer account, Alexa-Hosted Skill creation, basic "hello world" response
**Depends on**: Phase 22
**Research**: Complete (see 23-RESEARCH.md)
**Plans**: 2 plans

Plans:
- [x] 23-01-PLAN.md - Account Setup & ASK CLI (has checkpoints for account/skill creation)
- [x] 23-02-PLAN.md - Hello World Handler (Lambda code + interaction model + deploy)

#### Phase 24: Interaction Model
**Goal**: Define intents, slots, utterances for all voice commands (meals, recipes, cooking, groceries)
**Depends on**: Phase 23
**Research**: Complete (see 24-RESEARCH.md)
**Plans**: 2 plans

Plans:
- [x] 24-01-PLAN.md - Meal & recipe intents with custom slot types
- [x] 24-02-PLAN.md - Grocery intents and household linking

#### Phase 25: Lambda Backend
**Goal**: Skill handler with Firebase connection via REST API, voice PIN linking
**Depends on**: Phase 24
**Research**: Complete (see 25-RESEARCH.md)
**Plans**: 5 plans

Plans:
- [x] 25-01-PLAN.md - Cloud Functions REST API (6 Alexa endpoints)
- [x] 25-02-PLAN.md - Lambda Core Infrastructure (persistence, interceptors, HTTP client)
- [x] 25-03-PLAN.md - Household Linking (PIN verification handler)
- [x] 25-04-PLAN.md - Meal Handlers (BrowseMeals, GetRecipe, BrowseCategory)
- [x] 25-05-PLAN.md - Grocery Handlers (Read, Add, Undo, Remove, CheckOff)

**Wave structure:**
- Wave 1 (parallel): 25-01 (Cloud Functions), 25-02 (Lambda infrastructure)
- Wave 2 (parallel): 25-03 (Household), 25-04 (Meals), 25-05 (Groceries)

#### Phase 26: APL Meal List
**Goal**: Visual template for browsing meals on Echo Show (voice-first, visual optional)
**Depends on**: Phase 25
**Research**: Complete (see 26-RESEARCH.md)
**Plans**: 1 plan

Plans:
- [x] 26-01-PLAN.md - APL document, datasource builder, event handler, MealHandlers update

#### Phase 27: APL Recipe Detail
**Goal**: Recipe detail display with ingredients and instructions on Echo Show
**Depends on**: Phase 26
**Research**: Unlikely (extends APL pattern from Phase 26)
**Plans**: 1 plan

Plans:
- [x] 27-01-PLAN.md - APL recipe detail document, datasource builder, handler updates

#### Phase 28: Cooking Mode
**Goal**: Step-by-step pager with voice navigation, auto-parsed markdown (## headers, numbered lists)
**Depends on**: Phase 27
**Research**: Unlikely (extends APL pager pattern)
**Plans**: 4 plans

Plans:
- [x] 28-01-PLAN.md - Step parser utility, APL pager document, datasource builder
- [x] 28-02-PLAN.md - Cooking handlers (StartCooking, Next, Previous, Repeat)
- [x] 28-03-PLAN.md - Touch controls (Start Cooking button, APL event handlers)
- [x] 28-04-PLAN.md - Resume cooking (DynamoDB persistence, resume detection)

**Wave structure:**
- Wave 1: 28-01 (foundation - step parser, APL document, datasource)
- Wave 2 (parallel): 28-02 (voice handlers), 28-03 (touch handlers), 28-04 (resume persistence)

#### Phase 29: Grocery Integration
**Goal**: APL visual display for grocery list, store-filtered queries, duplicate detection for add flow
**Depends on**: Phase 28
**Research**: Unlikely (extends APL and handler patterns)
**Plans**: 2 plans

Plans:
- [x] 29-01-PLAN.md - Backend enhancements (groceryList store filter, checkDuplicateGrocery endpoint)
- [x] 29-02-PLAN.md - APL grocery list, enhanced handlers (store info, duplicate detection)

**Wave structure:**
- Wave 1: 29-01 (Cloud Functions + firebaseClient)
- Wave 2: 29-02 (APL + handler updates)

#### Phase 30: Testing & Polish
**Goal**: End-to-end testing on Echo Show 5, refinements
**Depends on**: Phase 29
**Research**: Unlikely (testing/polish)
**Plans**: 2 plans

Plans:
- [x] 30-01-PLAN.md - Deploy and create test checklist (deployment, test data verification)
- [x] 30-02-PLAN.md - Manual testing on Echo Show 5 (DEFERRED - debugging in separate session)

**Wave structure:**
- Wave 1: 30-01 (deployment and test prep)
- Wave 2: 30-02 (manual testing with checkpoint)

#### Phase 31: Home Page Enhancement
**Goal**: Quick-add buttons, folder-organized meal picker modal, and week view with drag-and-drop meal planning
**Depends on**: Phase 30
**Research**: Unlikely (internal UI patterns, @dnd-kit docs)
**Plans**: 4 plans

Plans:
- [x] 31-01-PLAN.md - Data model & hook updates (DayOfWeek type, updateMealDay/updateSnackDay)
- [x] 31-02-PLAN.md - UI buttons & LoadMealsModal (toggle, modal, header buttons, FAB removal)
- [x] 31-03-PLAN.md - Static week view (WeekView, DayColumn, UnassignedSection)
- [ ] 31-04-PLAN.md - Drag-and-drop integration (@dnd-kit, draggable cards, Firebase persistence)

**Details:**
- Rename "Add Snack to Week" -> "Snacks", add matching "Meals" button
- Replace FAB with "Load Meals" button in header top-right
- LoadMealsModal with folder structure and search (reuses buildFolderTree)
- Week view toggle: switch between list and 7-day grid view
- Drag-and-drop meals/snacks to specific days using @dnd-kit
- Data model: add optional `day?: DayOfWeek` to WeeklyMealEntry/WeeklySnackEntry

#### Phase 32: Household Items
**Goal**: Library of recurring household products (paper towels, toothpaste, etc.) that can be quickly added to grocery list by name via voice or UI
**Depends on**: Phase 31
**Research**: Complete (see 32-RESEARCH.md)
**Plans**: 3 plans

Plans:
- [x] 32-01-PLAN.md - Data model & CRUD hook (HouseholdItem type, useHouseholdItems)
- [x] 32-02-PLAN.md - UI components (HouseholdItemCard, Add/Edit modals, GroceryListPage section)
- [x] 32-03-PLAN.md - Alexa integration (lookupHouseholdItem endpoint, smart add with saved defaults)

**Wave structure:**
- Wave 1: 32-01 (data foundation)
- Wave 2 (parallel): 32-02 (UI), 32-03 (Alexa)

**Details:**
- CRUD for household items (name, category, store, brand/notes)
- Alexa integration: "add paper towels" -> looks up saved item -> adds to grocery
- UI section to manage saved household items
- Distinct from Staples (which auto-add every time) - these are on-demand

---

### v2.1 Natural Language & NFI (Planned)

**Milestone Goal:** Enable natural language voice commands without explicit skill invocation. Implement Name-Free Interaction (NFI), secure API keys, add "mark as low" feature, and publish skill to live store.

**Key Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| API key storage | Firebase config + Lambda env vars | Secure, no hardcoding |
| NFI approach | CanFulfillIntentRequest + suggested phrases | Required for name-free routing |
| Publication timing | After NFI implementation | NFI only works on published skills |

*Full details: .planning/milestones/v2.1-ROADMAP.md*

#### Phase 33: Secure API Keys
**Goal**: Move hardcoded API key (`ourkitchen2024`) to environment variables
**Depends on**: Phase 32
**Research**: Unlikely
**Plans**: 1 plan

Plans:
- [x] 33-01-PLAN.md - Secure API keys (config module, env vars, deployment docs)

#### Phase 34: Expand Utterances
**Goal**: Add 10+ sample utterances per intent for better NFI training
**Depends on**: Phase 33
**Research**: Unlikely
**Plans**: 1 plan

Plans:
- [ ] 34-01-PLAN.md - Expand all custom intent utterances to 10+ samples

#### Phase 35: Mark As Low Feature
**Goal**: Voice command to mark items as low stock and add to grocery ("we're low on flour")
**Depends on**: Phase 34
**Research**: Unlikely
**Plans**: 2 plans

#### Phase 36: CanFulfillIntentRequest
**Goal**: Implement NFI foundation handler for Alexa's "can you handle this?" queries
**Depends on**: Phase 35
**Research**: Likely (NFI implementation)
**Plans**: 1 plan

#### Phase 37: NFI Configuration
**Goal**: Configure Name-Free Interaction toolkit with skill/intent launch phrases
**Depends on**: Phase 36
**Research**: Likely (NFI toolkit)
**Plans**: 1 plan

#### Phase 38: Certification Prep
**Goal**: Prepare skill for Amazon certification and live publication
**Depends on**: Phase 37
**Research**: Likely (certification requirements)
**Plans**: 1 plan

#### Phase 39: Publish to Live
**Goal**: Submit skill for certification and publish to live Alexa skill store
**Depends on**: Phase 38
**Research**: Unlikely
**Plans**: 1 plan

#### Phase 40: NFI Monitoring & Optimization
**Goal**: Monitor NFI performance and optimize based on analytics (post 8-week training)
**Depends on**: Phase 39 + 8 weeks
**Research**: Unlikely
**Plans**: 1 plan

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> ... -> 14 -> 15

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 2/2 | Complete | 2026-01-11 |
| 2. Firebase Setup | v1.0 | 2/2 | Complete | 2026-01-11 |
| 3. Data Layer | v1.0 | 3/3 | Complete | 2026-01-12 |
| 4. Meal Library | v1.0 | 3/3 | Complete | 2026-01-12 |
| 5. Weekly Planning | v1.0 | 3/3 | Complete | 2026-01-12 |
| 6. Grocery Generation | v1.0 | 2/2 | Complete | 2026-01-12 |
| 7. Shopping Mode | v1.0 | 2/2 | Complete | 2026-01-12 |
| 8. Voice & Staples | v1.0 | 3/3 | Complete | 2026-01-13 |
| 9. Baking Corner | v1.0 | 3/3 | Complete | 2026-01-13 |
| 10. PWA & Polish | v1.0 | 3/3 | Complete | 2026-01-15 |
| 11. Simplify Ingredients | v1.1 | 1/1 | Complete | 2026-01-13 |
| 12. Auto-Populate Grocery | v1.1 | 2/2 | Complete | 2026-01-13 |
| 13. Recipe Instructions | v1.1 | 1/1 | Complete | 2026-01-13 |
| 14. Meal Images | v1.1 | 2/2 | Complete | 2026-01-14 |
| 15. Nested Baking Folders | v1.2 | 3/3 | Complete | 2026-01-15 |
| 16. Scraping Infrastructure | v1.3 | 2/2 | Complete | 2026-01-15 |
| 17. Cookies Batch | v1.3 | 2/2 | Complete | 2026-01-16 |
| 18. Bars Batch | v1.3 | 2/2 | Complete | 2026-01-16 |
| 19. Muffins Batch | v1.3 | 2/2 | Complete | 2026-01-17 |
| 20. Brownies Batch | v1.3 | 2/2 | Complete | 2026-01-18 |
| 21. Import & Verification | v1.3 | 2/2 | Complete | 2026-01-19 |
| 22. Recipe Image Upload | v1.3 | 1/1 | Complete | 2026-01-19 |
| 22.1 Paste Image URL | v1.3 | 1/1 | Complete | 2026-01-19 |
| 23. Alexa Setup | v2.0 | 2/2 | Complete | 2026-01-19 |
| 24. Interaction Model | v2.0 | 2/2 | Complete | 2026-01-20 |
| 25. Lambda Backend | v2.0 | 5/5 | Complete | 2026-01-20 |
| 26. APL Meal List | v2.0 | 1/1 | Complete | 2026-01-20 |
| 27. APL Recipe Detail | v2.0 | 1/1 | Complete | 2026-01-20 |
| 28. Cooking Mode | v2.0 | 4/4 | Complete | 2026-01-20 |
| 29. Grocery Integration | v2.0 | 2/2 | Complete | 2026-01-20 |
| 30. Testing & Polish | v2.0 | 2/2 | Complete (deferred) | 2026-01-22 |
| 31. Home Page Enhancement | v2.0 | 3/4 | In progress | - |
| 32. Household Items | v2.0 | 3/3 | Complete | 2026-01-21 |
| 33. Secure API Keys | v2.1 | 1/1 | Complete | 2026-01-22 |
| 34. Expand Utterances | v2.1 | 1/1 | Complete | 2026-01-22 |
| 35. Mark As Low Feature | v2.1 | 0/2 | Not started | - |
| 36. CanFulfillIntentRequest | v2.1 | 0/1 | Not started | - |
| 37. NFI Configuration | v2.1 | 0/1 | Not started | - |
| 38. Certification Prep | v2.1 | 0/1 | Not started | - |
| 39. Publish to Live | v2.1 | 0/1 | Not started | - |
| 40. NFI Monitoring | v2.1 | 0/1 | Not started | - |
