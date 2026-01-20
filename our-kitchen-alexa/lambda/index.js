/**
 * Our Kitchen - Alexa Skill Handler
 *
 * This skill helps manage meals, recipes, and grocery lists using voice commands.
 * Built with ASK SDK v2 for Node.js.
 */
const Alexa = require('ask-sdk-core');

/**
 * LaunchRequestHandler
 * Triggered when user says "Alexa, open our kitchen"
 */
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Our Kitchen! You can ask me about meals, recipes, or your grocery list. What would you like to do?';
        const repromptOutput = 'Try saying "hello" or "help" to get started.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
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
 */
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
 */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        console.log(`Error stack: ${error.stack}`);
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
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
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .withCustomUserAgent('our-kitchen/v1.0')
    .lambda();
