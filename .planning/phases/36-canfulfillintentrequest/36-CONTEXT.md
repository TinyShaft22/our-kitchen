# Phase 36: CanFulfillIntentRequest - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the CanFulfillIntentRequest (CFIR) handler that responds to Alexa's "can you handle this?" queries. This is the foundation for Name-Free Interaction (NFI) routing. The handler evaluates incoming intents and slots, returning YES/NO/MAYBE to indicate capability.

</domain>

<decisions>
## Implementation Decisions

### Response Strategy
- Claude's Discretion on YES vs MAYBE for core intents (BrowseMeals, GetRecipe, AddGrocery, etc.)
- Claude's Discretion on handling built-in Alexa intents (Help, Stop, Cancel)
- Claude's Discretion on default response for unknown/unexpected intents
- Claude's Discretion on whether household linking status affects CFIR responses

### Slot Validation
- Claude's Discretion on validation strictness for custom slots (MealName, CategoryName)
- Claude's Discretion on handling missing required slots in CFIR requests
- Claude's Discretion on AMAZON.Food slot validation approach
- Claude's Discretion on structural vs data validation (no Firebase queries for CFIR performance)

### Logging/Debugging
- Claude's Discretion on CloudWatch logging for CFIR requests
- Claude's Discretion on log detail level (intent, slots, response)
- Claude's Discretion on local testing approach vs Alexa simulator
- Claude's Discretion on monitoring approach for post-NFI performance

### Claude's Discretion
All areas delegated to Claude's judgment based on:
- NFI best practices and Alexa documentation
- Performance requirements (CFIR should be fast)
- How our existing handlers work (backend does matching)
- Debugging utility vs log noise

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches based on NFI best practices.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 36-canfulfillintentrequest*
*Context gathered: 2026-01-22*
