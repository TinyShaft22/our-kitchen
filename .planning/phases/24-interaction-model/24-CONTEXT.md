# Phase 24: Interaction Model - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Define intents, slots, and utterances for all voice commands in the Alexa skill. This covers meals browsing, recipe viewing, cooking mode navigation, and grocery list management. The actual Lambda handlers and APL displays are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Command Vocabulary
- **Tone:** Casual/friendly — "Hey, what's for dinner?" → "You've got 3 meals planned this week!"
- **Browse meals:** Primary phrase is "What's for dinner?" (implies this week's meals)
- **Cooking commands:** Claude's discretion — support natural variations like "Let's cook {meal}", "How do I make {meal}"
- **Grocery commands:** Claude's discretion — support natural variations like "What do we need to buy?", "What's on the list?"

### Meal Name Matching
- **Partial matches:** Confirm first — "Did you mean Crispy Chicken Tacos?"
- **Multiple matches:** Ask to narrow — "I found 15 cookies. Can you be more specific?"
- **Category browsing:** Yes — "Show me cookies" lists cookie recipes, browse by folder/category
- **Nickname handling:** Claude's discretion — determine reasonable partial matching

### Confirmation Behavior
- **Adding grocery items:** Confirm + undo — "Added milk. Say undo to remove."
- **Starting cooking mode:** Just start — "Let's make tacos!" immediately shows step 1
- **End of cooking:** Silent end — "That's the last step. Enjoy your meal!"
- **Proactive suggestions:** Light suggestions — after showing a meal, offer "Want to start cooking?"

### Error & Fallback Responses
- **Meal not found:** Simple + suggest — "I couldn't find that. Try saying the full recipe name."
- **Not linked:** Guide to link — "You're not linked yet. Say your 4-digit household code to connect."
- **System errors:** Claude's discretion — handle gracefully
- **Unknown command:** Suggest commands — "I didn't catch that. Try saying 'what's for dinner' or 'start cooking tacos'."

### Claude's Discretion
- Specific utterance variations and synonyms
- Exact slot types and built-in slot usage
- System error message wording
- Cooking command phrase variations
- Grocery command phrase variations
- Partial name matching algorithm

</decisions>

<specifics>
## Specific Ideas

- "What's for dinner?" is the canonical browse command — feels natural for the household
- Casual/friendly tone throughout — this is for home use, not a business assistant
- Light suggestions keep the experience flowing without being annoying

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 24-interaction-model*
*Context gathered: 2026-01-19*
