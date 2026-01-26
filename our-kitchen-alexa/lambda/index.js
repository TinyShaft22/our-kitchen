/**
 * Our Kitchen - Alexa Skill Handler
 *
 * This skill helps manage meals, recipes, and grocery lists using voice commands.
 * Built with ASK SDK v2 for Node.js.
 */
const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

// Import interceptors
const { LogRequestInterceptor, LoadHouseholdInterceptor } = require('./interceptors/RequestInterceptors');
const { SavePersistentAttributesInterceptor } = require('./interceptors/ResponseInterceptors');

// Import handlers
const { LinkHouseholdIntentHandler } = require('./handlers/HouseholdHandlers');
const { BrowseMealsIntentHandler, GetRecipeIntentHandler, BrowseCategoryIntentHandler } = require('./handlers/MealHandlers');
const {
  StartCookingIntentHandler,
  NextStepIntentHandler,
  PreviousStepIntentHandler,
  RepeatStepIntentHandler,
  ResumeCookingIntentHandler,
  ExitCookingIntentHandler
} = require('./handlers/CookingHandlers');
const {
  ReadGroceryListIntentHandler,
  AddGroceryIntentHandler,
  ConfirmDuplicateIntentHandler,
  UndoGroceryIntentHandler,
  RemoveGroceryIntentHandler,
  CheckOffGroceryIntentHandler
} = require('./handlers/GroceryHandlers');
const {
  MarkAsLowIntentHandler,
  MarkAsLowDisambiguationHandler,
  ConfirmAddFromLowHandler
} = require('./handlers/MarkAsLowHandlers');
const {
  MealSelectedEventHandler,
  StartCookingEventHandler,
  StepChangedEventHandler,
  ExitCookingModeEventHandler
} = require('./handlers/AplEventHandlers');
const { CanFulfillIntentRequestHandler } = require('./handlers/CanFulfillHandler');

/**
 * Device ID partition key generator
 * Uses device ID instead of user ID for persistence
 * Device ID is stable across Amazon account changes
 */
function deviceIdPartitionKeyGenerator(requestEnvelope) {
  const deviceId = requestEnvelope.context?.System?.device?.deviceId;
  if (!deviceId) {
    throw new Error('Cannot get device ID from request envelope');
  }
  return deviceId;
}

/**
 * Clear cooking progress from persistent attributes
 * Called when user completes a recipe or explicitly exits cooking mode
 */
async function clearCookingProgress(handlerInput) {
  try {
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes() || {};
    if (persistentAttributes.cookingProgress) {
      delete persistentAttributes.cookingProgress;
      handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
      await handlerInput.attributesManager.savePersistentAttributes();
      console.log('Cleared cooking progress');
    }
  } catch (error) {
    console.error('Failed to clear cooking progress:', error.message);
  }
}

// Export for use in CookingHandlers
module.exports.clearCookingProgress = clearCookingProgress;

/**
 * DynamoDB Persistence Adapter
 * Alexa-Hosted Skills provide table name and region via environment variables
 */
const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
  createTable: false,
  partitionKeyGenerator: deviceIdPartitionKeyGenerator,
  dynamoDBClient: new AWS.DynamoDB({
    apiVersion: 'latest',
    region: process.env.DYNAMODB_PERSISTENCE_REGION
  })
});

/**
 * LaunchRequestHandler
 * Triggered when user says "Alexa, open our kitchen"
 * Guides new users through PIN linking, welcomes back linked users
 * Offers to resume cooking if progress exists (within 24 hours)
 */
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const isLinked = sessionAttributes.isLinked;

        if (isLinked) {
            // Check for in-progress cooking to resume
            try {
                const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes() || {};
                const cookingProgress = persistentAttributes.cookingProgress;

                // Check if we have valid cooking progress (not expired - 24 hour limit)
                const twentyFourHours = 24 * 60 * 60 * 1000;
                if (cookingProgress &&
                    cookingProgress.recipeId &&
                    cookingProgress.timestamp &&
                    (Date.now() - cookingProgress.timestamp) < twentyFourHours) {

                    // Store resume info in session for ResumeCookingIntentHandler
                    sessionAttributes.pendingCookingResume = cookingProgress;
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                    const stepDisplay = cookingProgress.currentStep === 0
                        ? "the ingredients"
                        : `step ${cookingProgress.currentStep}`;

                    const speakOutput = `Welcome back! You were making ${cookingProgress.recipeName}, ` +
                        `on ${stepDisplay} of ${cookingProgress.totalSteps}. ` +
                        `Say 'continue cooking' to pick up where you left off, or 'start over' to restart.`;
                    const repromptOutput = "Say 'continue cooking' or 'start over'.";

                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(repromptOutput)
                        .getResponse();
                }
            } catch (error) {
                console.error('Error checking cooking progress:', error.message);
            }

            // No cooking progress - normal linked user welcome
            const speakOutput = "Welcome back to your kitchen! What would you like to do?";
            const repromptOutput = "Try asking what's for dinner, or what's on the grocery list.";

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(repromptOutput)
                .getResponse();
        } else {
            // New user - explain and prompt for PIN
            const speakOutput = "Welcome to Kitchen Helper! To get started, I need to connect to your household. What's your four-digit PIN from the app?";
            const repromptOutput = "Say your four-digit household PIN to link this device.";

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(repromptOutput)
                .getResponse();
        }
    }
};

/**
 * HelloWorldIntentHandler
 * Triggered when user says "hello", "hi", "say hello", etc.
 */
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

/**
 * HelpIntentHandler
 * Triggered when user says "help"
 * Provides context-aware help based on linking status
 */
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const isLinked = sessionAttributes.isLinked;

        let speakOutput;
        if (isLinked) {
            speakOutput = "You can ask me what's for dinner, show a recipe, or check your grocery list. What would you like to do?";
        } else {
            speakOutput = "To use Kitchen Helper, you need to link your device with your household PIN. Say your four-digit PIN to get started.";
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * CancelAndStopIntentHandler
 * Triggered when user says "cancel" or "stop"
 */
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

/**
 * FallbackIntentHandler
 * Triggered when user says something that doesn't match any intents
 */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = "Sorry, I don't know about that. Try asking for help.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to do?')
            .getResponse();
    }
};

/**
 * SessionEndedRequestHandler
 * Triggered when session ends (user says exit, timeout, or error)
 */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
    }
};

/**
 * ErrorHandler
 * Generic error handling for syntax or routing errors
 * Uses casual friendly tone per design guidelines
 */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error: ${error.message}`);
        console.log(`Stack: ${error.stack}`);

        let speakOutput = "Hmm, something went wrong. ";

        // Customize based on error type
        if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
            speakOutput = "I'm having trouble connecting to your kitchen right now. Try again in a moment.";
        } else {
            speakOutput += "Please try again.";
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("What would you like to do?")
            .getResponse();
    }
};

/**
 * Skill entry point
 * Routes all requests to the appropriate handlers
 */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        CanFulfillIntentRequestHandler,   // Must be first to catch CFIR before other handlers
        LaunchRequestHandler,
        ResumeCookingIntentHandler,       // Handle "continue cooking" after launch
        LinkHouseholdIntentHandler,
        BrowseMealsIntentHandler,
        GetRecipeIntentHandler,
        BrowseCategoryIntentHandler,
        StartCookingIntentHandler,
        NextStepIntentHandler,
        PreviousStepIntentHandler,
        RepeatStepIntentHandler,
        ExitCookingIntentHandler,         // Handle "exit cooking" / "stop cooking"
        ReadGroceryListIntentHandler,
        AddGroceryIntentHandler,
        ConfirmDuplicateIntentHandler,  // Must be before other Yes/No handlers
        UndoGroceryIntentHandler,
        RemoveGroceryIntentHandler,
        CheckOffGroceryIntentHandler,
        MarkAsLowIntentHandler,
        MarkAsLowDisambiguationHandler,   // Must be before generic handlers
        ConfirmAddFromLowHandler,          // Must be before other Yes/No handlers
        MealSelectedEventHandler,
        StartCookingEventHandler,
        StepChangedEventHandler,
        ExitCookingModeEventHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .addRequestInterceptors(
        LogRequestInterceptor,
        LoadHouseholdInterceptor
    )
    .addResponseInterceptors(
        SavePersistentAttributesInterceptor
    )
    .withPersistenceAdapter(persistenceAdapter)
    .withCustomUserAgent('our-kitchen/v2.0')
    .lambda();
