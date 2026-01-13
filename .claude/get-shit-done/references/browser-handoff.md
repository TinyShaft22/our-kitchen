<overview>
When browser automation is needed (testing, Firebase console, visual verification) and Playwright MCP fails or isn't available, generate a detailed handoff prompt for the user to run in a PowerShell Claude Code session that has the Chrome extension connected.
</overview>

<when_to_use>

**Trigger conditions:**
1. Playwright MCP test fails (module not found, browser not installed, etc.)
2. `mcp__claude-in-chrome__tabs_context_mcp` returns "Browser extension is not connected"
3. Firebase console operations needed (security rules, data inspection, manual fixes)
4. Visual/functional testing requires real browser interaction
5. Any checkpoint:human-verify that would benefit from automated browser testing

</when_to_use>

<handoff_protocol>

When triggered, generate a comprehensive prompt using this format:

```
════════════════════════════════════════════════════════════════
BROWSER HANDOFF - Copy this to PowerShell Claude Code session
════════════════════════════════════════════════════════════════

[Paste everything below into a Claude Code terminal with Chrome extension]

---

## Context
- Project: [Project name from PROJECT.md]
- Location: [Full Windows path]
- Current Phase: [Phase number and name]
- What needs browser access: [Specific task]

## Primary Task
[Detailed description of what needs to be done]

## URLs to Visit
[List all URLs with purposes]

## Step-by-Step Checklist
[Numbered steps with expected outcomes]

## Verification Criteria
[What constitutes success]

## If Issues Found
[How to report back - what info to capture]

## After Completion
[What to update/report - files to modify if needed]

---
════════════════════════════════════════════════════════════════
```

</handoff_protocol>

<firebase_urls>

**Project Firebase URLs:**
- Console: https://console.firebase.google.com/u/0/project/grocery-store-app-c3aa5
- Firestore Data: https://console.firebase.google.com/u/0/project/grocery-store-app-c3aa5/firestore/databases/-default-/data
- Security Rules: https://console.firebase.google.com/u/0/project/grocery-store-app-c3aa5/firestore/databases/-default-/security/rules
- Authentication: https://console.firebase.google.com/u/0/project/grocery-store-app-c3aa5/authentication

</firebase_urls>

<common_handoffs>

## 1. Functionality Testing Handoff

```
You have access to the Claude Chrome extension for browser automation.

## Context
- Project: Our Kitchen (Food App)
- Location: C:\Users\Nick M\Desktop\Food App Idea\temp-vite
- Dev server: http://localhost:5173

## Task: Full Functionality Test

### Test Checklist
1. HOUSEHOLD: Create new household, verify entry to main app
2. NAVIGATION: Test all tabs (Home, Meals, Grocery, Baking)
3. [FEATURE]: Test specific CRUD operations
4. VISUAL: Check color scheme, typography, responsiveness

### Verification
- Screenshot each major screen
- Report any bugs with steps to reproduce
- Confirm data persists in Firebase

### After Testing
Update .planning/phases/[phase]/[plan]-SUMMARY.md with results
```

## 2. Firebase Security Rules Handoff

```
You have access to the Claude Chrome extension for browser automation.

## Context
- Project: Our Kitchen (Food App)
- Firebase Project: grocery-store-app-c3aa5

## Task: Fix Firebase Security Rules

### URL
https://console.firebase.google.com/u/0/project/grocery-store-app-c3aa5/firestore/databases/-default-/security/rules

### Steps
1. Navigate to security rules URL
2. Review current rules
3. [Specific fix needed]
4. Click "Publish" to deploy rules
5. Test by [verification method]

### Expected Rules Structure
[Include expected rules if known]
```

## 3. Firebase Data Inspection Handoff

```
You have access to the Claude Chrome extension for browser automation.

## Context
- Project: Our Kitchen (Food App)
- Firebase Project: grocery-store-app-c3aa5

## Task: Inspect/Fix Firestore Data

### URL
https://console.firebase.google.com/u/0/project/grocery-store-app-c3aa5/firestore/databases/-default-/data

### Steps
1. Navigate to Firestore data URL
2. Check collection: [collection name]
3. Verify document structure matches types in src/types/index.ts
4. [Specific data operations if needed]

### Report Back
- Document counts per collection
- Any malformed documents
- Missing required fields
```

</common_handoffs>

<integration_with_plans>

When creating plans with `checkpoint:human-verify` tasks, if the verification would benefit from browser automation, add a note:

```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>[Feature description]</what-built>
  <how-to-verify>[Manual steps]</how-to-verify>
  <browser-handoff>If Playwright unavailable, generate handoff prompt per browser-handoff.md</browser-handoff>
  <resume-signal>Type "approved" or paste test results</resume-signal>
</task>
```

</integration_with_plans>

<example_full_handoff>

When Playwright fails, generate this type of comprehensive prompt:

```
════════════════════════════════════════════════════════════════
BROWSER HANDOFF - Copy this to PowerShell Claude Code session
════════════════════════════════════════════════════════════════

You have access to the Claude Chrome extension for browser automation. Test the Food App comprehensively.

## Context
- Project: Our Kitchen (Food App)
- Location: C:\Users\Nick M\Desktop\Food App Idea\temp-vite
- Stack: React + TypeScript + Vite + Firebase
- Current Phase: Phase 5 - Weekly Planning
- Dev server should be running at: http://localhost:5173

## Primary Task
Test the new Weekly Planning feature end-to-end.

## URLs to Visit
1. http://localhost:5173 - Main app
2. https://console.firebase.google.com/u/0/project/grocery-store-app-c3aa5/firestore/databases/-default-/data - Verify data persistence

## Test Checklist

### Setup
1. Navigate to http://localhost:5173
2. Create household if needed (or use existing)

### Feature Testing
3. Go to Home tab (This Week's Meals)
4. Test adding meals to weekly plan
5. Test removing meals from weekly plan
6. Verify meal count updates

### Visual/Design Check
7. Color scheme: Warm terracotta (#C4785B) + cream (#FDF6F0)
8. Typography: Clean, readable
9. Responsive: Check mobile layout

### Firebase Verification
10. Go to Firebase console
11. Check weeklyPlans collection has correct data

## Verification Criteria
- All CRUD operations work
- Data persists to Firebase
- No console errors
- Visual design matches spec

## If Issues Found
Report:
- Screenshot of the issue
- Steps to reproduce
- Console errors (if any)
- Expected vs actual behavior

## After Completion
- Report test results summary
- Update .planning/phases/05-weekly-planning/05-XX-SUMMARY.md if applicable
- Note any bugs in .planning/ISSUES.md
════════════════════════════════════════════════════════════════
```

</example_full_handoff>
