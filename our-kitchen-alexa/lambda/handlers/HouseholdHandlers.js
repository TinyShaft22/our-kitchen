/**
 * Household Handlers
 * PIN verification and household linking
 */
const Alexa = require('ask-sdk-core');
const { verifyPin } = require('../api/firebaseClient');
const { getPendingAction, clearPendingAction, markPersistentDirty } = require('../util/sessionHelper');

/**
 * LinkHouseholdIntentHandler
 * Handles voice PIN verification and household linking
 *
 * Flow (from CONTEXT.md):
 * 1. User says PIN (or gets prompted after trying to access data)
 * 2. Verify PIN against Firebase
 * 3. If valid: store householdCode in persistent attributes, resume pending action
 * 4. If invalid: track attempt (max 3), reprompt or exit
 */
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

    // If no PIN provided, prompt for it
    if (!pinCode) {
      return handlerInput.responseBuilder
        .speak("What's your four-digit household PIN?")
        .reprompt("Say your four-digit PIN to link this device to your kitchen.")
        .getResponse();
    }

    try {
      // Verify PIN against Firebase
      const result = await verifyPin(pinCode);

      if (result.valid) {
        // Store household code in persistent attributes (device-scoped)
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        persistentAttributes.householdCode = result.householdCode;
        persistentAttributes.linkedAt = new Date().toISOString();
        handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);

        // Mark for save by response interceptor
        markPersistentDirty(handlerInput);

        // Update session attributes too
        sessionAttributes.householdCode = result.householdCode;
        sessionAttributes.isLinked = true;
        sessionAttributes.pinAttempts = 0;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        // Check if there was a pending action to resume
        const pending = getPendingAction(handlerInput);
        if (pending.action) {
          clearPendingAction(handlerInput);

          // Construct a helpful response based on pending action
          const actionPrompt = getPendingActionPrompt(pending.action);
          return handlerInput.responseBuilder
            .speak(`Got it! You're now linked. ${actionPrompt}`)
            .reprompt("What would you like to do?")
            .getResponse();
        }

        return handlerInput.responseBuilder
          .speak("Got it! You're now linked to your kitchen. What would you like to do?")
          .reprompt("Try asking what's for dinner, or what's on the grocery list.")
          .getResponse();

      } else {
        // Invalid PIN - track attempts
        const newAttempts = attempts + 1;
        sessionAttributes.pinAttempts = newAttempts;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        // After 3 attempts, suggest checking app and exit
        if (newAttempts >= 3) {
          sessionAttributes.pinAttempts = 0;
          handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

          return handlerInput.responseBuilder
            .speak("Hmm, that PIN didn't work. Check your PIN in the app and try again later.")
            .getResponse();
        }

        const triesLeft = 3 - newAttempts;
        return handlerInput.responseBuilder
          .speak(`That PIN didn't match. You have ${triesLeft} ${triesLeft === 1 ? 'try' : 'tries'} left. What's your PIN?`)
          .reprompt("Say your four-digit PIN.")
          .getResponse();
      }

    } catch (error) {
      console.log('PIN verification error:', error.message);

      // Network/API errors - be friendly
      return handlerInput.responseBuilder
        .speak("I'm having trouble verifying that PIN right now. Try again in a moment.")
        .reprompt("Say your four-digit PIN to try again.")
        .getResponse();
    }
  }
};

/**
 * Get a helpful prompt based on what the user was trying to do before linking
 */
function getPendingActionPrompt(action) {
  switch (action) {
    case 'BrowseMeals':
      return "Now, what would you like to know about your meals?";
    case 'GetRecipe':
      return "Now, which recipe did you want?";
    case 'ReadGroceryList':
      return "Now, let me check your grocery list.";
    case 'AddGrocery':
      return "Now, what did you want to add to the list?";
    case 'UndoGrocery':
      return "Now, what would you like to do?";
    case 'RemoveGrocery':
      return "Now, what did you want to remove?";
    case 'CheckOffGrocery':
      return "Now, what did you pick up?";
    default:
      return "What would you like to do?";
  }
}

/**
 * Utility function for other handlers to prompt for PIN
 * Returns a response that prompts for PIN and stores pending action
 */
function createPinPromptResponse(handlerInput, pendingAction, pendingParams = {}) {
  const { setPendingAction } = require('../util/sessionHelper');
  setPendingAction(handlerInput, pendingAction, pendingParams);

  return handlerInput.responseBuilder
    .speak("I don't know which household to use yet. What's your four-digit PIN?")
    .reprompt("Say your four-digit PIN to link this device.")
    .getResponse();
}

module.exports = {
  LinkHouseholdIntentHandler,
  createPinPromptResponse
};
