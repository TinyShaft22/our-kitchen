/**
 * Meal Handlers
 * Browse meals, get recipe details, browse by category
 */
const Alexa = require('ask-sdk-core');
const { getMeals, getRecipe } = require('../api/firebaseClient');
const { isLinked, getHouseholdCode } = require('../util/sessionHelper');
const { createPinPromptResponse } = require('./HouseholdHandlers');

/**
 * BrowseMealsIntentHandler
 * "What's for dinner?" / "What meals are planned?"
 *
 * Per CONTEXT.md:
 * - Names only, cap at 5 items
 * - "and X more" if more than 5
 */
const BrowseMealsIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BrowseMealsIntent';
  },

  async handle(handlerInput) {
    // Check if linked
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'BrowseMeals');
    }

    const householdCode = getHouseholdCode(handlerInput);

    try {
      const result = await getMeals(householdCode);
      const meals = result.meals || [];

      if (meals.length === 0) {
        return handlerInput.responseBuilder
          .speak("Your weekly plan is empty. Add meals in the app to get started.")
          .reprompt("What else would you like to do?")
          .getResponse();
      }

      // Cap at 5 items per CONTEXT.md
      const mealNames = meals.slice(0, 5).map(m => m.name);
      const remaining = meals.length - 5;

      let speakOutput = `Your meals are: ${formatList(mealNames)}`;
      if (remaining > 0) {
        speakOutput += `, and ${remaining} more`;
      }
      speakOutput += ". Which one do you want to know more about?";

      // Store meals in session for follow-up
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes.lastMealList = meals;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("Which meal would you like to see?")
        .getResponse();

    } catch (error) {
      console.log('Browse meals error:', error.message);
      return handlerInput.responseBuilder
        .speak("I'm having trouble getting your meals right now. Try again in a moment.")
        .reprompt("What would you like to do?")
        .getResponse();
    }
  }
};

/**
 * GetRecipeIntentHandler
 * "Show me the recipe for {MealName}" / "What's in {MealName}?"
 *
 * Per CONTEXT.md:
 * - Ingredients first, then ask "Ready for the steps?"
 */
const GetRecipeIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetRecipeIntent';
  },

  async handle(handlerInput) {
    // Check if linked
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'GetRecipe');
    }

    const householdCode = getHouseholdCode(handlerInput);
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const mealNameSlot = slots.MealName;

    // Get resolved value (handles synonyms) or raw value
    const mealName = getResolvedSlotValue(mealNameSlot) || mealNameSlot?.value;

    if (!mealName) {
      return handlerInput.responseBuilder
        .speak("Which recipe would you like? Try saying the meal name.")
        .reprompt("What meal do you want the recipe for?")
        .getResponse();
    }

    try {
      // Find meal ID from session or search
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      const lastMealList = sessionAttributes.lastMealList || [];

      // Try to match meal name (case-insensitive partial match)
      const matchedMeal = lastMealList.find(m =>
        m.name.toLowerCase().includes(mealName.toLowerCase()) ||
        mealName.toLowerCase().includes(m.name.toLowerCase())
      );

      if (!matchedMeal) {
        // TODO: In future, could search Firebase for meal by name
        return handlerInput.responseBuilder
          .speak(`I couldn't find ${mealName}. Try asking what's for dinner first, then pick a meal.`)
          .reprompt("What would you like to do?")
          .getResponse();
      }

      const result = await getRecipe(householdCode, matchedMeal.id);

      if (!result || !result.name) {
        return handlerInput.responseBuilder
          .speak(`Hmm, I can't find that recipe. Try asking what's for dinner first.`)
          .reprompt("What would you like to do?")
          .getResponse();
      }

      // Build ingredients list (cap at 7 for voice)
      const ingredients = result.ingredients || [];
      const ingredientNames = ingredients.slice(0, 7).map(i => i.name);
      const remainingIngredients = ingredients.length - 7;

      let speakOutput = `For ${result.name}, you'll need: ${formatList(ingredientNames)}`;
      if (remainingIngredients > 0) {
        speakOutput += `, and ${remainingIngredients} more items`;
      }
      speakOutput += ". Ready for the cooking steps?";

      // Store recipe in session for cooking mode
      sessionAttributes.currentRecipe = result;
      sessionAttributes.currentRecipeStep = 0;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("Say yes to hear the cooking steps, or ask about another meal.")
        .getResponse();

    } catch (error) {
      console.log('Get recipe error:', error.message);
      return handlerInput.responseBuilder
        .speak("I'm having trouble getting that recipe right now. Try again in a moment.")
        .reprompt("What would you like to do?")
        .getResponse();
    }
  }
};

/**
 * BrowseCategoryIntentHandler
 * "Show me cookies" / "What baking recipes do we have?"
 *
 * Note: This is a placeholder - full implementation needs category search endpoint
 */
const BrowseCategoryIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BrowseCategoryIntent';
  },

  async handle(handlerInput) {
    // Check if linked
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'BrowseCategory');
    }

    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const category = slots.Category?.value;

    // For now, redirect to browse all meals
    // TODO: Add category search endpoint to Cloud Functions
    return handlerInput.responseBuilder
      .speak(`Looking for ${category || 'recipes'}. Let me show you what's planned this week instead.`)
      .reprompt("What would you like to do?")
      .addDelegateDirective({
        name: 'BrowseMealsIntent',
        confirmationStatus: 'NONE',
        slots: {}
      })
      .getResponse();
  }
};

/**
 * Format a list for natural speech
 * ["a", "b", "c"] -> "a, b, and c"
 */
function formatList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  return `${rest.join(', ')}, and ${last}`;
}

/**
 * Get resolved slot value (handles entity resolution)
 */
function getResolvedSlotValue(slot) {
  if (!slot) return null;

  // Check for entity resolution
  const resolutions = slot.resolutions?.resolutionsPerAuthority;
  if (resolutions && resolutions.length > 0) {
    const resolution = resolutions[0];
    if (resolution.status?.code === 'ER_SUCCESS_MATCH') {
      return resolution.values[0]?.value?.name;
    }
  }

  return null;
}

module.exports = {
  BrowseMealsIntentHandler,
  GetRecipeIntentHandler,
  BrowseCategoryIntentHandler
};
