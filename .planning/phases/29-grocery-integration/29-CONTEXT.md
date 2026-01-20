# Phase 29: Grocery Integration - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Voice commands for grocery list operations on Alexa — viewing the list, adding items, and removing items. Phase 25-05 built the handlers; this phase focuses on polishing the voice experience and adding APL visual display for Echo Show.

</domain>

<decisions>
## Implementation Decisions

### Voice response format
- 5-item cap when reading aloud, with "and X more" suffix
- Always include store when reading items ("eggs from Costco")
- Support store-filtered queries ("What do I need at Costco?" → only Costco items)
- Claude decides grouping approach (by store vs flat) based on list contents

### Add item behavior
- Short confirmation: "Added eggs."
- Unknown items (like "paper towels") → add to Staples by default
- Duplicate handling: ask user "You already have eggs on the list. Would you like to add a duplicate?"
- This allows household items to be added via voice, routed to Staples

### APL visual (Echo Show)
- Simple read-only list (not interactive checklist)
- Grouped by store with section headers
- Scrollable if items exceed screen
- Claude decides whether to include Staples section based on context

### Error handling
- Empty list: "Your grocery list is empty. Add items by saying 'add eggs'."
- Network error: "I'm having trouble reaching your kitchen. Try again in a moment."
- Not linked: Prompt on first use rather than blocking ("Link your household first. Say 'link my kitchen'.")
- Claude decides not-found response (simple message vs suggest similar items)

### Claude's Discretion
- Exact grouping logic for voice reading (by store vs flat based on list size)
- Whether to include Staples in APL visual display
- Not-found item response (simple vs suggestions)
- APL document styling and layout details

</decisions>

<specifics>
## Specific Ideas

- Short confirmations for add/remove to keep voice flow snappy
- Store info always included helps when shopping at multiple stores
- Staples as default for unknown items provides path for household supplies without new infrastructure
- Duplicate confirmation prevents accidental double-entries while allowing intentional ones

</specifics>

<deferred>
## Deferred Ideas

- Multiple list types beyond Grocery/Staples (household supplies, etc.) — future milestone
- Interactive checklist APL with tap-to-check — could be enhancement phase
- Dynamic "which list?" routing when more list types exist — future

</deferred>

---

*Phase: 29-grocery-integration*
*Context gathered: 2026-01-20*
