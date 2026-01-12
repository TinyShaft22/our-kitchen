# Roadmap: Our Kitchen

## Overview

Build a PWA for Nick and Bella to manage weekly meals and grocery shopping. Start with project foundation and Firebase auth, build up the meal library and planning features, then add grocery list generation with shopping mode, and finish with voice input, baking corner, and PWA polish.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Project setup with Vite, React, TypeScript, Tailwind, routing
- [x] **Phase 2: Firebase Setup** - Firestore config, security rules, 4-digit household auth
- [x] **Phase 3: Data Layer** - TypeScript types, Firestore hooks, offline persistence setup
- [ ] **Phase 4: Meal Library** - CRUD for meals with ingredients, quick add floating button
- [ ] **Phase 5: Weekly Planning** - Select meals for the week from library
- [ ] **Phase 6: Grocery Generation** - Auto-generate list from weekly meals, quantity combining
- [ ] **Phase 7: Shopping Mode** - Store filtering, in-cart tracking, trip completion
- [ ] **Phase 8: Voice & Staples** - Web Speech API input, always-grab staples section
- [ ] **Phase 9: Baking Corner** - Bella's inventory tracking, restock to grocery list
- [ ] **Phase 10: PWA & Polish** - Service worker, offline support, warm UI theme

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
**Plans**: TBD

### Phase 6: Grocery Generation
**Goal**: Auto-generate grocery list from weekly meals, combine quantities, organize by store/category
**Depends on**: Phase 5
**Research**: Unlikely (data transformation logic)
**Plans**: TBD

### Phase 7: Shopping Mode
**Goal**: Filter by store, track items in cart, complete shopping trip
**Depends on**: Phase 6
**Research**: Unlikely (internal UI patterns)
**Plans**: TBD

### Phase 8: Voice & Staples
**Goal**: Voice input for quick capture, staples section for always-grab items
**Depends on**: Phase 4
**Research**: Likely (Web Speech API)
**Research topics**: Web Speech API browser support, mobile Safari implementation quirks
**Plans**: TBD

### Phase 9: Baking Corner
**Goal**: Bella's baking inventory with quantities, restock items to grocery list
**Depends on**: Phase 6
**Research**: Unlikely (same patterns as meal library)
**Plans**: TBD

### Phase 10: PWA & Polish
**Goal**: Installable PWA, offline-capable, warm & cozy UI theme applied
**Depends on**: All phases
**Research**: Likely (PWA setup, offline Firestore)
**Research topics**: Vite PWA plugin configuration, Firestore offline persistence, PWA manifest for iOS
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-01-11 |
| 2. Firebase Setup | 2/2 | Complete | 2026-01-11 |
| 3. Data Layer | 3/3 | Complete | 2026-01-12 |
| 4. Meal Library | 1/3 | In progress | - |
| 5. Weekly Planning | 0/TBD | Not started | - |
| 6. Grocery Generation | 0/TBD | Not started | - |
| 7. Shopping Mode | 0/TBD | Not started | - |
| 8. Voice & Staples | 0/TBD | Not started | - |
| 9. Baking Corner | 0/TBD | Not started | - |
| 10. PWA & Polish | 0/TBD | Not started | - |
