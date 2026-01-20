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
  ReadGroceryListIntentHandler,
  AddGroceryIntentHandler,
  UndoGroceryIntentHandler,
  RemoveGroceryIntentHandler,
  CheckOffGroceryIntentHandler
} = require('./handlers/GroceryHandlers');
const { MealSelectedEventHandler } = require('./handlers/AplEventHandlers');

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
 */
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const isLinked = sessionAttributes.isLinked;

        if (isLinked) {
            // Linked user - welcome back
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
        LaunchRequestHandler,
        LinkHouseholdIntentHandler,
        BrowseMealsIntentHandler,
        GetRecipeIntentHandler,
        BrowseCategoryIntentHandler,
        ReadGroceryListIntentHandler,
        AddGroceryIntentHandler,
        UndoGroceryIntentHandler,
        RemoveGroceryIntentHandler,
        CheckOffGroceryIntentHandler,
        MealSelectedEventHandler,
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
