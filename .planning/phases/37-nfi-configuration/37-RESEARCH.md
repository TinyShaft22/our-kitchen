# Phase 37: NFI Configuration - Research

**Researched:** 2026-01-29
**Domain:** Alexa Name-Free Interaction (NFI) Toolkit
**Confidence:** HIGH

## Summary

Name-Free Interaction (NFI) allows Alexa to route user utterances to a skill without the user saying the skill's invocation name. Configuration is done by adding a `_nameFreeInteraction` container to the interaction model JSON, which contains "ingress points" -- either LAUNCH type (skill-level phrases) or INTENT type (intent-level phrases). Each supports up to 5 sample utterances that must be slot-free, complete phrases.

NFI can be configured via the Developer Console UI, the JSON editor, ASK CLI, or SMAPI. The CLI approach is preferred since this project already uses ASK CLI for deployments. The key constraint is that the skill must be previously published as a live skill with good engagement history before NFI becomes available.

**Primary recommendation:** Add the `_nameFreeInteraction` container to the interaction model JSON file, configure skill launch phrases and intent launch phrases, build via ASK CLI, and test with NFI isolated simulation before publishing.

## Standard Stack

No additional libraries needed. NFI is a configuration-only change to the interaction model JSON.

### Core
| Tool | Purpose | Why Standard |
|------|---------|--------------|
| ASK CLI | Deploy interaction model with NFI container | Already in use, supports NFI natively |
| Interaction Model JSON | Add `_nameFreeInteraction` container | Standard configuration approach |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| Developer Console | Visual NFI configuration | Alternative to JSON editing, good for verification |
| SMAPI | Programmatic NFI management | Check eligibility, get build status |

## Architecture Patterns

### JSON Structure for NFI

The `_nameFreeInteraction` container sits parallel to `languageModel` in the interaction model:

```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "kitchen helper",
      "intents": [...]
    },
    "_nameFreeInteraction": {
      "ingressPoints": [
        {
          "type": "LAUNCH",
          "sampleUtterances": [
            {"format": "RAW_TEXT", "value": "what should I cook tonight"},
            {"format": "RAW_TEXT", "value": "help me plan dinner"},
            {"format": "RAW_TEXT", "value": "I need cooking help"},
            {"format": "RAW_TEXT", "value": "what's for dinner"},
            {"format": "RAW_TEXT", "value": "plan my meals"}
          ]
        },
        {
          "type": "INTENT",
          "name": "BrowseMealsIntent",
          "sampleUtterances": [
            {"format": "RAW_TEXT", "value": "show me dinner ideas"},
            {"format": "RAW_TEXT", "value": "what meals can I make"},
            {"format": "RAW_TEXT", "value": "give me recipe suggestions"}
          ]
        }
      ]
    }
  }
}
```

### Ingress Point Types

**LAUNCH (skill-level):**
- `type`: `"LAUNCH"` (no `name` field)
- Up to 5 sample utterances
- Opens the skill at its default entry point (LaunchRequest)

**INTENT (intent-level):**
- `type`: `"INTENT"` with `name` matching an existing intent
- Up to 5 sample utterances per intent
- Launches directly into that intent handler

### Which Intents to Include as NFI Entry Points

Good NFI intents (standalone, no prior context needed):
- BrowseMealsIntent -- "show me dinner ideas"
- GetRecipeIntent -- "how do I make pasta" (but slots not allowed in NFI phrases, so use general versions)
- BrowseCategoryIntent -- "show me chicken recipes"
- ReadGroceryListIntent -- "read my grocery list"
- AddGroceryIntent -- "add milk to my grocery list" (general version without slot)
- StartCookingIntent -- "start cooking"

Skip for NFI (context-dependent):
- CheckOffGroceryIntent -- requires knowing what's on the list
- UndoGroceryIntent -- requires prior action
- RemoveGroceryIntent -- requires knowing what's on the list
- MarkAsLowIntent -- requires knowing current inventory state

### Anti-Patterns to Avoid
- **Slot-containing phrases:** NFI utterances MUST NOT contain slots. Use general versions like "add something to my grocery list" not "add {item} to my grocery list"
- **In-skill utterances as NFI phrases:** One-word or contextual utterances that only make sense inside the skill should not be NFI phrases
- **Leading to other experiences:** NFI sessions should complete the task and end, not upsell other features

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| NFI configuration | Custom API calls | Interaction model JSON + ASK CLI | Standard tooling handles it |
| Eligibility check | Manual guessing | SMAPI/Console eligibility check | Amazon determines eligibility |
| NFI testing | Production testing | `ask dialog --simulation-type NFI_ISOLATED_SIMULATION` | Isolated simulation available |

## Common Pitfalls

### Pitfall 1: Skill Not Eligible
**What goes wrong:** NFI tabs don't appear or configuration is rejected
**Why it happens:** Skill must be previously published as live with good engagement metrics
**How to avoid:** Verify eligibility in Developer Console or via SMAPI before investing time in phrase crafting
**Warning signs:** NFI tabs greyed out or missing in console

### Pitfall 2: Slots in NFI Phrases
**What goes wrong:** Build fails or phrases rejected
**Why it happens:** NFI sample utterances do not support slot references
**How to avoid:** Write complete, general phrases without any slot placeholders
**Warning signs:** Build errors mentioning slots in NFI container

### Pitfall 3: Expecting Immediate Results
**What goes wrong:** NFI routing doesn't work after publishing
**Why it happens:** Live NFI models only train after publication, takes up to 8 weeks
**How to avoid:** Set expectations that NFI is a long-term investment, not immediate
**Warning signs:** N/A -- this is expected behavior

### Pitfall 4: Duplicate Phrases Across Skills
**What goes wrong:** Alexa routes to competitor skills instead
**Why it happens:** Generic phrases compete with many skills
**How to avoid:** Use distinctive but natural phrases; mix specific ("plan my weekly meals") with general ("what's for dinner")
**Warning signs:** Low NFI routing rates after training period

### Pitfall 5: NFI Sessions That Don't Complete
**What goes wrong:** Poor user experience, lower engagement scores
**Why it happens:** Skill tries to keep session open or upsell after NFI entry
**How to avoid:** NFI intent handlers should complete the task and end the session cleanly
**Warning signs:** High drop-off rates from NFI-routed sessions

## Code Examples

### Complete NFI Container (for this skill)

```json
"_nameFreeInteraction": {
  "ingressPoints": [
    {
      "type": "LAUNCH",
      "sampleUtterances": [
        {"format": "RAW_TEXT", "value": "what should I cook tonight"},
        {"format": "RAW_TEXT", "value": "help me plan dinner"},
        {"format": "RAW_TEXT", "value": "I need a recipe"},
        {"format": "RAW_TEXT", "value": "what's for dinner"},
        {"format": "RAW_TEXT", "value": "plan my meals"}
      ]
    },
    {
      "type": "INTENT",
      "name": "BrowseMealsIntent",
      "sampleUtterances": [
        {"format": "RAW_TEXT", "value": "show me dinner ideas"},
        {"format": "RAW_TEXT", "value": "what meals can I make"},
        {"format": "RAW_TEXT", "value": "suggest something for dinner"}
      ]
    },
    {
      "type": "INTENT",
      "name": "ReadGroceryListIntent",
      "sampleUtterances": [
        {"format": "RAW_TEXT", "value": "read my grocery list"},
        {"format": "RAW_TEXT", "value": "what's on my shopping list"},
        {"format": "RAW_TEXT", "value": "check my grocery list"}
      ]
    },
    {
      "type": "INTENT",
      "name": "StartCookingIntent",
      "sampleUtterances": [
        {"format": "RAW_TEXT", "value": "start cooking"},
        {"format": "RAW_TEXT", "value": "guide me through a recipe"},
        {"format": "RAW_TEXT", "value": "walk me through cooking"}
      ]
    }
  ]
}
```

### CLI Commands for NFI

```bash
# Test NFI in isolation (before publishing)
ask dialog --skill-id <skill-id> --locale en-US --stage development --simulation-type NFI_ISOLATED_SIMULATION

# Deploy updated interaction model
ask deploy

# Check build status (includes NFI)
ask smapi get-skill-status --skill-id <skill-id>
```

## State of the Art

| Aspect | Current State | Impact |
|--------|--------------|--------|
| NFI Toolkit | Preview/GA for en-* locales | Available for this skill |
| CFIR + NFI | CFIR recommended but optional | Already implemented in Phase 36 |
| Training time | Up to 8 weeks after publication | Long feedback loop |
| CLI support | Full support via ASK CLI and SMAPI | Can automate in deployment |

## Open Questions

1. **Eligibility status**
   - What we know: Skill must be published with good engagement
   - What's unclear: Whether this skill currently qualifies (depends on publication history and metrics)
   - Recommendation: Check eligibility in console/SMAPI as first task

2. **Store listing metadata**
   - What we know: Category selection (Lifestyle) and description affect NFI routing
   - What's unclear: Exact metadata fields required beyond what's already configured
   - Recommendation: Review and update skill metadata during NFI configuration

## Sources

### Primary (HIGH confidence)
- [NFI Developer Console Guide](https://developer.amazon.com/en-US/docs/alexa/custom-skills/using-nfi-toolkit-developer-console.html) - Console configuration steps, JSON structure
- [NFI CLI Guide](https://developer.amazon.com/en-GB/docs/alexa/custom-skills/using-nfi-toolkit-cli.html) - CLI commands, JSON structure, testing
- [Understanding NFI](https://developer.amazon.com/en-US/docs/alexa/custom-skills/understand-name-free-interaction-for-custom-skills.html) - Concepts, eligibility, best practices

### Secondary (MEDIUM confidence)
- [Amazon Blog: NFI Signals](https://developer.amazon.com/en-US/blogs/alexa/alexa-skills-kit/2020/07/add-new-signals-to-your-skill-that-alexa-can-consider-for-name-free-requests) - Background and context
- [NFI Forum Article](https://amazon.developer.forums.answerhub.com/articles/235607/alexa-skills-building-name-free-interaction-nfi-to.html) - Community walkthrough

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Amazon documentation confirms JSON structure and CLI support
- Architecture: HIGH - JSON structure verified from multiple official sources
- Pitfalls: HIGH - Documented constraints from official docs (no slots, eligibility, training time)

**Research date:** 2026-01-29
**Valid until:** 2026-03-01 (stable feature, unlikely to change significantly)
