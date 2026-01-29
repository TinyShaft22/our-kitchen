# Phase 37: NFI Configuration - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Configure Name-Free Interaction (NFI) toolkit in the Alexa Developer Console so Alexa can route utterances to Our Kitchen without explicit skill invocation ("Alexa, ask kitchen helper..."). Includes skill-level launch phrases, intent-level phrases, category selection, and store listing metadata.

</domain>

<decisions>
## Implementation Decisions

### Phrase style
- Mix of conversational and direct/command-like phrases
- Conversational for common actions ("what's for dinner tonight")
- Direct for specific features ("read my grocery list")

### Phrase selection
- Claude's discretion on specific phrases — generate natural-sounding options based on skill features
- Claude's discretion on broad vs specific — balance discoverability with realistic competition from other skills
- No user-specific phrases requested — use general food/kitchen/household language

### Intent coverage
- Both cooking and planning/lists get equal NFI coverage — position as full kitchen companion
- Claude's discretion on which intents are good NFI entry points (skip context-dependent intents like Undo, CheckOff)
- Claude's discretion on grocery phrase granularity (distinct per action vs general)
- Claude's discretion on phrase count per intent (Amazon recommends 3+ variations)

### Category & identity
- Skill category: **Lifestyle** (user chose this over Food & Drink)
- Claude's discretion on suggested phrase tone and skill description positioning
- Claude's discretion on icon approach (reuse PWA icon vs new)

### Claude's Discretion
- Specific NFI phrases to register (both skill-level and intent-level)
- Which intents get NFI phrases vs which are skipped as context-dependent
- Number of phrase variations per intent
- Suggested phrases shown in Alexa app
- Skill description and positioning copy
- Icon approach for store listing

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User wants the skill positioned as both a cooking assistant and a planning/list management tool equally.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 37-nfi-configuration*
*Context gathered: 2026-01-29*
