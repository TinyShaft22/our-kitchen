# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-19)

**Core value:** Quick capture -> meal library -> auto-populated grocery list -> store-organized shopping
**Current focus:** v2.0 Alexa Integration in progress

## Current Position

Phase: 34 of 40 (v2.1 in progress)
Plan: Phase 34 complete, Phase 35 next
Status: **v2.1 Natural Language & NFI in progress**
Last activity: 2026-01-22 — Phase 34-01 complete (expanded utterances)

Progress: █████████████████████████░░░░ 87% (35/40 phases complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 63 (across v1.0-v2.0)
- Average duration: ~10 min
- Total execution time: ~9.5 hours

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.

**Phase 25-01 decisions:**
- Store alexaPin as string field on household documents
- Return 200 for valid=false PIN responses (cleaner for Lambda error handling)
- Case-insensitive item matching via fallback scan for removeGroceryItem
- Cap grocery list at 20 items for reasonable Alexa reading

**Phase 25-02 decisions:**
- Device ID partition key for persistence (survives Amazon account changes)
- Dirty flag pattern for persistence saves (only save when modified)
- 5s API timeout (leaves buffer for Alexa's 8s limit)

**Phase 25-03 decisions:**
- Max 3 PIN attempts before lockout (prevents brute force, friendly UX)
- Pending action resume after successful linking
- Context-aware Launch/Help handlers (different greetings for linked vs new users)

**Phase 25-04 decisions:**
- 5-item cap for voice meal list reading with "and X more" suffix
- 7-item cap for recipe ingredients (more complex content)
- Session caching of meal list for follow-up recipe requests
- Partial match on meal names (case-insensitive)

**Phase 25-05 decisions:**
- 5-item cap for voice grocery list reading
- 60-second undo window for session-scoped undo
- CheckOff uses removeGroceryItem (TODO: proper inCart endpoint)
- Short confirmations with undo hint for Add operation

**Phase 26-01 decisions:**
- AlexaImageList responsive template for auto-adaptation across Echo Show sizes
- Dark theme default with terracotta accent (#C4704B) matching PWA
- Empty imageSource for text-only display (no placeholder images)
- Touch selection stores mealId in session for Phase 27 recipe detail

**Phase 27-01 decisions:**
- Responsive layout: side-by-side columns on large screens (960px+), stacked on smaller screens
- Back button in header via AlexaHeader with SendEvent for navigation
- Bullet list format for ingredients with scrollable container
- Voice flow: "Here's the recipe for X. Would you like me to read the ingredients, read the instructions, or start cooking mode?"

**Phase 28-01 decisions:**
- Ingredients shown as Step 0 before cooking begins
- Three parsing strategies: numbered lists (1. or 1)), paragraphs, fallback
- Pager component for swipeable step navigation
- Navigation hint at bottom for discoverability

**Phase 28-02 decisions:**
- StartCooking accepts slot value OR session currentRecipe for flexible entry
- Context-aware handlers check cookingMode in canHandle for mode-specific matching
- Last step announces completion with "Enjoy your meal" message
- APL pager syncs with voice via ExecuteCommands SetPage directive

**Phase 28-03 decisions:**
- Start Cooking button uses TouchWrapper with SendEvent passing mealId
- StepChanged event syncs pager swipe with session state for voice continuity
- Exit cooking mode returns to recipe detail with follow-up options

**Phase 28-04 decisions:**
- 24-hour expiry on cooking progress (prevents stale resumes)
- Save progress on every response during cooking mode (guarantees no lost steps)
- pendingCookingResume pattern in session for handler handoff
- Clear progress on completion, explicit exit, or expired

**Phase 32-03 decisions:**
- Lookup household items before adding to grocery list
- Use saved store/category when item found in library
- Fall back to pantry/safeway defaults when not found
- Case-insensitive matching via nameLower field

**Phase 33-01 decisions:**
- Lazy evaluation inside handlers for Firebase Functions v2 env var compatibility
- Axios request interceptor for Lambda API key injection
- Committed .env.example with placeholder, gitignored .env

**Phase 30-01 decisions:**
- 77 test scenarios organized into 13 categories covering all Alexa capabilities
- Structured tables with voice command, expected response, and pass/fail columns
- Severity levels: Critical (crashes/security), High (feature broken), Medium (inconsistent), Low (cosmetic)

### Deferred Issues

- **NestedFolderPicker step-by-step UI not working** (Phase 15-03): The manual folder creation UI in Add/Edit meal modals doesn't switch to step-by-step mode when Baking is toggled ON. JSON imports with subcategory paths work correctly.

### Pending Todos

None - v1.3 complete.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-01-22
Stopped at: Phase 34-01 complete (expanded utterances to 139 total)
Resume file: None
Resume with: Phase 35 - Mark As Low Feature ("we're low on flour" command)

**Alexa debugging:** Separate terminal session debugging Alexa issues

## Milestones

- v1.0 MVP (Phases 1-10) — shipped 2026-01-15
- v1.1 Meal & Grocery Refactor (Phases 11-14) — shipped 2026-01-14
- v1.2 Baking Organization (Phase 15) — shipped 2026-01-15
- v1.3 Broma Bakery Import (Phases 16-22.1) — shipped 2026-01-19
- v2.0 Alexa Integration (Phases 23-32) — substantially complete
- v2.1 Natural Language & NFI (Phases 33-40) — **next milestone**

**Imported:**
- 105 Broma Bakery recipes in app

## Next Steps

**v2.1 Natural Language & NFI (current milestone):**
1. ~~Phase 33: Secure API Keys~~ - **COMPLETE** (env vars for Cloud Functions + Lambda)
2. ~~Phase 34: Expand Utterances~~ - **COMPLETE** (139 utterances across 10 intents)
3. Phase 35: Mark As Low Feature - "We're low on flour" command
4. Phase 36: Implement CanFulfillIntentRequest for NFI
5. Phase 37: Configure NFI toolkit
6. Phase 38-39: Certification and publish to live
7. Phase 40: Monitor NFI (8 weeks post-publish)

**Next:** Phase 35 - Mark As Low Feature

## Roadmap Evolution

- 2026-01-11: Project initialized with v1.0 phases 1-10
- 2026-01-13: v1.1 Meal & Grocery Refactor added (phases 11-14)
- 2026-01-15: v1.0 MVP complete
- 2026-01-15: v1.1 complete
- 2026-01-15: v1.2 Baking Organization added (phase 15)
- 2026-01-16: v1.3 Broma Bakery Import added (phases 16-22)
- 2026-01-16: v2.0 Alexa Integration added (phases 23-30)
- 2026-01-19: v1.3 gap closure — Phase 22.1 added and completed
- 2026-01-19: **v1.3 MILESTONE ARCHIVED**
- 2026-01-19: v2.0 Alexa Integration started - Phase 23-01 complete
- 2026-01-19: Phase 23-02 complete (Hello World Handler with "kitchen helper" invocation)
- 2026-01-19: **Phase 23 COMPLETE** — Alexa Setup verified
- 2026-01-20: Phase 24-01 complete (meal/recipe intents with custom slot types)
- 2026-01-20: Phase 24-02 complete (grocery/household/navigation intents)
- 2026-01-20: **Phase 24 COMPLETE** — Interaction model with 20 intents
- 2026-01-20: Phase 31 added: Home Page Enhancement (quick-add buttons, meal picker modal, week view with drag-drop)
- 2026-01-20: Phase 31-01 complete (DayOfWeek type, day assignment functions)
- 2026-01-20: Phase 31-02 complete (WeekViewToggle, LoadMealsModal, updated Home.tsx)
- 2026-01-20: Phase 31-03 complete (WeekView, DayColumn, UnassignedSection, conditional view rendering)
- 2026-01-20: Phase 25-02 complete (DynamoDB persistence, interceptors, HTTP client)
- 2026-01-20: Phase 25-01 complete (6 Alexa REST API endpoints in Cloud Functions)
- 2026-01-20: Phase 25-03 complete (PIN verification handler, context-aware launch/help)
- 2026-01-20: Phase 25-04 complete (Meal handlers: BrowseMeals, GetRecipe, BrowseCategory)
- 2026-01-20: Phase 25-05 complete (Grocery handlers: Read, Add, Undo, Remove, CheckOff)
- 2026-01-20: **Phase 25 COMPLETE** — Lambda Backend with 15 handlers
- 2026-01-20: Phase 26-01 complete (APL meal list with AlexaImageList, touch selection)
- 2026-01-20: **Phase 26 COMPLETE** — APL Meal List with visual browsing on Echo Show
- 2026-01-20: Phase 27-01 complete (APL recipe detail with responsive layout, touch-to-recipe flow)
- 2026-01-20: **Phase 27 COMPLETE** — APL Recipe Detail with ingredients and instructions display
- 2026-01-20: Phase 28-01 complete (step parser, APL pager document, datasource builder)
- 2026-01-20: Phase 28-02 complete (cooking mode handlers with voice navigation)
- 2026-01-20: Phase 28-03 complete (touch controls: Start Cooking button, swipe handlers, exit handler)
- 2026-01-20: Phase 28-04 complete (resume cooking with DynamoDB persistence)
- 2026-01-20: **Phase 28 COMPLETE** — Cooking Mode with voice navigation, touch controls, and resume
- 2026-01-21: Phase 32 added: Household Items (recurring products library for quick grocery adds)
- 2026-01-21: Phase 32-01 complete (HouseholdItem type, useHouseholdItems CRUD hook)
- 2026-01-22: Phase 32-03 complete (lookupHouseholdItem Cloud Function, Alexa integration)
- 2026-01-22: **Phase 32 COMPLETE** — Household Items with Alexa voice lookup
- 2026-01-22: Phase 33-01 complete (env vars for Cloud Functions and Lambda)
- 2026-01-22: **Phase 33 COMPLETE** — Secure API Keys with centralized config
- 2026-01-22: Phase 30-01 complete (test checklist with 77 scenarios, deployments confirmed)
- 2026-01-22: Phase 30-02 deferred (manual testing in separate debugging session)
- 2026-01-22: **Phase 30 COMPLETE** — Testing & Polish (manual testing deferred)
- 2026-01-22: Phase 34-01 complete (expanded utterances from 61 to 139)
- 2026-01-22: **Phase 34 COMPLETE** — Expand Utterances for NFI training
