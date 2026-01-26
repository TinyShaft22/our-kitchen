/**
 * CanFulfillIntentRequest Handler
 * For Name-Free Interaction (NFI) support
 *
 * Alexa queries this handler to determine if Our Kitchen can handle
 * a specific intent without explicit skill invocation.
 *
 * CRITICAL: This handler must be fast and stateless.
 * - NO Firebase calls
 * - NO state modifications
 * - NO audio/visual output
 */
const Alexa = require('ask-sdk-core');

/**
 * Supported intents that Our Kitchen can fulfill
 * These are the custom intents we've implemented handlers for
 */
const SUPPORTED_INTENTS = [
  'BrowseMealsIntent',
  'GetRecipeIntent',
  'BrowseCategoryIntent',
  'ReadGroceryListIntent',
  'AddGroceryIntent',
  'MarkAsLowIntent',
  'StartCookingIntent',
  'RemoveGroceryIntent',
  'CheckOffGroceryIntent',
  'UndoGroceryIntent'
];

/**
 * CanFulfillIntentRequestHandler
 * Responds to Alexa's query about whether this skill can handle a given intent
 *
 * Returns YES for our supported custom intents
 * Returns NO for AMAZON.* built-in intents and unrecognized intents
 */
const CanFulfillIntentRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'CanFulfillIntentRequest';
  },

  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    console.log('CFIR received for intent:', intentName);

    // Check if this is a supported intent
    const canFulfill = SUPPORTED_INTENTS.includes(intentName) ? 'YES' : 'NO';

    // Build slot responses if slots are present
    const slots = handlerInput.requestEnvelope.request.intent?.slots || {};
    const slotResponses = {};

    for (const slotName of Object.keys(slots)) {
      const slot = slots[slotName];
      slotResponses[slotName] = {
        // If slot has a value, we can understand it; otherwise MAYBE
        canUnderstand: slot.value ? 'YES' : 'MAYBE',
        // If we can fulfill the intent, we can fulfill the slot
        canFulfill: canFulfill === 'YES' ? 'YES' : 'NO'
      };
    }

    // Build the CanFulfillIntent response
    const response = handlerInput.responseBuilder
      .withCanFulfillIntent({
        canFulfill: canFulfill,
        slots: slotResponses
      })
      .getResponse();

    console.log('CFIR response:', JSON.stringify(response));
    return response;
  }
};

module.exports = { CanFulfillIntentRequestHandler };
