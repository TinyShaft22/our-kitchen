# Phase 28: Cooking Mode - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Step-by-step recipe navigation on Echo Show with voice control. Users can page through recipe instructions hands-free, with Alexa reading each step aloud. Supports resuming interrupted sessions and in-skill timers.

</domain>

<decisions>
## Implementation Decisions

### Step parsing
- Show all ingredients as "Step 0" before cooking begins
- Long steps auto-split into sub-steps (A, B, C parts)
- Claude's discretion: Choose parsing strategy based on markdown structure (numbered lists, ## headers, or smart merge)
- Claude's discretion: Handle recipes with no numbered steps gracefully

### Voice navigation
- Simple commands only: "Next step", "Previous step" — low barrier to entry
- Auto-read each step aloud when displayed
- Last step behavior: "You're done! Enjoy your meal." then return to recipe detail
- Claude's discretion: Implement "repeat" command if it makes sense

### Session behavior
- Entry: Touch ("Start Cooking" button) OR voice ("Start cooking") — flexible across devices
- Auto-offer: After viewing recipe, Alexa asks "Ready to start cooking?" — lowers discovery barrier
- Resume: Remember place if user leaves mid-recipe ("Welcome back! You were on step 4. Continue?")
- In-skill timers: "Set timer for 10 minutes" works within cooking mode
- Claude's discretion: Natural exit patterns (voice command, navigation commands)

### Claude's Discretion
- Step parsing algorithm (numbered lists vs headers vs hybrid)
- Handling unstructured recipe text (paragraphs, no clear steps)
- "Repeat" command implementation
- Exit flow and confirmation messaging
- Sub-step splitting threshold (how long is "too long"?)
- Timer display and voice feedback

</decisions>

<specifics>
## Specific Ideas

- "Low barrier to entry" is the guiding principle — users should discover features naturally without learning commands
- Auto-offer cooking mode after recipe view eliminates need to know "start cooking" command exists
- Simple next/back navigation matches natural cooking behavior (sequential, not random access)
- Ingredients as "Step 0" gives quick reference before starting

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 28-cooking-mode*
*Context gathered: 2026-01-20*
