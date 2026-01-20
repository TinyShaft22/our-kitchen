# Phase 23: Alexa Setup - Research

**Researched:** 2026-01-19
**Domain:** Alexa Skills Kit, ASK CLI, Alexa-Hosted Skills
**Confidence:** HIGH

## Summary

This research covers the complete setup workflow for creating an Alexa-Hosted Skill for the "Our Kitchen" app. Alexa-Hosted Skills provide free hosting via AWS Lambda, S3, DynamoDB, and CodeCommit without requiring an AWS account, making it the ideal choice per project constraints.

The development workflow involves: (1) creating an Amazon Developer account, (2) installing ASK CLI in WSL with `--no-browser` configuration for authentication, (3) creating a new Alexa-Hosted Skill via `ask new`, and (4) using git-based deployment where `git push` triggers Lambda deployment.

**Primary recommendation:** Use `ask configure --no-browser` from WSL for authentication, create the skill via Developer Console (simpler than CLI for Alexa-Hosted), then clone locally with `ask init --hosted-skill-id` for code editing in WSL.

## Invocation Name Concern

**IMPORTANT:** The planned invocation name "our kitchen" may face certification challenges. Amazon's two-word invocation name rules prohibit articles and prepositions. While "our" is technically a possessive pronoun (not explicitly listed), Amazon's documentation is ambiguous about possessive determiners.

**Alternatives to consider:**
| Option | Status | Notes |
|--------|--------|-------|
| "our kitchen" | UNCERTAIN | May work; test during development |
| "kitchen helper" | SAFE | Two-word, no prohibited words |
| "meal planner" | SAFE | Descriptive, two-word |
| "family kitchen" | SAFE | Two-word, no prohibited words |

**Recommendation:** Start with "our kitchen" during development (can be changed before certification). If rejected during certification, fall back to "kitchen helper".

## Standard Stack

The established tools for Alexa Skill development:

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| ASK CLI | 2.x | Skill management CLI | Official Amazon tool |
| ask-sdk-core | ^2.14.0 | Node.js SDK for handlers | Official SDK, required |
| ask-sdk-model | ^1.39.0 | TypeScript type definitions | Type safety |
| Node.js | 16.x | Lambda runtime | Only version for Alexa-Hosted |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| i18next | ^23.x | Internationalization | Multi-language support |
| ask-sdk-s3-persistence-adapter | ^2.x | Session persistence | When needing state across sessions |
| ask-sdk-dynamodb-persistence-adapter | ^2.x | Database persistence | When storing user data |

**Installation (for local development):**
```bash
# Install ASK CLI globally
npm install -g ask-cli

# In lambda folder
npm install ask-sdk-core ask-sdk-model
```

## Architecture Patterns

### Alexa-Hosted Skill Project Structure
```
our-kitchen-alexa/
├── .ask/
│   └── ask-states.json          # Deployment state (auto-managed)
├── lambda/
│   ├── index.js                  # Main handler entry point
│   ├── package.json              # Dependencies
│   ├── handlers/                 # Intent handlers (optional organization)
│   │   ├── LaunchRequestHandler.js
│   │   └── HelloWorldIntentHandler.js
│   └── util.js                   # Helper functions
├── skill-package/
│   ├── skill.json                # Skill manifest
│   ├── interactionModels/
│   │   └── custom/
│   │       └── en-US.json        # Voice interaction model
│   └── assets/
│       ├── en-US_largeIcon.png   # 512x512
│       └── en-US_smallIcon.png   # 108x108
└── ask-resources.json            # ASK CLI configuration
```

### Pattern 1: Request Handler Pattern (ASK SDK v2)
**What:** Each handler has `canHandle()` for routing and `handle()` for response
**When to use:** All intent handling - this is THE pattern for Alexa skills

```javascript
// Source: https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/handle-requests.html
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Welcome to Our Kitchen! You can ask me about meals, recipes, or your grocery list. What would you like to do?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Hello from Our Kitchen!';
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};
```

### Pattern 2: Skill Builder Export
**What:** Lambda entry point that registers all handlers
**When to use:** Always - this is the main export

```javascript
// Source: https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html
const Alexa = require('ask-sdk-core');

// Import handlers
const LaunchRequestHandler = require('./handlers/LaunchRequestHandler');
const HelloWorldIntentHandler = require('./handlers/HelloWorldIntentHandler');
const HelpIntentHandler = require('./handlers/HelpIntentHandler');
const CancelAndStopIntentHandler = require('./handlers/CancelAndStopIntentHandler');
const SessionEndedRequestHandler = require('./handlers/SessionEndedRequestHandler');
const ErrorHandler = require('./handlers/ErrorHandler');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
```

### Pattern 3: Built-in Intent Handlers
**What:** Required handlers for Amazon built-in intents
**When to use:** Always include these for certification

```javascript
// Source: Official ASK SDK documentation
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can ask me to show meals, read a recipe, or check your grocery list. How can I help?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    // Cleanup logic here
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
```

### Anti-Patterns to Avoid
- **Single monolithic handler:** Don't put all logic in one handler; split by intent
- **Missing error handler:** Always include ErrorHandler for graceful failures
- **Missing built-in intents:** Skills without AMAZON.HelpIntent, AMAZON.CancelIntent, AMAZON.StopIntent will fail certification
- **Forgetting reprompt:** Always include `.reprompt()` when expecting user response

## Don't Hand-Roll

Problems that have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request routing | Custom dispatcher | ASK SDK canHandle/handle | SDK handles complex routing logic |
| Response building | JSON construction | responseBuilder API | Type-safe, handles all edge cases |
| Session state | Custom storage | Session attributes | Built into handlerInput |
| Persistence | Custom DB code | ask-sdk-dynamodb-persistence-adapter | Alexa-Hosted provides DynamoDB free |
| SSML generation | String concatenation | speak() method with SSML tags | SDK validates SSML |

**Key insight:** The ASK SDK handles ALL the complexity of Alexa communication. Focus only on business logic (what to say, what data to fetch).

## Common Pitfalls

### Pitfall 1: Browser Authentication from WSL
**What goes wrong:** `ask configure` tries to open browser, fails in WSL
**Why it happens:** WSL doesn't have direct browser access
**How to avoid:** Use `ask configure --no-browser`, copy URL to Windows browser, paste auth code back
**Warning signs:** "Could not open browser" error

### Pitfall 2: Alexa-Hosted vs Self-Hosted Confusion
**What goes wrong:** Following tutorials for self-hosted skills when using Alexa-Hosted
**Why it happens:** Many tutorials assume AWS Lambda self-hosting
**How to avoid:** Use git-based deployment (`git push`), NOT `ask deploy` for Alexa-Hosted
**Warning signs:** Errors about CloudFormation, missing AWS credentials

### Pitfall 3: Wrong Branch for Deployment
**What goes wrong:** Changes don't appear after push
**Why it happens:** Alexa-Hosted uses branch mapping: dev -> console, master -> development stage, prod -> live
**How to avoid:** Work on `dev` branch, push to deploy to development stage
**Warning signs:** Code in console doesn't match local code

### Pitfall 4: Missing Required Intents
**What goes wrong:** Skill fails certification
**Why it happens:** Amazon requires certain built-in intents
**How to avoid:** Always include: AMAZON.HelpIntent, AMAZON.CancelIntent, AMAZON.StopIntent, AMAZON.FallbackIntent
**Warning signs:** Certification rejection emails

### Pitfall 5: Node.js Version Mismatch
**What goes wrong:** Code works locally but fails in Lambda
**Why it happens:** Local Node.js version differs from Lambda runtime
**How to avoid:** Alexa-Hosted uses Node.js 16.x - match locally with nvm
**Warning signs:** Syntax errors in Lambda logs for modern JS features

## Code Examples

### Complete Hello World index.js
```javascript
// Source: https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Welcome to Our Kitchen! Ask me about meals or say help for options.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('What would you like to do?')
      .getResponse();
  }
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Hello from Our Kitchen!';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can say hello to me! How can I help?';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Sorry, I don\'t know about that. Try asking for help.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt('What would you like to do?')
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
    const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
```

### Interaction Model (en-US.json)
```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "our kitchen",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "AMAZON.FallbackIntent",
          "samples": []
        },
        {
          "name": "HelloWorldIntent",
          "slots": [],
          "samples": [
            "hello",
            "hi",
            "say hello",
            "say hi"
          ]
        }
      ],
      "types": []
    }
  }
}
```

### skill.json Manifest
```json
{
  "manifest": {
    "publishingInformation": {
      "locales": {
        "en-US": {
          "summary": "Meal planning and grocery management for your household",
          "examplePhrases": [
            "Alexa, open our kitchen",
            "Alexa, ask our kitchen what's for dinner",
            "Alexa, ask our kitchen to read the grocery list"
          ],
          "name": "Our Kitchen",
          "description": "Our Kitchen helps you manage meals, recipes, and grocery lists using voice commands."
        }
      },
      "isAvailableWorldwide": false,
      "testingInstructions": "Sample testing instructions.",
      "category": "FOOD_AND_DRINK",
      "distributionCountries": [
        "US"
      ]
    },
    "apis": {
      "custom": {
        "endpoint": {
          "sourceDir": "lambda",
          "uri": "arn:aws:lambda:us-east-1:XXXXXXXXXXXX:function:XXXXX"
        }
      }
    },
    "manifestVersion": "1.0",
    "privacyAndCompliance": {
      "allowsPurchases": false,
      "locales": {
        "en-US": {
          "privacyPolicyUrl": "",
          "termsOfUseUrl": ""
        }
      },
      "containsAds": false,
      "isExportCompliant": true,
      "isChildDirected": false,
      "usesPersonalInfo": false
    }
  }
}
```

## WSL Development Workflow

### Initial Setup (One-time)
```bash
# 1. Install ASK CLI in WSL
npm install -g ask-cli

# 2. Configure with no-browser mode (WSL workaround)
ask configure --no-browser
# Opens URL - copy to Windows browser
# Sign in to Amazon Developer account
# Copy authorization code back to terminal

# 3. Verify configuration
ask util whoami
```

### Creating New Alexa-Hosted Skill
**Recommended:** Create via Developer Console, then clone locally

```bash
# After creating skill in console, get the skill ID from the URL
# URL format: https://developer.amazon.com/alexa/console/ask/build/custom/amzn1.ask.skill.XXXXX/development/en_US/dashboard

# Clone to local for development
ask init --hosted-skill-id amzn1.ask.skill.XXXXX
```

### Git-Based Deployment (Alexa-Hosted)
```bash
# Make code changes in lambda/ folder
# Edit interaction model in skill-package/interactionModels/custom/en-US.json

# Stage and commit
git add .
git commit -m "Add hello world intent"

# Deploy to development stage (push triggers Lambda update)
git push origin master

# Check deployment status in Developer Console
# Test with Alexa Simulator or echo device
```

### Branch Structure
| Branch | Maps To | When Updated |
|--------|---------|--------------|
| `dev` | Web console editor | git push dev |
| `master` | Development stage | git push master |
| `prod` | Live stage | Promote from console |

## Alexa-Hosted Skills Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| AWS Lambda | Unlimited requests | Free for Alexa skills |
| Amazon S3 | 25 GB storage, 250 GB/month transfer | Media assets |
| Amazon DynamoDB | 25 GB, 10M reads/writes per month | Session persistence |
| AWS CodeCommit | 50 GB, 10K git requests/month | Source control |
| Skills per account | 75 maximum | Per developer account |

**Enforcement:** 30-day grace period if limits exceeded, then must migrate to personal AWS.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ASK SDK v1 | ASK SDK v2 | 2018 | Complete rewrite, new handler pattern |
| ask deploy | git push (Alexa-Hosted) | 2019 | Simpler deployment for hosted skills |
| Node.js 8.x | Node.js 16.x | 2022 | Modern JS features available |
| Lambda-based | Alexa-Hosted | 2019 | Free tier, no AWS account needed |

**Deprecated/outdated:**
- ASK SDK v1: Don't use, completely different architecture
- alexa-sdk npm package: Old v1 SDK, use ask-sdk-core instead
- Node.js 8.x/10.x/12.x/14.x: No longer supported, use 16.x

## Open Questions

1. **Invocation name "our kitchen"**
   - What we know: Two-word names can't use articles or prepositions
   - What's unclear: Whether "our" (possessive pronoun) is allowed
   - Recommendation: Use "our kitchen" during development, have "kitchen helper" as backup

2. **Node.js 18/20 support for Alexa-Hosted**
   - What we know: Node.js 16.x is documented as current
   - What's unclear: Whether newer versions are available in 2026
   - Recommendation: Start with 16.x, upgrade if available during creation

## Sources

### Primary (HIGH confidence)
- [ASK CLI GitHub - Alexa-Hosted Skill Commands](https://github.com/alexa/ask-cli/blob/develop/docs/concepts/Alexa-Hosted-Skill-Commands.md) - Git deployment workflow
- [Amazon Developer Docs - Alexa-Hosted Skills](https://developer.amazon.com/en-US/docs/alexa/hosted-skills/build-a-skill-end-to-end-using-an-alexa-hosted-skill.html) - Runtime options, hosting regions
- [Amazon Developer Docs - Usage Limits](https://developer.amazon.com/en-US/docs/alexa/hosted-skills/usage-limits.html) - Resource quotas
- [Amazon Developer Docs - Handle Requests](https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/handle-requests.html) - Handler pattern
- [Amazon Developer Docs - Interaction Model Schema](https://developer.amazon.com/en-US/docs/alexa/smapi/interaction-model-schema.html) - JSON format
- [Amazon Developer Docs - Invocation Name Requirements](https://developer.amazon.com/en-US/docs/alexa/custom-skills/choose-the-invocation-name-for-a-custom-skill.html) - Naming rules

### Secondary (MEDIUM confidence)
- [ASK CLI NPM](https://www.npmjs.com/package/ask-cli) - Version info
- [ASK CLI GitHub - Project Definition](https://github.com/alexa/ask-cli/blob/develop/docs/concepts/Alexa-Skill-Project-Definition.md) - Project structure
- [xavidop/alexa-nodejs-lambda-helloworld-v2](https://github.com/xavidop/alexa-nodejs-lambda-helloworld-v2) - Example project structure

### Tertiary (LOW confidence)
- WebSearch results for Node.js runtime versions - may be outdated

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Amazon documentation
- Architecture: HIGH - Official SDK patterns
- Deployment workflow: HIGH - Official ASK CLI docs
- Invocation name rules: MEDIUM - Rules clear but "our" specifically unclear
- Pitfalls: MEDIUM - Based on documented patterns and WSL experience

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - Alexa SDK is stable)
