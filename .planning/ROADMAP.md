# Roadmap: Our Kitchen

## Overview

Build a PWA for Nick and Bella to manage weekly meals and grocery shopping. Start with project foundation and Firebase auth, build up the meal library and planning features, then add grocery list generation with shopping mode, and finish with voice input, baking corner, and PWA polish.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-10 (complete)
- ✅ **v1.1 Meal & Grocery Refactor** - Phases 11-14 (complete)
- ✅ **v1.2 Baking Organization** - Phase 15 (complete)
- 🚧 **v1.3 Broma Bakery Import** - Phases 16-22 (in progress)
- 📋 **v2.0 Alexa Integration** - Phases 23-30 (planned)

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

### 📋 v1.1 Meal & Grocery Refactor (Planned)

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

### 📋 v1.2 Baking Organization

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

### 📋 v1.3 Broma Bakery Import

**Milestone Goal:** Scrape 91 recipes from Broma Bakery (Cookies, Bars, Muffins, Brownies) and import via JSON into the food app with proper markdown formatting.

### Phase 16: Scraping Infrastructure
**Goal**: Test scrape one recipe, validate JSON format works with import system
**Depends on**: Phase 15
**Research**: Likely (recipe page structure, ingredient parsing patterns)
**Plans**: 2 (16-01: Test Scrape & Format, 16-02: Ingredient Category Mapping)

### Phase 17: Cookies Batch
**Goal**: Scrape all 27 cookie recipes, generate import-ready JSON
**Depends on**: Phase 16
**Research**: Unlikely (pattern established)
**Plans**: 2 (17-01: Scrape Cookies, 17-02: Generate JSON)

### Phase 18: Bars Batch
**Goal**: Scrape bar recipes (36 of 71 found), extract image URLs, generate import-ready JSON
**Depends on**: Phase 16
**Research**: Unlikely (pattern established)
**Plans**: 2 (18-01: Scrape Bars, 18-02: Generate JSON + Images)
**Note**: Original estimate was 25 recipes; actual category has 71. Scoped to 36 (first half).

### Phase 19: Muffins Batch
**Goal**: Scrape all 18 muffin recipes, extract image URLs, generate import-ready JSON
**Depends on**: Phase 16
**Research**: Unlikely (pattern established)
**Plans**: 2 (19-01: Scrape Muffins, 19-02: Generate JSON + Images)

### Phase 20: Brownies Batch
**Goal**: Scrape all 21 brownie recipes, extract image URLs, generate import-ready JSON
**Depends on**: Phase 16
**Research**: Unlikely (pattern established)
**Plans**: 2 (20-01: Scrape Brownies, 20-02: Generate JSON + Images)

### Phase 21: Import & Verification
**Goal**: Import all JSON files via Settings, verify recipes display correctly
**Depends on**: Phases 17-20
**Research**: Unlikely (using existing import feature)
**Plans**: 2 (21-01: Import All Batches, 21-02: Verify & Fix Issues)

**Recipe Format:**
- Markdown instructions with ## headers, bullet lists, numbered steps
- Original recipe link at bottom
- Ingredients mapped to app categories (baking, dairy, pantry, produce)
- Subcategory set to type (Cookies, Bars, Muffins, Brownies)

### Phase 22: Recipe Image Upload
**Goal**: Upload images from Broma Bakery to imported recipes using Claude-in-Chrome browser automation
**Depends on**: Phase 21
**Research**: Unlikely (using existing image upload feature + Claude-in-Chrome MCP)
**Plans**: 1 (22-01: Image Upload Workflow)

**Workflow:**
- PowerShell handoff with Claude-in-Chrome MCP
- For each recipe: download og:image URL, upload to meal's photo field
- Uses extracted image URLs from {category}-images.json files
- Batch process per category (Cookies, Bars, Muffins, Brownies)

---

### 📋 v2.0 Alexa Integration (Planned)

**Milestone Goal:** Add Echo Show voice + visual integration to Our Kitchen, enabling hands-free meal browsing, recipe viewing, cooking mode, and grocery management.

**Key Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Invocation name | "Our Kitchen" | Matches app name |
| Authentication | Voice PIN | User says 4-digit code to link |
| Data freshness | Query fresh each time | Voice commands infrequent |
| Cooking steps | Auto-parse markdown | Split on ## headers and numbered lists |
| Visual approach | Voice-first with APL fallback | Works on all Echos |
| API layer | REST via Cloud Functions | Reuse existing pattern |

**Constraints:**
- Free hosting: Alexa-Hosted Skills only
- WSL development: Code in WSL, PowerShell handoff for `ask deploy`
- Voice-only fallback: Must work on any Alexa device

#### Phase 23: Alexa Setup
**Goal**: Developer account, Alexa-Hosted Skill creation, basic "hello world" response
**Depends on**: Phase 22
**Research**: Likely (Alexa SDK, developer account setup)
**Research topics**: ASK CLI setup, Alexa-Hosted Skills structure, deployment workflow
**Plans**: TBD

Plans:
- [ ] 23-01: TBD (run /gsd:plan-phase 23 to break down)

#### Phase 24: Interaction Model
**Goal**: Define intents, slots, utterances for all voice commands (meals, recipes, cooking, groceries)
**Depends on**: Phase 23
**Research**: Likely (ASK interaction model schema)
**Research topics**: Intent/slot syntax, utterance patterns, built-in slot types
**Plans**: TBD

Plans:
- [ ] 24-01: TBD

#### Phase 25: Lambda Backend
**Goal**: Skill handler with Firebase connection via REST API, voice PIN linking
**Depends on**: Phase 24
**Research**: Likely (Lambda + Firebase REST integration)
**Research topics**: Cloud Functions REST endpoints, session attributes, account linking alternatives
**Plans**: TBD

Plans:
- [ ] 25-01: TBD

#### Phase 26: APL Meal List
**Goal**: Visual template for browsing meals (voice-first, visual optional)
**Depends on**: Phase 25
**Research**: Likely (APL templating language)
**Research topics**: APL document structure, ImageList template, viewport profiles for Echo Show 5
**Plans**: TBD

Plans:
- [ ] 26-01: TBD

#### Phase 27: APL Recipe Detail
**Goal**: Ingredients + instructions display for "Show me the recipe for {meal}"
**Depends on**: Phase 26
**Research**: Unlikely (extends APL pattern from Phase 26)
**Plans**: TBD

Plans:
- [ ] 27-01: TBD

#### Phase 28: Cooking Mode
**Goal**: Step-by-step pager with voice navigation, auto-parsed markdown (## headers, numbered lists)
**Depends on**: Phase 27
**Research**: Unlikely (extends APL pager pattern)
**Plans**: TBD

Plans:
- [ ] 28-01: TBD

#### Phase 29: Grocery Integration
**Goal**: "What's on my grocery list?" / "Add {item}" — list viewing and item addition via voice
**Depends on**: Phase 28
**Research**: Unlikely (extends voice command pattern)
**Plans**: TBD

Plans:
- [ ] 29-01: TBD

#### Phase 30: Testing & Polish
**Goal**: End-to-end testing on Echo Show 5, refinements
**Depends on**: Phase 29
**Research**: Unlikely (testing/polish)
**Plans**: TBD

Plans:
- [ ] 30-01: TBD

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → ... → 14 → 15

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
| 21. Import & Verification | v1.3 | 0/2 | Not started | - |
| 22. Recipe Image Upload | v1.3 | 0/1 | Not started | - |
| 23. Alexa Setup | v2.0 | 0/? | Not started | - |
| 24. Interaction Model | v2.0 | 0/? | Not started | - |
| 25. Lambda Backend | v2.0 | 0/? | Not started | - |
| 26. APL Meal List | v2.0 | 0/? | Not started | - |
| 27. APL Recipe Detail | v2.0 | 0/? | Not started | - |
| 28. Cooking Mode | v2.0 | 0/? | Not started | - |
| 29. Grocery Integration | v2.0 | 0/? | Not started | - |
| 30. Testing & Polish | v2.0 | 0/? | Not started | - |
