# Roadmap: Our Kitchen

## Overview

Build a PWA for Nick and Bella to manage weekly meals and grocery shopping. Start with project foundation and Firebase auth, build up the meal library and planning features, then add grocery list generation with shopping mode, and finish with voice input, baking corner, and PWA polish.

## Milestones

- 🚧 **v1.0 MVP** - Phases 1-10 (in progress)
- 📋 **v1.1 Meal & Grocery Refactor** - Phases 11-14 (planned)

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
- [ ] **Phase 10: PWA & Polish** - Service worker, offline support, warm UI theme
- [x] **Phase 11: Simplify Ingredients** - Remove qty/unit, streamline to name/category/store
- [x] **Phase 12: Auto-Populate Grocery** - Real-time sync with "already have" toggle
- [ ] **Phase 13: Recipe Instructions** - Markdown notes for cooking instructions
- [ ] **Phase 14: Meal Images** - Firebase Storage for meal photos

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
**Plans**: TBD

### Phase 14: Meal Images
**Goal**: Firebase Storage integration for uploading/capturing meal photos, display as thumbnail and in detail view
**Depends on**: Phase 13
**Research**: Likely (Firebase Storage setup, image upload handling)
**Research topics**: Firebase Storage setup, image compression, camera capture on mobile
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → ... → 10 → 11 → 12 → 13 → 14

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
| 10. PWA & Polish | v1.0 | 2/3 | In progress | - |
| 11. Simplify Ingredients | v1.1 | 1/1 | Complete | 2026-01-13 |
| 12. Auto-Populate Grocery | v1.1 | 2/2 | Complete | 2026-01-13 |
| 13. Recipe Instructions | v1.1 | 0/? | Not started | - |
| 14. Meal Images | v1.1 | 0/? | Not started | - |
