# Phase 27: APL Recipe Detail - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Display a recipe's ingredients and cooking instructions on Echo Show when user requests a specific recipe. Voice-first design with visual enhancement for screen devices. Extends APL pattern from Phase 26 (meal list).

</domain>

<decisions>
## Implementation Decisions

### Voice Flow
- Brief confirmation: "Here's the recipe for {meal}"
- Display visual (if screen available)
- Offer follow-up actions: "Would you like me to read the ingredients, read the instructions, or start cooking mode?"
- For devices WITHOUT screen: Always ask first, never auto-read
- This creates a conversational hub for recipe interaction

### Follow-up Actions
- "Read ingredients" — Speaks ingredient list with cap (Claude decides cap, likely 7 per Phase 25-04)
- "Read instructions" — Claude determines approach based on length (full, summary, or step count + offer cooking mode)
- "Start cooking mode" — Hands off to Phase 28 Cooking Mode

### Claude's Discretion
- Ingredient visual format (bullet, numbered, checkbox style)
- Ingredient grouping (flat vs by category based on data)
- Long list handling (scrollable vs cap)
- Meal image inclusion and size
- Instructions display format (full vs summary/preview)
- Step numbering vs free-flowing text
- Section header preservation (## Prep, ## Cook)
- Recipe Detail → Cooking Mode relationship
- Voice read-back ingredient cap
- Touch scrolling behavior
- Action buttons vs voice-only
- Tap-on-meal flow from Phase 26 list
- Back navigation (button vs voice-only)

</decisions>

<specifics>
## Specific Ideas

- User explicitly wants the flow: "Here's the recipe for X" → display → "What would you like me to do next? Read the ingredients, read the instructions, or start cooking mode?"
- Same pattern for screen and non-screen devices (confirmation + offer actions)
- This screen is the "hub" for interacting with a recipe — launch point for reading or cooking

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 27-apl-recipe-detail*
*Context gathered: 2026-01-20*
