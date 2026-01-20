# Phase 25: Lambda Backend - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Alexa skill handler that connects to Firebase via REST API (Cloud Functions) and handles voice PIN household linking. Enables data access for meals, recipes, weekly plans, and grocery lists. Visual templates (APL) and specific command implementations are separate phases.

**Key decisions already locked (from roadmap):**
- Authentication: Voice PIN (user says 4-digit code to link)
- Data freshness: Query fresh each time (no caching)
- API layer: REST via Cloud Functions

</domain>

<decisions>
## Implementation Decisions

### PIN Verification Flow
- Prompt for PIN on first data request (lowest friction approach)
- User opens skill, asks for meals/groceries, gets prompted once per session
- 3 attempts maximum before exit
- After 3 wrong PINs: "Check your PIN in the app and try again later" (hint to help)
- Linking persists forever — once linked, device remembers household

### Error Responses
- Firebase unreachable: Technical honest — "I'm having trouble connecting to your kitchen right now"
- Meal not found: Helpful suggestion — "I couldn't find [meal]. Did you mean...?" with similar names
- Empty state: Encourage action — "Your weekly plan is empty. Add meals in the app to get started."
- Overall tone: Casual friendly — "Hmm, I can't find that one" rather than formal

### Linking Persistence
- Persist forever — link once, device always connects to that household
- Data stays fresh via live Firebase queries (no re-linking needed when recipes added)
- User can re-link to different household by going through PIN flow again (overwrites)

### Response Verbosity
- Meal lists: Names only — "Your meals are: Tacos, Pasta, Stir Fry"
- User drills down with follow-ups: "Show me tacos" → "Show me recipe for Beef Tacos"
- List cap at 5 items: Read first 5, then "and 7 more"
- Confirmations: Short — "Added" or "Got it" (not full echo back)
- Recipe reading: Ingredients first, then ask "Ready for the steps?"

### Claude's Discretion
- Per-device vs per-Amazon-account linking (implement based on Alexa capabilities)
- Whether to support explicit unlink command vs just re-link overwrites
- Re-linking mid-session implementation
- How to handle household PIN changes (auto-disconnect vs link by household ID)
- Fuzzy matching algorithm for "did you mean" suggestions

</decisions>

<specifics>
## Specific Ideas

- "Lowest barrier of entry" — user wants minimal friction, natural conversation flow
- Drill-down pattern: list overview → filter/search → specific detail
- Short confirmations keep cooking flow uninterrupted

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 25-lambda-backend*
*Context gathered: 2026-01-20*
