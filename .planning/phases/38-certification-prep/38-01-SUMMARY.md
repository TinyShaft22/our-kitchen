---
phase: 38-certification-prep
plan: 01
subsystem: alexa-certification
tags: [privacy-policy, skill-manifest, alexa, certification, firebase-hosting]
dependency-graph:
  requires: [37-01]
  provides: [privacy-policy-page, complete-skill-manifest]
  affects: [38-02]
tech-stack:
  added: []
  patterns: [static-html-alongside-spa]
key-files:
  created: [public/privacy.html]
  modified: [firebase.json, our-kitchen-alexa/skill-package/skill.json]
decisions:
  - id: D38-01-1
    decision: "Privacy policy served as static HTML via Firebase Hosting rewrite, not as React route"
    reason: "Must be accessible without SPA JavaScript loading; Amazon crawlers need direct HTML"
  - id: D38-01-2
    decision: "US-only distribution with PUBLIC mode"
    reason: "Skill is English-only and targets US households"
  - id: D38-01-3
    decision: "Voice PIN authentication documented instead of standard account linking"
    reason: "Skill uses custom PIN flow, certification reviewers need to understand this"
metrics:
  duration: "3 min"
  completed: 2026-01-31
---

# Phase 38 Plan 01: Privacy Policy and Store Listing Summary

**One-liner:** Static privacy policy HTML at /privacy with complete skill.json certification metadata including US distribution, privacy URL, and updated example phrases.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create privacy policy page and configure Firebase Hosting | 81b174d | public/privacy.html, firebase.json |
| 2 | Update skill manifest with certification metadata | 7d23bcb | skill-package/skill.json |

## What Was Built

### Privacy Policy Page (public/privacy.html)
- Standalone static HTML page with inline CSS (mobile-friendly, max-width 800px)
- Covers: data collected (device ID, voice PIN, meals, recipes, grocery lists, household items), storage (Firebase/Firestore + DynamoDB), no third-party sharing, deletion options, contact email
- Firebase Hosting rewrite at /privacy serves it before the SPA catch-all
- Will be accessible at https://grocery-store-app-c3aa5.web.app/privacy after deploy

### Skill Manifest Updates (skill.json)
- `distributionCountries`: ["US"], `isAvailableWorldwide`: false, `distributionMode`: "PUBLIC"
- `usesPersonalInfo`: true with `privacyPolicyUrl` pointing to Firebase Hosting
- Example phrases updated to match actual utterances (added "this week" to dinner phrase)
- Keywords expanded from 4 to 10 terms
- Testing instructions updated with structured format for certification reviewers

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Static HTML over React route** — Privacy policy must be crawlable by Amazon without JavaScript execution
2. **US-only distribution** — Skill is English-only, targeting US households
3. **Placeholder contact email** — ourkitchen.app@gmail.com (user can update before submission)

## Next Phase Readiness

- Privacy policy page needs Firebase deploy before certification submission
- Testing instructions reference "provided separately" for PIN — will need actual test PIN in Plan 02
- Skill icons (small-icon.png, large-icon.png) referenced but not yet created — likely needed for certification
