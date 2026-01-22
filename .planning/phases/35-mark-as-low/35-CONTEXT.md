# Phase 35: Mark As Low Feature - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Voice command to mark baking/household items as "low stock" and auto-add to grocery list. Example: "We're low on flour" → marks flour as low in baking inventory → adds to grocery list. This phase covers the Alexa intent, matching logic, inventory status flag, and auto-clear on purchase.

</domain>

<decisions>
## Implementation Decisions

### Item Matching
- Search baking inventory first, then household items as fallback
- Use contains/fuzzy matching — "flour" matches "all-purpose flour", "bread flour", etc.
- When multiple matches found, ask user to disambiguate: "I found 3 types of flour. Did you mean all-purpose, bread, or cake flour?"
- Single match → proceed without asking

### Inventory Update
- Add a `isLow` boolean flag to baking inventory items
- Mark item as low when voice command is used
- Auto-clear the low flag when item is checked off grocery list (purchased)
- Visual indicator in app for low items (badge or section — Claude's discretion)

### Edge Cases
- Item not found in either source: Offer to add anyway — "I don't have flour saved. Want me to add it to grocery anyway?"
- Item already on grocery list: Ask — "Flour is already on your list. Want me to add another?"
- Unknown item store/category: Claude decides reasonable defaults (likely Safeway/Pantry pattern from existing code)

### Claude's Discretion
- Whether household items also get a `isLow` flag (based on data model fit)
- Visual treatment of low items in the app (badge vs section vs both)
- How to handle quantity hints ("almost out" vs "completely out") — can treat all the same
- Default store/category for unknown items

</decisions>

<specifics>
## Specific Ideas

- Disambiguation flow similar to existing "which meal did you mean?" pattern in Alexa
- "We're low on flour" is the primary utterance — also support "we're almost out of", "we're out of", "we need more"
- Low flag should be visible enough that Bella notices when browsing baking inventory

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 35-mark-as-low*
*Context gathered: 2026-01-22*
