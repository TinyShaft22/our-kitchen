/**
 * APL Event Handlers
 * Handle touch events from APL SendEvent commands
 */
const Alexa = require('ask-sdk-core');

/**
 * MealSelectedEventHandler
 * Handles touch selection of a meal card in the APL meal list
 * Stores selectedMealId in session for Phase 27 recipe detail
 */
const MealSelectedEventHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'Alexa.Presentation.APL.UserEvent'
      && request.arguments
      && request.arguments[0] === 'MealSelected';
  },

  async handle(handlerInput) {
    const args = handlerInput.requestEnvelope.request.arguments;
    // args[0] = 'MealSelected', args[1] = ordinal, args[2] = mealId
    const mealId = args[2];

    // Store selected meal for recipe display (Phase 27)
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.selectedMealId = mealId;
    sessionAttributes.navigationSource = 'mealList';
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // Acknowledge selection and prompt for recipe
    return handlerInput.responseBuilder
      .speak("Great choice! Ready for the recipe?")
      .reprompt("Would you like to hear the ingredients?")
      .getResponse();
  }
};

module.exports = { MealSelectedEventHandler };
