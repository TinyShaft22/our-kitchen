/**
 * APL Event Handlers
 * Handle touch events from APL SendEvent commands
 */
const Alexa = require('ask-sdk-core');
const { getRecipe } = require('../api/firebaseClient');
const { isLinked, getHouseholdCode } = require('../util/sessionHelper');
const recipeDetailDocument = require('../apl/recipe-detail.json');
const { buildRecipeDetailDataSource } = require('../apl/recipe-detail-data');

/**
 * MealSelectedEventHandler
 * Handles touch selection of a meal card in the APL meal list
 * Fetches recipe and displays recipe detail APL (Phase 27)
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

    // Get household code from session
    const householdCode = getHouseholdCode(handlerInput);
    if (!householdCode) {
      return handlerInput.responseBuilder
        .speak("I'm not sure which household to use. Try saying 'link my account' first.")
        .reprompt("What would you like to do?")
        .getResponse();
    }

    try {
      // Fetch the recipe
      const result = await getRecipe(householdCode, mealId);

      if (!result || !result.name) {
        return handlerInput.responseBuilder
          .speak("I couldn't find that recipe. Try selecting another meal.")
          .reprompt("What would you like to do?")
          .getResponse();
      }

      // Store recipe in session for follow-up actions
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes.currentRecipe = result;
      sessionAttributes.selectedMealId = mealId;
      sessionAttributes.navigationSource = 'mealList';
      sessionAttributes.currentRecipeStep = 0;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      // Voice flow per CONTEXT.md: brief confirmation, offer follow-up actions
      const speakOutput = `Here's the recipe for ${result.name}. Would you like me to read the ingredients, read the instructions, or start cooking mode?`;
      const reprompt = "Would you like to hear the ingredients, the instructions, or start cooking mode?";

      // Add APL visual (device already supports APL since they tapped)
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'recipeDetailToken',
        document: recipeDetailDocument,
        datasources: buildRecipeDetailDataSource(result)
      });

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(reprompt)
        .getResponse();

    } catch (error) {
      console.log('Meal selected error:', error.message);
      return handlerInput.responseBuilder
        .speak("I had trouble getting that recipe. Try selecting another meal.")
        .reprompt("What would you like to do?")
        .getResponse();
    }
  }
};

module.exports = { MealSelectedEventHandler };
