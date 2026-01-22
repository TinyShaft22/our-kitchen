# Phase 34: Expand Utterances - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Add 10+ sample utterances per intent for better NFI (Name-Free Interaction) training. This improves Alexa's ability to route natural language commands to the skill without explicit invocation. No new intents or capabilities — utterance variety only.

</domain>

<decisions>
## Implementation Decisions

### Coverage Priorities
- All intent areas equally important (grocery, meals, cooking)
- Focus on making commands feel natural WITHOUT invocation name
- Current pain point: Alexa's built-in intents compete with skill intents
- Priority is helping NFI distinguish "our kitchen" commands from system commands

### Natural Phrasing Patterns
- Grocery commands need "to the list" suffix patterns:
  - "Put milk on the list" > "Add milk"
  - "I need milk, add it to the list"
  - "Add paper towels to the list"
- Users rarely say bare "add X" — they include list context

### Utterance Style
- Mix of casual, direct, and polite tones
- Include contractions ("what's", "we're") sometimes
- Support both formal and informal phrasing
- Examples: "Hey what's for dinner" alongside "Show meals"

### Claude's Discretion
- Whether to include common mishearings/slurs for robustness
- Exact distribution across tones (casual vs formal)
- NFI-specific phrasing priorities based on training effectiveness
- Which intents need most variety based on competition with built-ins

</decisions>

<specifics>
## Specific Ideas

- "Put X on my list" and "I need X" patterns feel more natural than "Add X"
- Commands should work without saying "kitchen helper" — that's the NFI goal
- Alexa currently clashes with built-in shopping list and meal planning features

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 34-expand-utterances*
*Context gathered: 2026-01-22*
