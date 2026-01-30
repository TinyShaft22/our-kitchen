# Phase 38: Certification Prep - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Prepare the "Kitchen Helper" Alexa skill for Amazon certification and live publication. This includes skill store listing metadata, privacy policy, testing instructions for reviewers, and compliance with all required Alexa behaviors.

</domain>

<decisions>
## Implementation Decisions

### Privacy Policy
- Create a simple privacy policy page (no existing one)
- Host on Firebase Hosting (already have infrastructure)
- Content: what data is collected (household PIN linking, meal/grocery data), no third-party sharing, data stored in Firestore

### Test Account for Reviewers
- Create a dedicated test household with sample data (meals, recipes, grocery items, household items)
- Separate from Nick & Bella's real household
- Provide test PIN and step-by-step testing instructions to Amazon reviewers

### Claude's Discretion
- Skill store listing: name ("Kitchen Helper"), description, example phrases, category selection
- Skill icon/imagery for store listing (512x512 and 108x108 required)
- Testing instructions format and detail level
- All certification compliance items: AMAZON.StopIntent, AMAZON.CancelIntent, AMAZON.HelpIntent, FallbackIntent behavior
- Error response wording and session management
- Terms of use (if needed beyond privacy policy)
- Distribution settings (countries, availability)
- Account linking description in skill metadata

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User deferred all certification details to Claude's judgment since this is primarily technical compliance work.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 38-certification-prep*
*Context gathered: 2026-01-29*
