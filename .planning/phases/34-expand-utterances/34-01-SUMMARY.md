---
phase: 34-expand-utterances
plan: 01
subsystem: alexa
tags: [utterances, nfi, voice-commands, alexa-skills]

dependency_graph:
  requires: [24-02]
  provides: [expanded-utterances, nfi-training-data]
  affects: [35, 36, 37, 38]

tech_stack:
  added: []
  patterns: [voice-utterance-patterns, nfi-optimization]

file_tracking:
  created: []
  modified:
    - our-kitchen-alexa/skill-package/interactionModels/custom/en-US.json

decisions: []

metrics:
  duration: 2 minutes
  completed: 2026-01-22
---

# Phase 34 Plan 01: Expand Utterances Summary

Expanded all 10 custom intents from 61 to 139 sample utterances for Name-Free Interaction (NFI) training.

## What Was Built

### Meal & Recipe Intents (Task 1)

| Intent | Before | After | New Patterns |
|--------|--------|-------|--------------|
| BrowseMealsIntent | 8 | 14 | "dinner plans", "tonight", "what are we having" |
| BrowseCategoryIntent | 7 | 12 | "I'm looking for", "give me options", "let's see" |
| GetRecipeIntent | 7 | 12 | "pull up", "what goes into", "give me the recipe" |
| StartCookingIntent | 9 | 14 | "step by step", "help me cook", "walk me through making" |

### Grocery & Household Intents (Task 2)

| Intent | Before | After | New Patterns |
|--------|--------|-------|--------------|
| ReadGroceryListIntent | 12 | 17 | "what's left", "read back", "what haven't we bought" |
| AddGroceryIntent | 9 | 19 | "we're out of", "don't forget", "remember to get", "to my shopping list" |
| UndoGroceryIntent | 6 | 13 | "scratch that", "wait no", "oops undo", "that was wrong" |
| RemoveGroceryIntent | 5 | 12 | "scratch off", "cross off", "forget", "never mind" |
| CheckOffGroceryIntent | 6 | 13 | "grabbed", "found", "done", "got the" |
| LinkHouseholdIntent | 7 | 13 | "the code is", "pin is", "set up household" |

## Utterance Design Principles Applied

1. **Conversational tone** - Contractions (what's, we're, let's, I'm), casual phrasing
2. **"To the list" patterns** - Priority for AddGroceryIntent to compete with Amazon's built-in shopping list
3. **Past tense for CheckOff** - "grabbed", "found", "got" for completed actions
4. **Short reflexive undo** - "scratch that", "oops", "wait no"
5. **Varied slot positions** - Slots at beginning, middle, and end of utterances

## Verification

All success criteria met:
- [x] Valid JSON (no syntax errors)
- [x] All 10 custom intents have 10+ samples
- [x] Natural conversational phrasing included
- [x] Mix of tones (casual, direct, polite)
- [x] Grocery commands emphasize "to the list" patterns

## Technical Details

**File modified:** `our-kitchen-alexa/skill-package/interactionModels/custom/en-US.json`

**Total utterances:** 61 -> 139 (+128%)

## Commits

| Task | Hash | Description |
|------|------|-------------|
| 1 | d9c833f | Expand meal and recipe intent utterances |
| 2 | 53f0bf3 | Expand grocery and household intent utterances |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Ready for Phase 35 (Mark As Low Feature) and Phase 36 (CanFulfillIntentRequest). The expanded utterances provide training data for NFI routing.
