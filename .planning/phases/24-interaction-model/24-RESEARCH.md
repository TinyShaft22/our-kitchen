# Phase 24: Interaction Model - Research

**Researched:** 2026-01-19
**Domain:** Alexa Skills Kit Interaction Model (intents, slots, utterances, dialog)
**Confidence:** HIGH

## Summary

This research covers the complete Alexa interaction model design for the "Kitchen Helper" skill, including intents for meal browsing, recipe viewing, cooking navigation, and grocery management. The Alexa interaction model consists of three core components: intents (user actions), slots (variable data within utterances), and sample utterances (phrases that trigger intents).

For meal names, the recommended approach is a **custom slot type with dynamic entities**. Static slot types cannot capture the user's personalized meal names, so dynamic entities should be loaded at session start from the household's meal database. This enables exact matching with entity resolution while supporting synonyms for common variations.

Dialog management enables multi-turn conversations for slot confirmation and clarification. However, per the user's decision (CONTEXT.md), cooking mode should "just start" without confirmation, while grocery additions should "confirm + undo." This means selective use of dialog confirmation - not all intents need it.

**Primary recommendation:** Use custom slot types with dynamic entities for meal names, AMAZON.SearchQuery for free-form grocery items, and selective dialog confirmation only where specified in CONTEXT.md decisions.

## Standard Stack

The established patterns for Alexa interaction models:

### Core Components
| Component | Purpose | When to Use |
|-----------|---------|-------------|
| Custom Intent | Define skill-specific actions | All skill functionality |
| Built-in Intent | Standard actions (help, stop, cancel) | Required for certification |
| Custom Slot Type | User-defined value lists | Meal names, categories, days |
| Built-in Slot Type | Amazon-provided value recognition | Numbers, dates, times, food items |
| Dialog Model | Multi-turn conversation flow | Slot collection, confirmation |
| Dynamic Entities | Runtime slot value injection | Personalized meal names |

### Built-in Slot Types for Kitchen Skill
| Slot Type | Captures | Use For |
|-----------|----------|---------|
| AMAZON.NUMBER | Spoken numbers as digits | Quantities ("add three eggs") |
| AMAZON.Food | Common food items | Grocery items (extend with custom values) |
| AMAZON.DATE | Date references | Meal planning dates |
| AMAZON.TIME | Time expressions | Meal times |
| AMAZON.DURATION | Duration phrases | Cooking times |
| AMAZON.SearchQuery | Free-form text | Fallback for unstructured input |

### Built-in Intents (Required)
| Intent | Purpose | Required Response |
|--------|---------|-------------------|
| AMAZON.HelpIntent | User asks for help | List available commands |
| AMAZON.CancelIntent | Cancel current action | Acknowledge, stay in skill or exit |
| AMAZON.StopIntent | Exit skill | Say goodbye, end session |
| AMAZON.FallbackIntent | Unrecognized utterance | Suggest valid commands |
| AMAZON.YesIntent | Affirmative response | Continue pending action |
| AMAZON.NoIntent | Negative response | Cancel pending action |
| AMAZON.RepeatIntent | Repeat last output | Re-speak last response |
| AMAZON.NextIntent | Move forward | Next item/step |
| AMAZON.PreviousIntent | Move backward | Previous item/step |

## Architecture Patterns

### Interaction Model JSON Structure
```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "kitchen helper",
      "intents": [
        {
          "name": "CustomIntentName",
          "slots": [
            {
              "name": "SlotName",
              "type": "SlotType"
            }
          ],
          "samples": [
            "sample utterance with {SlotName}",
            "another variation"
          ]
        }
      ],
      "types": [
        {
          "name": "CustomSlotType",
          "values": [
            {
              "id": "unique_id",
              "name": {
                "value": "canonical value",
                "synonyms": ["synonym1", "synonym2"]
              }
            }
          ]
        }
      ]
    },
    "dialog": {
      "intents": [],
      "delegationStrategy": "SKILL_RESPONSE"
    },
    "prompts": []
  }
}
```

### Pattern 1: Intent with Custom Slot + Entity Resolution
**What:** Custom slot type with synonyms for entity resolution
**When to use:** Meal names, recipe categories, day names
**Example:**
```json
{
  "name": "StartCookingIntent",
  "slots": [
    {
      "name": "MealName",
      "type": "MealNameType"
    }
  ],
  "samples": [
    "let's cook {MealName}",
    "let's make {MealName}",
    "how do I make {MealName}",
    "start cooking {MealName}",
    "cook {MealName}",
    "make {MealName}",
    "I want to make {MealName}"
  ]
}
```

Custom slot type with synonyms:
```json
{
  "name": "MealNameType",
  "values": [
    {
      "id": "crispy_chicken_tacos",
      "name": {
        "value": "Crispy Chicken Tacos",
        "synonyms": ["chicken tacos", "tacos", "crispy tacos"]
      }
    }
  ]
}
```

### Pattern 2: Dynamic Entities for Personalized Data
**What:** Load meal names at session start via directive
**When to use:** User-specific data like household meals
**Example:**
```javascript
// Source: https://developer.amazon.com/en-US/docs/alexa/custom-skills/use-dynamic-entities-for-customized-interactions.html
const dynamicEntitiesDirective = {
  type: 'Dialog.UpdateDynamicEntities',
  updateBehavior: 'REPLACE',
  types: [{
    name: 'MealNameType',
    values: [
      {
        id: 'meal_123',
        name: {
          value: 'Crispy Chicken Tacos',
          synonyms: ['chicken tacos', 'tacos']
        }
      },
      {
        id: 'meal_456',
        name: {
          value: 'Grandmas Chocolate Chip Cookies',
          synonyms: ['chocolate chip cookies', 'grandmas cookies', 'cookies']
        }
      }
    ]
  }]
};
```

**Constraints:**
- Maximum 100 total entities per session
- Entities persist for 30 minutes
- Re-inject at session start
- Clear on session end with `updateBehavior: "CLEAR"`

### Pattern 3: Browse Intent Without Slot
**What:** Intent that triggers list browsing
**When to use:** "What's for dinner?" - no slot needed
**Example:**
```json
{
  "name": "BrowseMealsIntent",
  "slots": [],
  "samples": [
    "what's for dinner",
    "what's for dinner this week",
    "show me this week's meals",
    "what meals are planned",
    "what are we eating this week",
    "what's on the menu"
  ]
}
```

### Pattern 4: Category Browsing with Slot
**What:** Browse meals by category/folder
**When to use:** "Show me cookies" - category filtering
**Example:**
```json
{
  "name": "BrowseCategoryIntent",
  "slots": [
    {
      "name": "Category",
      "type": "CategoryType"
    }
  ],
  "samples": [
    "show me {Category}",
    "what {Category} do we have",
    "list {Category} recipes",
    "find {Category}",
    "I want to see {Category}"
  ]
}
```

### Pattern 5: Dialog Confirmation for Groceries
**What:** Confirm action with undo option
**When to use:** Adding grocery items (per CONTEXT.md)
**Example:**
```json
{
  "dialog": {
    "intents": [
      {
        "name": "AddGroceryIntent",
        "confirmationRequired": false,
        "slots": [
          {
            "name": "GroceryItem",
            "type": "AMAZON.Food",
            "elicitationRequired": true,
            "confirmationRequired": false,
            "prompts": {
              "elicitation": "Elicit.GroceryItem"
            }
          }
        ]
      }
    ]
  },
  "prompts": [
    {
      "id": "Elicit.GroceryItem",
      "variations": [
        {
          "type": "PlainText",
          "value": "What do you want to add to the list?"
        }
      ]
    }
  ]
}
```

Note: Per CONTEXT.md, confirmation is via speech response ("Added milk. Say undo to remove.") rather than dialog confirmation prompt.

### Anti-Patterns to Avoid
- **Duplicate utterances across intents:** Each utterance must map to exactly one intent
- **Slot-only utterances without carrier phrase:** AMAZON.SearchQuery requires carrier phrases
- **Too few utterance variations:** Include 5-15+ variations per intent
- **Missing built-in intents:** Always include Help, Stop, Cancel, Fallback
- **Ignoring entity resolution status:** Always check ER_SUCCESS_MATCH vs ER_SUCCESS_NO_MATCH

## Don't Hand-Roll

Problems that have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Meal name matching | Fuzzy string matching | Entity resolution + synonyms | Built-in NLP is better |
| Number parsing | parseInt from speech | AMAZON.NUMBER slot type | Handles "five" -> 5 |
| Date parsing | Custom date parser | AMAZON.DATE slot type | Handles "tomorrow", "next Tuesday" |
| Free-form input | Custom NLP | AMAZON.SearchQuery | Captures unpredictable input |
| Yes/No handling | String matching | AMAZON.YesIntent/NoIntent | Handles variations |
| Personalized lists | Static slot types | Dynamic entities | Updates at runtime |
| Dialog flow | Manual state machine | Dialog model | Built-in delegation |

**Key insight:** Alexa's NLP handles natural language variation automatically. Define representative utterances and let the system generalize. Don't try to enumerate every possible phrasing.

## Common Pitfalls

### Pitfall 1: Utterance Collision
**What goes wrong:** Same utterance matches multiple intents
**Why it happens:** Overlapping phrases like "show me tacos" vs "cook tacos"
**How to avoid:** Use distinct carrier phrases per intent
**Warning signs:** Utterance Profiler shows wrong intent selected
**Example fix:**
```
BrowseCategoryIntent: "show me {Category}"
StartCookingIntent: "let's cook {MealName}", "start cooking {MealName}"
```

### Pitfall 2: ER_SUCCESS_NO_MATCH Not Handled
**What goes wrong:** Skill crashes or gives wrong response for unrecognized meals
**Why it happens:** Code assumes entity resolution always succeeds
**How to avoid:** Check resolution status code before using slot value
**Warning signs:** Errors when user says meal name not in database
**Example fix:**
```javascript
const resolution = slot.resolutions?.resolutionsPerAuthority?.[0];
if (resolution?.status?.code === 'ER_SUCCESS_MATCH') {
  const mealId = resolution.values[0].value.id;
  // Use mealId
} else {
  // Handle no match - confirm or suggest
}
```

### Pitfall 3: AMAZON.SearchQuery Restrictions
**What goes wrong:** Build fails or unexpected behavior
**Why it happens:** SearchQuery has special rules
**How to avoid:**
- Only ONE SearchQuery slot per intent
- Cannot combine with other slots in same utterance
- Must have carrier phrase (not slot-only)
**Warning signs:** Build error about slot restrictions

### Pitfall 4: Dynamic Entity Limits
**What goes wrong:** Not all meals loaded, or previous session data persists
**Why it happens:** 100 entity limit, 30-minute persistence
**How to avoid:**
- Load most relevant meals (e.g., this week's planned meals)
- Clear entities on session end
- Re-inject at each session start
**Warning signs:** User mentions meal but Alexa doesn't recognize it

### Pitfall 5: Missing Reprompt
**What goes wrong:** Alexa says nothing when user doesn't respond
**Why it happens:** Forgot to add reprompt to response
**How to avoid:** Always include reprompt when expecting response
**Warning signs:** Awkward silence after Alexa prompt

### Pitfall 6: Built-in Intent Override
**What goes wrong:** "Next" triggers wrong behavior
**Why it happens:** Built-in intents have preset utterances
**How to avoid:** Don't add custom samples that conflict with built-ins
**Warning signs:** User says built-in phrase, wrong intent fires

## Code Examples

### Complete Meal Browsing Intent
```json
// Source: Alexa Interaction Model Schema documentation
{
  "name": "BrowseMealsIntent",
  "slots": [],
  "samples": [
    "what's for dinner",
    "what's for dinner this week",
    "show me this week's meals",
    "what meals are planned",
    "what are we eating this week",
    "what's on the menu",
    "show me the meal plan",
    "what's planned for this week"
  ]
}
```

### Cooking Intent with Meal Slot
```json
// Source: Alexa Custom Skills documentation
{
  "name": "StartCookingIntent",
  "slots": [
    {
      "name": "MealName",
      "type": "MealNameType"
    }
  ],
  "samples": [
    "let's cook {MealName}",
    "let's make {MealName}",
    "how do I make {MealName}",
    "start cooking {MealName}",
    "cook {MealName}",
    "make {MealName}",
    "I want to make {MealName}",
    "can you help me cook {MealName}",
    "walk me through {MealName}",
    "tell me how to make {MealName}"
  ]
}
```

### Grocery List Intents
```json
// Add grocery item
{
  "name": "AddGroceryIntent",
  "slots": [
    {
      "name": "GroceryItem",
      "type": "AMAZON.Food"
    },
    {
      "name": "Quantity",
      "type": "AMAZON.NUMBER"
    }
  ],
  "samples": [
    "add {GroceryItem} to the list",
    "add {GroceryItem}",
    "put {GroceryItem} on the list",
    "we need {GroceryItem}",
    "add {Quantity} {GroceryItem}",
    "we need {Quantity} {GroceryItem}",
    "I need {GroceryItem}"
  ]
}

// Read grocery list
{
  "name": "ReadGroceryListIntent",
  "slots": [],
  "samples": [
    "what do we need to buy",
    "what's on the list",
    "read the grocery list",
    "what's on the grocery list",
    "what do we need",
    "show me the grocery list"
  ]
}
```

### Navigation Intents for Cooking Mode
```json
// Next step
{
  "name": "AMAZON.NextIntent",
  "samples": []  // Uses built-in utterances: "next", "skip"
}

// Previous step
{
  "name": "AMAZON.PreviousIntent",
  "samples": []  // Uses built-in utterances: "go back", "previous"
}

// Repeat step
{
  "name": "AMAZON.RepeatIntent",
  "samples": []  // Uses built-in utterances: "repeat", "say that again"
}
```

### Entity Resolution Handling
```javascript
// Source: https://developer.amazon.com/en-US/docs/alexa/custom-skills/entity-resolution-for-custom-slot-types.html
function getMealFromSlot(slot) {
  // Check if we got a value at all
  if (!slot || !slot.value) {
    return { found: false, value: null, id: null };
  }

  // Check entity resolution
  const resolution = slot.resolutions?.resolutionsPerAuthority?.[0];

  if (resolution?.status?.code === 'ER_SUCCESS_MATCH') {
    // Exact match found
    const match = resolution.values[0].value;
    return {
      found: true,
      value: match.name,  // Canonical name
      id: match.id,       // Database ID
      spoken: slot.value  // What user actually said
    };
  }

  // No exact match - return what user said for partial matching
  return {
    found: false,
    value: null,
    id: null,
    spoken: slot.value  // What user said
  };
}
```

### Dialog Model for Slot Elicitation
```json
// Source: https://developer.amazon.com/en-US/docs/alexa/custom-skills/define-the-dialog-to-collect-and-confirm-required-information.html
{
  "dialog": {
    "intents": [
      {
        "name": "StartCookingIntent",
        "delegationStrategy": "SKILL_RESPONSE",
        "confirmationRequired": false,
        "slots": [
          {
            "name": "MealName",
            "type": "MealNameType",
            "elicitationRequired": true,
            "confirmationRequired": false,
            "prompts": {
              "elicitation": "Elicit.MealName"
            }
          }
        ]
      }
    ]
  },
  "prompts": [
    {
      "id": "Elicit.MealName",
      "variations": [
        {
          "type": "PlainText",
          "value": "What would you like to cook?"
        },
        {
          "type": "PlainText",
          "value": "Which recipe should we make?"
        }
      ]
    }
  ]
}
```

## Recommended Intent Structure

Based on CONTEXT.md decisions, here are the recommended intents:

### Meal & Recipe Intents
| Intent | Purpose | Has Slots | Confirmation |
|--------|---------|-----------|--------------|
| BrowseMealsIntent | "What's for dinner?" | No | No |
| BrowseCategoryIntent | "Show me cookies" | Category | No |
| GetRecipeIntent | Get recipe details | MealName | No |
| StartCookingIntent | Enter cooking mode | MealName | No (just start) |

### Cooking Mode Intents
| Intent | Purpose | Type |
|--------|---------|------|
| AMAZON.NextIntent | Next step | Built-in |
| AMAZON.PreviousIntent | Previous step | Built-in |
| AMAZON.RepeatIntent | Repeat current step | Built-in |
| AMAZON.StopIntent | Exit cooking mode | Built-in |

### Grocery Intents
| Intent | Purpose | Has Slots | Confirmation |
|--------|---------|-----------|--------------|
| ReadGroceryListIntent | Read list aloud | No | No |
| AddGroceryIntent | Add item | GroceryItem, Quantity | Via response ("Added X. Say undo to remove.") |
| UndoGroceryIntent | Undo last add | No | No |
| RemoveGroceryIntent | Remove item | GroceryItem | No |
| CheckOffGroceryIntent | Mark as purchased | GroceryItem | No |

### Household/Linking Intents
| Intent | Purpose | Has Slots |
|--------|---------|-----------|
| LinkHouseholdIntent | Connect to household | PinCode |

### Standard Built-ins (Required)
| Intent | Custom Response |
|--------|-----------------|
| AMAZON.HelpIntent | "Try saying 'what's for dinner' or 'start cooking tacos'" |
| AMAZON.CancelIntent | "Okay, cancelled." |
| AMAZON.StopIntent | "See you later!" |
| AMAZON.FallbackIntent | "I didn't catch that. Try saying 'what's for dinner' or 'start cooking tacos'." |
| AMAZON.YesIntent | Context-dependent |
| AMAZON.NoIntent | Context-dependent |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AMAZON.LITERAL | Custom slot types | Deprecated 2018 | Use custom slots with synonyms |
| Static slot values | Dynamic entities | 2018 | Personalized slot values |
| Manual dialog | Dialog model delegation | 2016 | Built-in slot collection |
| Single utterance testing | Utterance Profiler | 2017 | Test before deployment |

**Deprecated/outdated:**
- AMAZON.LITERAL: Completely removed, use custom slot types
- Intent schema + sample utterances files: Replaced by single interaction model JSON
- ASK SDK v1 intents: Use v2 canHandle/handle pattern

## Open Questions

1. **Dynamic entity count for meals**
   - What we know: 100 entity limit per session
   - What's unclear: How many meals typical household has
   - Recommendation: Load only this week's planned meals + recently viewed. If household has >100 meals, prioritize.

2. **Partial meal name matching strategy**
   - What we know: Entity resolution returns ER_SUCCESS_NO_MATCH for non-exact matches
   - What's unclear: Best UX for partial matches
   - Recommendation: Per CONTEXT.md, confirm first ("Did you mean Crispy Chicken Tacos?"). Implement in handler, not interaction model.

3. **Category/folder structure for browsing**
   - What we know: Can create custom slot type for categories
   - What's unclear: What categories exist in the app
   - Recommendation: Create CategoryType slot based on actual app folder structure. Need to verify with web app data model.

## Sources

### Primary (HIGH confidence)
- [Interaction Model Schema](https://developer.amazon.com/en-US/docs/alexa/smapi/interaction-model-schema.html) - Complete JSON structure
- [Create Intents, Utterances, and Slots](https://developer.amazon.com/en-US/docs/alexa/custom-skills/create-intents-utterances-and-slots.html) - Intent/slot creation guide
- [Slot Type Reference](https://developer.amazon.com/en-US/docs/alexa/custom-skills/slot-type-reference.html) - Built-in slot types
- [Entity Resolution for Custom Slot Types](https://developer.amazon.com/en-US/docs/alexa/custom-skills/entity-resolution-for-custom-slot-types.html) - Synonym matching
- [Use Dynamic Entities](https://developer.amazon.com/en-US/docs/alexa/custom-skills/use-dynamic-entities-for-customized-interactions.html) - Runtime slot values
- [Define Dialog Model](https://developer.amazon.com/en-US/docs/alexa/custom-skills/define-the-dialog-to-collect-and-confirm-required-information.html) - Multi-turn conversations
- [Standard Built-in Intents](https://developer.amazon.com/en-US/docs/alexa/custom-skills/standard-built-in-intents.html) - Required intents

### Secondary (MEDIUM confidence)
- [Best Practices for Sample Utterances](https://developer.amazon.com/en-US/docs/alexa/custom-skills/best-practices-for-sample-utterances-and-custom-slot-type-values.html) - Utterance guidelines
- [Design Sample Utterances and Intents](https://developer.amazon.com/en-US/docs/alexa/interaction-model-design/design-the-sample-utterances-and-intents-for-your-skill.html) - Design guide
- [Dialog Interface Reference](https://developer.amazon.com/en-US/docs/alexa/custom-skills/dialog-interface-reference.html) - Dialog directives

### Tertiary (LOW confidence)
- WebSearch results for recipe skill examples - limited current examples found

## Metadata

**Confidence breakdown:**
- Interaction model schema: HIGH - Official Amazon documentation
- Slot types (built-in): HIGH - Official reference
- Entity resolution: HIGH - Official documentation
- Dynamic entities: HIGH - Official documentation with examples
- Dialog model: HIGH - Official documentation
- Utterance best practices: MEDIUM - Guidelines exist but specific counts vary
- Recipe skill patterns: MEDIUM - Limited official examples for this domain

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - Alexa ASK is stable)
