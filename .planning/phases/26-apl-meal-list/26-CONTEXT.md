# Phase 26: APL Meal List - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual APL templates for browsing meals on Echo Show devices. Lambda handlers already exist (Phase 25). This phase adds the visual layer that complements voice responses. Voice-first design with optional visual enhancement.

</domain>

<decisions>
## Implementation Decisions

### Layout & density
- Image + name only on each meal card (clean, visual-focused)
- Meals without images: text-only card (larger text, no placeholder)
- Minimal header: "Our Kitchen" or "Meals" branding at top
- Claude decides card count/density based on APL best practices

### Navigation patterns
- Selecting a meal goes directly to recipe detail (Phase 27)
- Recipe detail screen should have "Add to Weekly Plan" option (touch + voice)
- Claude decides touch vs voice navigation based on Echo Show capabilities
- Claude decides back navigation and scroll position behavior

### Visual styling
- PWA warm colors as default (terracotta, sage, honey)
- Dark mode variant available
- Claude decides dark mode trigger (system setting vs voice toggle)
- Claude decides image treatment and typography

### Screen adaptation
- Support all Echo Show sizes (5, 8, 10, 15) with responsive templates
- Voice-only Echos must work — full functionality via voice responses alone
- Fire TV: support if easy (same responsive approach may cover it)

### Claude's Discretion
- Number of cards visible per screen size
- Touch + voice navigation balance
- Back button and scroll position retention
- Dark mode trigger mechanism
- Image rounded corners / visual treatment
- Font choice (PWA match vs Echo defaults)
- Fire TV viewport optimization (if minimal effort)

</decisions>

<specifics>
## Specific Ideas

- "I want this to be compatible for all Echo sizes and just all Echo devices. So I only have to build it once, and then it's good for the foreseeable future."
- Recipe detail should have visible "Add to Weekly Plan" option that works via touch or voice

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 26-apl-meal-list*
*Context gathered: 2026-01-20*
