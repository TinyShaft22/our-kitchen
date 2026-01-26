# Phase 36: CanFulfillIntentRequest - Research

**Researched:** 2026-01-26
**Domain:** Alexa Name-Free Interaction (NFI) / CanFulfillIntentRequest
**Confidence:** HIGH

## Summary

CanFulfillIntentRequest (CFIR) is Alexa's mechanism for querying skills to determine if they can handle a user's request before routing it. When a user speaks to Alexa without invoking a specific skill name (Name-Free Interaction), Alexa queries multiple skills simultaneously and selects the best match based on CFIR responses. The handler must evaluate intent and slot capability without performing any actual actions or state changes.

Implementation requires three components: a manifest update to declare CFIR support, a Lambda handler that evaluates intents/slots and returns capability signals, and testing via ASK CLI or Developer Console (device testing is not supported for CFIR).

**Primary recommendation:** Implement a single CanFulfillIntentRequestHandler that returns YES for our core custom intents (BrowseMeals, GetRecipe, AddGrocery, ReadGroceryList, BrowseCategory, MarkAsLow, StartCooking) and NO for all other intents including built-ins. Keep the handler fast (no Firebase calls) and stateless.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ask-sdk-core | 2.x | Request handling and response building | Official Alexa SDK with `withCanFulfillIntent()` method |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ASK CLI | 2.x | Testing CFIR via `ask api invoke-skill` | Cannot test CFIR on devices |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual JSON responses | `withCanFulfillIntent()` | SDK method is cleaner, handles structure |
| Device testing | ASK CLI / Developer Console | CFIR only testable via simulation |

**No additional installation needed** - existing ask-sdk-core already has CFIR support.

## Architecture Patterns

### Recommended Handler Location
```
our-kitchen-alexa/lambda/
├── index.js                    # Register CanFulfillIntentRequestHandler
└── handlers/
    └── CanFulfillHandler.js    # New file - CFIR handler
```

### Pattern 1: Intent-Based Response Strategy
**What:** Return YES/NO based on intent name matching, without slot evaluation
**When to use:** When slot validation would require backend calls that slow response time
**Example:**
```javascript
// Source: Amazon Developer Documentation + Our Kitchen context
const CanFulfillIntentRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'CanFulfillIntentRequest';
  },

  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);

    // Core intents we can definitely fulfill
    const supportedIntents = [
      'BrowseMealsIntent',
      'GetRecipeIntent',
      'BrowseCategoryIntent',
      'ReadGroceryListIntent',
      'AddGroceryIntent',
      'MarkAsLowIntent',
      'StartCookingIntent'
    ];

    const canFulfill = supportedIntents.includes(intentName) ? 'YES' : 'NO';

    return handlerInput.responseBuilder
      .withCanFulfillIntent({ canFulfill })
      .getResponse();
  }
};
```

### Pattern 2: Full Slot Evaluation (Alternative)
**What:** Evaluate both intent and slot values for more precise matching
**When to use:** When you can validate slots quickly without backend calls
**Example:**
```javascript
// Source: Amazon Developer Documentation
handle(handlerInput) {
  const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
  const slots = handlerInput.requestEnvelope.request.intent.slots || {};

  // Build slot responses
  const slotResponses = {};
  for (const [slotName, slot] of Object.entries(slots)) {
    slotResponses[slotName] = {
      canUnderstand: slot.value ? 'YES' : 'MAYBE',
      canFulfill: 'YES'  // Backend will handle matching
    };
  }

  return handlerInput.responseBuilder
    .withCanFulfillIntent({
      canFulfill: supportedIntents.includes(intentName) ? 'YES' : 'NO',
      slots: slotResponses
    })
    .getResponse();
}
```

### Anti-Patterns to Avoid
- **Making Firebase calls in CFIR:** CFIR should respond in under 2 seconds; Firebase adds latency
- **Modifying state:** CFIR must not change any state - it's a query, not an action
- **Playing audio or providing feedback:** CFIR must not produce observable effects
- **Returning YES without actually supporting the intent:** Leads to poor user experience

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Response structure | Manual JSON | `withCanFulfillIntent()` | SDK handles structure correctly |
| Request type detection | String comparison | `Alexa.getRequestType()` | SDK helper is more robust |
| Intent name extraction | Manual parsing | `Alexa.getIntentName()` | Handles edge cases |

**Key insight:** The ASK SDK already provides all the tools needed for CFIR - just use the built-in methods.

## Common Pitfalls

### Pitfall 1: Not Implementing for All Intents
**What goes wrong:** Skill fails certification or NFI routing is inconsistent
**Why it happens:** Documentation states CFIR should cover all intents in interaction model
**How to avoid:** Handler should have a default response (NO) for unrecognized intents
**Warning signs:** Errors in ASK CLI testing for unexpected intents

### Pitfall 2: CFIR Handler Too Slow
**What goes wrong:** Skill times out during NFI routing; Alexa picks another skill
**Why it happens:** Making database calls or complex computations during CFIR
**How to avoid:** Keep CFIR handler synchronous with hardcoded intent list; no async operations unless absolutely necessary
**Warning signs:** Response time > 2 seconds

### Pitfall 3: Modifying State During CFIR
**What goes wrong:** Skill certification rejection; inconsistent behavior
**Why it happens:** Treating CFIR like a normal IntentRequest
**How to avoid:** CFIR handler should be read-only; only return the response, never call Firebase
**Warning signs:** Side effects observed during simulation testing

### Pitfall 4: Forgetting Manifest Update
**What goes wrong:** CFIR requests never reach the skill
**Why it happens:** skill.json not updated with CAN_FULFILL_INTENT_REQUEST interface
**How to avoid:** Add interface declaration before deploying handler
**Warning signs:** Handler never triggered in testing

### Pitfall 5: Returning YES for Built-in Intents
**What goes wrong:** Skill gets routed requests it shouldn't handle
**Why it happens:** Misunderstanding which intents are "ours"
**How to avoid:** Only return YES for custom intents; return NO for AMAZON.* intents
**Warning signs:** Skill receives HelpIntent, StopIntent via NFI

## Code Examples

### Complete Handler Implementation
```javascript
// Source: Amazon Developer Documentation + Our Kitchen patterns
// File: our-kitchen-alexa/lambda/handlers/CanFulfillHandler.js

const Alexa = require('ask-sdk-core');

/**
 * CanFulfillIntentRequestHandler
 *
 * Handles Alexa's "can you fulfill this?" queries for Name-Free Interaction.
 * Returns YES for our supported custom intents, NO for everything else.
 *
 * CRITICAL: This handler must NOT:
 * - Make any external API calls (Firebase, etc.)
 * - Modify any state (session, persistent, etc.)
 * - Produce any observable effects (audio, visuals, etc.)
 */
const CanFulfillIntentRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'CanFulfillIntentRequest';
  },

  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};

    console.log(`CFIR received for intent: ${intentName}`);

    // Our custom intents that we can fulfill
    const supportedIntents = [
      'BrowseMealsIntent',      // "what's for dinner"
      'GetRecipeIntent',        // "show me the recipe for X"
      'BrowseCategoryIntent',   // "show me desserts"
      'ReadGroceryListIntent',  // "what's on the grocery list"
      'AddGroceryIntent',       // "add milk to the list"
      'MarkAsLowIntent',        // "we're low on flour"
      'StartCookingIntent',     // "let's cook tacos"
      'RemoveGroceryIntent',    // "remove milk from the list"
      'CheckOffGroceryIntent'   // "check off milk"
    ];

    // Determine if we can fulfill this intent
    const canFulfill = supportedIntents.includes(intentName) ? 'YES' : 'NO';

    // Build slot responses if we can fulfill
    let response = { canFulfill };

    if (canFulfill === 'YES' && Object.keys(slots).length > 0) {
      response.slots = {};
      for (const [slotName, slot] of Object.entries(slots)) {
        // For AMAZON.Food and custom slot types, we can understand
        // but actual fulfillment depends on backend (which we don't query here)
        response.slots[slotName] = {
          canUnderstand: slot.value ? 'YES' : 'MAYBE',
          canFulfill: 'YES'  // Our backend handles flexible matching
        };
      }
    }

    console.log(`CFIR response: ${JSON.stringify(response)}`);

    return handlerInput.responseBuilder
      .withCanFulfillIntent(response)
      .getResponse();
  }
};

module.exports = { CanFulfillIntentRequestHandler };
```

### Manifest Update (skill.json)
```json
{
  "manifest": {
    "apis": {
      "custom": {
        "interfaces": [
          {
            "type": "ALEXA_PRESENTATION_APL",
            "supportedViewports": [...]
          },
          {
            "type": "CAN_FULFILL_INTENT_REQUEST"
          }
        ]
      }
    }
  }
}
```

### Registration in index.js
```javascript
// Add to imports
const { CanFulfillIntentRequestHandler } = require('./handlers/CanFulfillHandler');

// Add to handler chain - should be near the top
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        CanFulfillIntentRequestHandler,  // Add first - catches CFIR before other handlers
        LaunchRequestHandler,
        // ... rest of handlers
    )
```

### Test Request JSON (for ASK CLI / Developer Console)
```json
{
  "version": "1.0",
  "session": {},
  "context": {
    "System": {
      "application": {
        "applicationId": "amzn1.ask.skill.xxx"
      }
    }
  },
  "request": {
    "type": "CanFulfillIntentRequest",
    "requestId": "test-request-id",
    "intent": {
      "name": "AddGroceryIntent",
      "slots": {
        "GroceryItem": {
          "name": "GroceryItem",
          "value": "milk"
        }
      }
    },
    "locale": "en-US"
  }
}
```

### Testing Commands
```bash
# Test CFIR via ASK CLI
ask api invoke-skill \
  --skill-id amzn1.ask.skill.[skill-id] \
  --file ./test-cfir-request.json \
  --endpoint-region NA

# Alternative: Use Developer Console
# 1. Go to Test tab
# 2. Click "Manual JSON"
# 3. Paste test request JSON
# 4. Review response
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No NFI support | CFIR for skill routing | 2018 (public beta) | Skills can be discovered without invocation names |
| Manual JSON responses | `withCanFulfillIntent()` SDK method | ASK SDK v2.3.0 | Cleaner implementation |

**Current status:**
- CFIR is PUBLIC BETA for en-US locale only
- Other English locales (en-GB, en-IN, en-AU, en-CA) are in PRIVATE BETA
- NFI traffic routing takes up to 8 weeks after skill publication
- Only works for PUBLISHED skills (not beta/development)

## Response Value Guide

### Intent-Level canFulfill Values

| Value | When to Use | Our Kitchen Usage |
|-------|-------------|-------------------|
| YES | Skill can definitely fulfill this intent | BrowseMealsIntent, AddGroceryIntent, etc. |
| NO | Skill cannot handle this intent | Built-in intents, unrecognized intents |
| MAYBE | Could fulfill with more info (multi-turn) | Not recommended - we require household linking |

### Slot-Level Values

| Property | Value | When to Use |
|----------|-------|-------------|
| canUnderstand | YES | Slot value recognized (entity resolution success or freeform accepted) |
| canUnderstand | MAYBE | Partial match or fuzzy resolution |
| canUnderstand | NO | Cannot recognize slot value |
| canFulfill | YES | Can perform action for this slot value |
| canFulfill | NO | Cannot perform action (e.g., resource unavailable) |

### Recommended Strategy for Our Kitchen

**Simple approach (recommended):**
- Return `{ canFulfill: 'YES' }` for supported custom intents
- Return `{ canFulfill: 'NO' }` for everything else
- Skip slot-level evaluation (our backend handles fuzzy matching anyway)

**Rationale:** Our skill uses fuzzy matching in Firebase (contains search), so even if Alexa sends "cookies" we'll find "Chocolate Chip Cookies". The backend is the source of truth, not the CFIR handler.

## Testing Checklist

Before deployment:
- [ ] Handler responds to CanFulfillIntentRequest type
- [ ] Returns YES for each supported custom intent
- [ ] Returns NO for AMAZON.* built-in intents
- [ ] Returns NO for unknown/unexpected intents
- [ ] No Firebase or external API calls in handler
- [ ] No state modifications
- [ ] Response time < 2 seconds
- [ ] Manifest includes CAN_FULFILL_INTENT_REQUEST interface

Test scenarios (via ASK CLI):
- [ ] Request with no userId
- [ ] Request with no session
- [ ] Each supported intent (BrowseMeals, GetRecipe, AddGrocery, etc.)
- [ ] Each supported intent with slots
- [ ] Unsupported intent
- [ ] Built-in intent (AMAZON.HelpIntent)

## Open Questions

Things that couldn't be fully resolved:

1. **2-Second Timeout Claim**
   - What we know: Standard Alexa timeout is 8 seconds; CFIR documentation mentions keeping response fast
   - What's unclear: Exact timeout for CFIR specifically (some sources claim 2 seconds)
   - Recommendation: Design for < 1 second response time to be safe

2. **Household Linking Impact**
   - What we know: Our skill requires household PIN linking to function
   - What's unclear: Whether CFIR should return MAYBE for unlinked devices
   - Recommendation: Return YES regardless of linking status - let the actual IntentRequest handle the "please link" flow

3. **NFI Traffic Timing**
   - What we know: Takes up to 8 weeks after publication for NFI to start routing
   - What's unclear: Whether there's any way to expedite or test in production
   - Recommendation: Implement CFIR now, accept delayed NFI benefits

## Sources

### Primary (HIGH confidence)
- [Amazon Developer Documentation - Implement CFIR](https://developer.amazon.com/en-US/docs/alexa/custom-skills/implement-canfulfillintentrequest-for-name-free-interaction.html) - Complete implementation guide
- [Amazon Developer Documentation - Request Types Reference](https://developer.amazon.com/en-US/docs/alexa/custom-skills/request-types-reference.html) - Request/response format
- [Amazon Developer Documentation - Understand NFI](https://developer.amazon.com/en-US/docs/alexa/custom-skills/understand-name-free-interaction-for-custom-skills.html) - NFI concepts

### Secondary (MEDIUM confidence)
- [ASK SDK for Node.js - Building Responses](https://developer.amazon.com/docs/alexa-skills-kit-sdk-for-nodejs/build-responses.html) - withCanFulfillIntent method
- [Talking to Computers - CFIR Tutorial](https://www.talkingtocomputers.com/canfulfillintent-alexa-node) - Code examples verified against official docs

### Tertiary (LOW confidence)
- [Amazon Alexa Blog - CFIR Beta Announcement](https://developer.amazon.com/en-US/blogs/alexa/post/352e9834-0a98-4868-8d94-c2746b794ce9/improve-alexa-skill-discovery-and-name-free-use-of-your-skill-with-canfulfillintentrequest-bet) - Historical context

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official ASK SDK documentation confirms approach
- Architecture: HIGH - Pattern matches official examples and existing skill structure
- Response values: HIGH - Official documentation is explicit about YES/NO/MAYBE semantics
- Testing: HIGH - ASK CLI commands verified in documentation
- Performance requirements: MEDIUM - 2-second timeout mentioned but not explicitly documented

**Research date:** 2026-01-26
**Valid until:** 90 days (CFIR is stable, unlikely to change significantly)
