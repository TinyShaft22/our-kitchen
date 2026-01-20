# Phase 25: Lambda Backend - Research

**Researched:** 2026-01-20
**Domain:** Alexa-Hosted Skills Lambda, REST API integration, persistent attributes, voice PIN linking
**Confidence:** HIGH

## Summary

This research covers the implementation of an Alexa-Hosted Skills Lambda backend that connects to Firebase via Cloud Functions REST API and handles voice PIN household linking. The Alexa-Hosted Skills environment provides free AWS Lambda, DynamoDB, and S3 access, making it the ideal choice for this project.

The key architecture involves: (1) Lambda handlers that receive voice requests, (2) HTTP calls to Firebase Cloud Functions for data operations, (3) DynamoDB persistent attributes for device-level household linking, and (4) session attributes for PIN attempt tracking. The PIN linking flow uses device ID as the partition key so each Echo device remembers its linked household independently.

For external API calls, the built-in `https` module or axios library wraps requests in Promises that work with async/await handlers. The ASK SDK v2 provides AttributesManager for session and persistent state management, plus interceptors for centralizing common logic like auto-saving attributes.

**Primary recommendation:** Use device ID-scoped persistent attributes for household linking, axios for REST calls to Cloud Functions, and request interceptors for loading linked household state on every request.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ask-sdk-core | ^2.14.0 | Alexa SDK for handlers | Official SDK, required |
| ask-sdk-dynamodb-persistence-adapter | ^2.9.0 | DynamoDB persistence | Official adapter for Alexa-Hosted |
| axios | ^1.6.0 | HTTP client | Promise-based, clean async/await |
| aws-sdk | 2.637.0 | AWS services | Required for DynamoDB persistence |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ask-sdk-model | ^1.39.0 | TypeScript types | Type safety (optional) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| axios | Node.js https module | Built-in, no dependency, but more verbose |
| DynamoDB | S3 persistence | S3 has eventual consistency; DynamoDB has read-after-write consistency |

**Installation (in lambda folder):**
```bash
npm install axios ask-sdk-dynamodb-persistence-adapter aws-sdk
```

## Architecture Patterns

### Recommended Project Structure
```
our-kitchen-alexa/
  lambda/
    index.js                 # Main handler with SkillBuilder
    handlers/
      LaunchHandler.js       # Session start, PIN check
      MealHandlers.js        # BrowseMeals, GetRecipe, StartCooking
      GroceryHandlers.js     # ReadGroceryList, AddGrocery, etc.
      CookingHandlers.js     # Next/Previous/Repeat step handlers
      HouseholdHandlers.js   # LinkHousehold, PIN verification
      BuiltInHandlers.js     # Help, Cancel, Stop, Fallback
    interceptors/
      RequestInterceptors.js # Load household state
      ResponseInterceptors.js # Save persistent attributes
    api/
      firebaseClient.js      # REST calls to Cloud Functions
    util/
      responseHelper.js      # Casual tone response builders
      slotHelper.js          # Entity resolution helpers
    package.json
```

### Pattern 1: Async Handler with External API Call
**What:** Handler that fetches data from Firebase via REST
**When to use:** All data-fetching intents (meals, recipes, grocery lists)
**Example:**
```javascript
// Source: https://developer.amazon.com/en-US/blogs/alexa/alexa-skills-kit/2019/05/alexa-skill-recipe-update-making-http-requests-to-get-data-from-an-external-api-using-the-ask-software-development-kit-for-node-js-version-2
const axios = require('axios');
const Alexa = require('ask-sdk-core');

const CLOUD_FUNCTIONS_BASE = 'https://us-central1-PROJECT_ID.cloudfunctions.net';

const BrowseMealsIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BrowseMealsIntent';
  },
  async handle(handlerInput) {
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    const householdCode = attributes.householdCode;

    if (!householdCode) {
      // Not linked - prompt for PIN
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes.pendingAction = 'BrowseMeals';
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak("I don't know which household to use yet. What's your four-digit PIN?")
        .reprompt("Say your four-digit PIN to link this device.")
        .getResponse();
    }

    try {
      const response = await axios.get(`${CLOUD_FUNCTIONS_BASE}/alexa/meals`, {
        params: { householdCode },
        timeout: 5000
      });

      const meals = response.data.meals;
      if (!meals || meals.length === 0) {
        return handlerInput.responseBuilder
          .speak("Your weekly plan is empty. Add meals in the app to get started.")
          .getResponse();
      }

      // Cap at 5 items per CONTEXT.md
      const mealNames = meals.slice(0, 5).map(m => m.name);
      const remaining = meals.length - 5;
      let speakOutput = `Your meals are: ${mealNames.join(', ')}`;
      if (remaining > 0) {
        speakOutput += `, and ${remaining} more`;
      }
      speakOutput += ". Which one do you want to know more about?";

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("Which meal would you like to see?")
        .getResponse();

    } catch (error) {
      console.log('API Error:', error.message);
      return handlerInput.responseBuilder
        .speak("I'm having trouble connecting to your kitchen right now. Try again in a moment.")
        .getResponse();
    }
  }
};
```

### Pattern 2: Device-Scoped Persistent Attributes for Linking
**What:** Store household link per device using device ID as partition key
**When to use:** Household linking that persists across sessions
**Example:**
```javascript
// Source: https://developer.amazon.com/en-US/docs/alexa/hosted-skills/alexa-hosted-skills-session-persistence.html
const AWS = require('aws-sdk');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

// Custom partition key generator for device-scoped persistence
function deviceIdPartitionKeyGenerator(requestEnvelope) {
  const deviceId = requestEnvelope.context.System.device.deviceId;
  if (!deviceId) {
    throw new Error('Cannot get device ID from request envelope');
  }
  return deviceId;
}

const dynamoDbPersistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
  createTable: false,
  partitionKeyGenerator: deviceIdPartitionKeyGenerator,
  dynamoDBClient: new AWS.DynamoDB({
    apiVersion: 'latest',
    region: process.env.DYNAMODB_PERSISTENCE_REGION
  })
});

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(/* handlers */)
  .withPersistenceAdapter(dynamoDbPersistenceAdapter)
  .lambda();
```

### Pattern 3: PIN Verification Flow
**What:** Multi-turn conversation for PIN verification with attempt tracking
**When to use:** Linking household via voice PIN
**Example:**
```javascript
// Source: Phase 25 CONTEXT.md decisions
const LinkHouseholdIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'LinkHouseholdIntent';
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const pinCode = slots.PinCode?.value;

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const attempts = sessionAttributes.pinAttempts || 0;

    if (!pinCode) {
      return handlerInput.responseBuilder
        .speak("What's your four-digit household PIN?")
        .reprompt("Say your four-digit PIN.")
        .getResponse();
    }

    try {
      // Verify PIN against Firebase
      const response = await axios.post(`${CLOUD_FUNCTIONS_BASE}/alexa/verifyPin`, {
        pin: pinCode
      }, { timeout: 5000 });

      if (response.data.valid) {
        // Store household code in persistent attributes (device-scoped)
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        persistentAttributes.householdCode = response.data.householdCode;
        persistentAttributes.linkedAt = new Date().toISOString();
        handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
        await handlerInput.attributesManager.savePersistentAttributes();

        // Clear session attempts
        sessionAttributes.pinAttempts = 0;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        // Resume pending action if exists
        const pendingAction = sessionAttributes.pendingAction;
        if (pendingAction) {
          sessionAttributes.pendingAction = null;
          handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
          return handlerInput.responseBuilder
            .speak("Got it! You're now linked. " + getPendingActionPrompt(pendingAction))
            .reprompt("What would you like to do?")
            .getResponse();
        }

        return handlerInput.responseBuilder
          .speak("Got it! You're now linked. What would you like to do?")
          .reprompt("Try asking what's for dinner.")
          .getResponse();
      } else {
        // Invalid PIN - track attempts
        const newAttempts = attempts + 1;
        sessionAttributes.pinAttempts = newAttempts;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        if (newAttempts >= 3) {
          sessionAttributes.pinAttempts = 0;
          handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
          return handlerInput.responseBuilder
            .speak("Hmm, that PIN didn't work. Check your PIN in the app and try again later.")
            .getResponse();
        }

        return handlerInput.responseBuilder
          .speak(`That PIN didn't match. You have ${3 - newAttempts} tries left. What's your PIN?`)
          .reprompt("Say your four-digit PIN.")
          .getResponse();
      }
    } catch (error) {
      console.log('PIN verification error:', error.message);
      return handlerInput.responseBuilder
        .speak("I'm having trouble verifying that PIN right now. Try again in a moment.")
        .reprompt("Say your four-digit PIN to try again.")
        .getResponse();
    }
  }
};
```

### Pattern 4: Request Interceptor for Loading State
**What:** Load household state on every request for use in handlers
**When to use:** Centralize state loading to avoid repetition
**Example:**
```javascript
// Source: https://developer.amazon.com/en-US/blogs/alexa/post/0e2015e1-8be3-4513-94cb-da000c2c9db0/what-s-new-with-request-and-response-interceptors-in-the-alexa-skills-kit-sdk-for-node-j
const LoadHouseholdInterceptor = {
  async process(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const persistentAttributes = await attributesManager.getPersistentAttributes() || {};

    // Make household code available in session attributes for easy access
    const sessionAttributes = attributesManager.getSessionAttributes() || {};
    sessionAttributes.householdCode = persistentAttributes.householdCode || null;
    sessionAttributes.isLinked = !!persistentAttributes.householdCode;
    attributesManager.setSessionAttributes(sessionAttributes);

    // Log for debugging
    console.log('Loaded household state:', {
      householdCode: persistentAttributes.householdCode,
      isLinked: !!persistentAttributes.householdCode
    });
  }
};

const SavePersistentAttributesInterceptor = {
  async process(handlerInput) {
    await handlerInput.attributesManager.savePersistentAttributes();
  }
};

// Register interceptors
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(/* handlers */)
  .addRequestInterceptors(LoadHouseholdInterceptor)
  .addResponseInterceptors(SavePersistentAttributesInterceptor)
  .withPersistenceAdapter(dynamoDbPersistenceAdapter)
  .lambda();
```

### Pattern 5: HTTP Client Helper
**What:** Centralized axios client with timeout and error handling
**When to use:** All Cloud Functions calls
**Example:**
```javascript
// api/firebaseClient.js
const axios = require('axios');

const CLOUD_FUNCTIONS_BASE = process.env.FIREBASE_API_BASE ||
  'https://us-central1-our-kitchen-prod.cloudfunctions.net';
const API_KEY = process.env.FIREBASE_API_KEY;
const DEFAULT_TIMEOUT = 5000; // 5 seconds

const client = axios.create({
  baseURL: CLOUD_FUNCTIONS_BASE,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  }
});

async function getMeals(householdCode) {
  const response = await client.get('/alexa/meals', {
    params: { householdCode }
  });
  return response.data;
}

async function getRecipe(householdCode, mealId) {
  const response = await client.get('/alexa/recipe', {
    params: { householdCode, mealId }
  });
  return response.data;
}

async function getGroceryList(householdCode) {
  const response = await client.get('/alexa/groceryList', {
    params: { householdCode }
  });
  return response.data;
}

async function addGroceryItem(householdCode, item, quantity) {
  const response = await client.post('/alexa/addGroceryItem', {
    householdCode,
    item,
    quantity
  });
  return response.data;
}

async function verifyPin(pin) {
  const response = await client.post('/alexa/verifyPin', { pin });
  return response.data;
}

module.exports = {
  getMeals,
  getRecipe,
  getGroceryList,
  addGroceryItem,
  verifyPin
};
```

### Anti-Patterns to Avoid
- **Callback-based HTTP:** Don't use callbacks with http.get; always wrap in Promises for async/await
- **Forgetting await:** All async operations must be awaited or Lambda exits prematurely
- **User ID for device linking:** Don't use user ID - it changes if user re-links their Amazon account
- **S3 persistence for linking:** Use DynamoDB for read-after-write consistency
- **Hardcoded API URLs:** Use environment variables for Cloud Functions URL
- **Missing timeout:** Always set HTTP timeout to prevent Lambda timeout waiting for response

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Device ID extraction | Manual path traversal | `Alexa.getDeviceId(requestEnvelope)` | Built-in utility handles null cases |
| User ID extraction | Manual path traversal | `Alexa.getUserId(requestEnvelope)` | Error handling included |
| Slot value extraction | Manual object traversal | `Alexa.getSlotValue(requestEnvelope, 'SlotName')` | Handles missing slots |
| Persistence management | Direct DynamoDB calls | AttributesManager | Caching, error handling built-in |
| XML escaping in SSML | Regex replacement | `Alexa.escapeXmlCharacters(text)` | Handles all edge cases |
| Dialog state checking | Request path traversal | `Alexa.getDialogState(requestEnvelope)` | Type-safe utilities |

**Key insight:** The ASK SDK provides utility functions for nearly all common operations. Using `Alexa.*` utilities reduces bugs and improves code readability.

## Common Pitfalls

### Pitfall 1: Lambda Timeout from Unawaited Promises
**What goes wrong:** Lambda returns before async operations complete
**Why it happens:** Missing `await` keyword or forgetting to return the promise
**How to avoid:**
- Mark all handlers with `async` keyword
- Use `await` on all async operations (HTTP calls, persistence)
- Always return `handlerInput.responseBuilder.getResponse()` at the end
**Warning signs:** "Task timed out" or empty response in simulator

### Pitfall 2: User ID vs Device ID for Linking
**What goes wrong:** Link breaks when user re-authenticates or uses different Amazon account
**Why it happens:** User ID changes when Amazon account changes on device
**How to avoid:** Use device ID (`Alexa.getDeviceId()`) for persistent linking
**Warning signs:** Users report "unlinked" unexpectedly

### Pitfall 3: HTTP Timeout Too Long
**What goes wrong:** Alexa says "There was a problem with the requested skill's response"
**Why it happens:** Alexa has ~8 second timeout; if HTTP call takes too long, Lambda times out
**How to avoid:**
- Set axios timeout to 5000ms (5 seconds)
- Handle timeout errors gracefully
- Consider caching strategies for slow data
**Warning signs:** Intermittent failures on slow network

### Pitfall 4: Not Handling Unlinked State
**What goes wrong:** Skill crashes or gives confusing response when household not linked
**Why it happens:** Code assumes householdCode always exists
**How to avoid:**
- Check for householdCode at start of every data handler
- Redirect to PIN prompt if not linked
- Store pending action in session to resume after linking
**Warning signs:** Errors about undefined householdCode

### Pitfall 5: Persistent Attributes Not Saving
**What goes wrong:** Household link doesn't persist across sessions
**Why it happens:** `savePersistentAttributes()` not called after `setPersistentAttributes()`
**How to avoid:**
- Always call `await attributesManager.savePersistentAttributes()`
- Use response interceptor to auto-save
**Warning signs:** Link works in session but forgets next time

### Pitfall 6: Missing Error Responses
**What goes wrong:** Skill says nothing or gives generic error
**Why it happens:** Catch block doesn't return a proper response
**How to avoid:**
- Every catch block must return a spoken response
- Use casual friendly tone per CONTEXT.md: "I'm having trouble connecting to your kitchen right now"
**Warning signs:** Awkward silence or "There was a problem"

## Code Examples

### Complete Skill Builder Configuration
```javascript
// index.js
// Source: https://developer.amazon.com/en-US/docs/alexa/hosted-skills/alexa-hosted-skills-session-persistence.html
const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

// Import handlers
const LaunchRequestHandler = require('./handlers/LaunchHandler');
const { BrowseMealsIntentHandler, GetRecipeIntentHandler } = require('./handlers/MealHandlers');
const { ReadGroceryListIntentHandler, AddGroceryIntentHandler } = require('./handlers/GroceryHandlers');
const LinkHouseholdIntentHandler = require('./handlers/HouseholdHandlers');
const { HelpIntentHandler, CancelAndStopIntentHandler, FallbackIntentHandler } = require('./handlers/BuiltInHandlers');
const SessionEndedRequestHandler = require('./handlers/SessionEndedHandler');
const ErrorHandler = require('./handlers/ErrorHandler');

// Import interceptors
const { LoadHouseholdInterceptor, LogRequestInterceptor } = require('./interceptors/RequestInterceptors');
const { SavePersistentAttributesInterceptor } = require('./interceptors/ResponseInterceptors');

// Device-scoped persistence adapter
function deviceIdPartitionKeyGenerator(requestEnvelope) {
  const deviceId = requestEnvelope.context?.System?.device?.deviceId;
  if (!deviceId) {
    throw new Error('Cannot get device ID');
  }
  return deviceId;
}

const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
  createTable: false,
  partitionKeyGenerator: deviceIdPartitionKeyGenerator,
  dynamoDBClient: new AWS.DynamoDB({
    apiVersion: 'latest',
    region: process.env.DYNAMODB_PERSISTENCE_REGION
  })
});

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    BrowseMealsIntentHandler,
    GetRecipeIntentHandler,
    ReadGroceryListIntentHandler,
    AddGroceryIntentHandler,
    LinkHouseholdIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .addRequestInterceptors(LogRequestInterceptor, LoadHouseholdInterceptor)
  .addResponseInterceptors(SavePersistentAttributesInterceptor)
  .withPersistenceAdapter(persistenceAdapter)
  .withCustomUserAgent('our-kitchen/v2.0')
  .lambda();
```

### Error Handler with Friendly Tone
```javascript
// handlers/ErrorHandler.js
// Source: Phase 25 CONTEXT.md - casual friendly tone
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error: ${error.message}`);
    console.log(`Stack: ${error.stack}`);

    let speakOutput = "Hmm, something went wrong. ";

    // Customize based on error type
    if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      speakOutput = "I'm having trouble connecting to your kitchen right now. Try again in a moment.";
    } else if (error.message.includes('householdCode')) {
      speakOutput = "I need to know which household to use. What's your four-digit PIN?";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("Say your four-digit PIN.")
        .getResponse();
    } else {
      speakOutput += "Please try again.";
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("What would you like to do?")
      .getResponse();
  }
};

module.exports = ErrorHandler;
```

### Session Attribute Helpers
```javascript
// util/sessionHelper.js
function isLinked(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  return sessionAttributes.isLinked === true;
}

function getHouseholdCode(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  return sessionAttributes.householdCode;
}

function setPendingAction(handlerInput, action, params = {}) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.pendingAction = action;
  sessionAttributes.pendingParams = params;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function getPendingAction(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  return {
    action: sessionAttributes.pendingAction,
    params: sessionAttributes.pendingParams || {}
  };
}

function clearPendingAction(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.pendingAction = null;
  sessionAttributes.pendingParams = null;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

module.exports = {
  isLinked,
  getHouseholdCode,
  setPendingAction,
  getPendingAction,
  clearPendingAction
};
```

## Cloud Functions Endpoints Required

Based on the Alexa skill needs, these REST endpoints are required in Firebase Cloud Functions:

| Endpoint | Method | Purpose | Request Params | Response |
|----------|--------|---------|----------------|----------|
| `/alexa/verifyPin` | POST | Verify voice PIN | `{ pin: string }` | `{ valid: boolean, householdCode?: string }` |
| `/alexa/meals` | GET | Get weekly meal plan | `householdCode` | `{ meals: [{ id, name, day }] }` |
| `/alexa/recipe` | GET | Get recipe details | `householdCode, mealId` | `{ name, ingredients, instructions }` |
| `/alexa/groceryList` | GET | Get grocery list | `householdCode` | `{ items: [{ name, category, checked }] }` |
| `/alexa/addGroceryItem` | POST | Add grocery item | `{ householdCode, item, quantity? }` | `{ success, itemId }` |
| `/alexa/removeGroceryItem` | POST | Remove grocery item | `{ householdCode, item }` | `{ success }` |
| `/alexa/checkOffGroceryItem` | POST | Mark item as purchased | `{ householdCode, item }` | `{ success }` |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| S3 persistence | DynamoDB persistence | 2022 | Read-after-write consistency |
| Callback HTTP | async/await HTTP | ASK SDK v2 (2018) | Cleaner code, no callback hell |
| User ID partition key | Device ID partition key | Best practice | Survives Amazon account changes |
| Manual state loading | Request interceptors | ASK SDK v2 | Centralized, DRY code |
| Single error handler | Typed error responses | 2024 requirements | 3% error threshold for certification |

**Deprecated/outdated:**
- `alexa-sdk` (v1): Use `ask-sdk-core` instead
- S3 persistence adapter for frequently-updated data: Use DynamoDB
- Callback-based HTTP calls: Use async/await with axios

## Open Questions

1. **PIN storage in Firebase**
   - What we know: Need endpoint to verify PIN and return householdCode
   - What's unclear: Whether PIN is stored on household document or separate collection
   - Recommendation: Store PIN hash on household document with `alexaPin` field

2. **Dynamic entities loading**
   - What we know: 100 entity limit, 30-minute persistence
   - What's unclear: Whether to load entities in LaunchRequest or first data request
   - Recommendation: Load in LaunchRequest after linking verified; re-load each session

3. **Re-linking behavior**
   - What we know: User can say new PIN to link to different household
   - What's unclear: Whether to confirm before overwriting existing link
   - Recommendation: Per CONTEXT.md "Claude's Discretion" - just overwrite silently

## Sources

### Primary (HIGH confidence)
- [Use DynamoDB for Data Persistence with Alexa-hosted Skill](https://developer.amazon.com/en-US/docs/alexa/hosted-skills/alexa-hosted-skills-session-persistence.html) - Persistence adapter setup
- [Managing Attributes (Node.js)](https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/manage-attributes.html) - AttributesManager API
- [Processing Requests](https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/handle-requests.html) - Handler and interceptor patterns
- [ASK SDK Utilities](https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/utilities.html) - Utility functions reference
- [Use Dynamic Entities](https://developer.amazon.com/en-US/docs/alexa/custom-skills/use-dynamic-entities-for-customized-interactions.html) - Dynamic entity limits and patterns

### Secondary (MEDIUM confidence)
- [Alexa Skill Recipe: Making HTTP Requests (ASK SDK v2)](https://developer.amazon.com/en-US/blogs/alexa/alexa-skills-kit/2019/05/alexa-skill-recipe-update-making-http-requests-to-get-data-from-an-external-api-using-the-ask-software-development-kit-for-node-js-version-2) - Async HTTP patterns
- [Request and Response Interceptors](https://developer.amazon.com/en-US/blogs/alexa/post/0e2015e1-8be3-4513-94cb-da000c2c9db0/what-s-new-with-request-and-response-interceptors-in-the-alexa-skills-kit-sdk-for-node-j) - Interceptor patterns
- [Best Practices for Text Responses](https://developer.amazon.com/en-US/docs/alexa/custom-skills/best-practice-text-response.html) - Response formatting

### Tertiary (LOW confidence)
- Various GitHub examples for device ID partition key generators
- Community examples of Firebase + Alexa integration

## Metadata

**Confidence breakdown:**
- Persistence adapter setup: HIGH - Official Amazon documentation with complete examples
- HTTP request patterns: HIGH - Official blog posts with async/await examples
- Device ID vs User ID linking: HIGH - Official SDK documentation
- Interceptor patterns: HIGH - Official documentation
- Cloud Functions endpoint design: MEDIUM - Based on existing app patterns, needs validation
- PIN verification flow: MEDIUM - Implementation pattern clear, storage location needs decision

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - ASK SDK is stable)
