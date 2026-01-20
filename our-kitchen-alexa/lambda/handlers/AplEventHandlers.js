/**
 * APL Event Handlers
 * Handle touch events from APL SendEvent commands
 */
const Alexa = require('ask-sdk-core');
const { getRecipe } = require('../api/firebaseClient');
const { isLinked, getHouseholdCode } = require('../util/sessionHelper');
const { parseInstructionsToSteps } = require('../util/stepParser');
const recipeDetailDocument = require('../apl/recipe-detail.json');
const { buildRecipeDetailDataSource } = require('../apl/recipe-detail-data');
const cookingStepDocument = require('../apl/cooking-step.json');
const { buildCookingStepDataSource } = require('../apl/cooking-step-data');

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

/**
 * StartCookingEventHandler
 * Handles touch on "Start Cooking" button from recipe detail
 * Enters cooking mode at Step 0 (ingredients)
 */
const StartCookingEventHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'Alexa.Presentation.APL.UserEvent'
      && request.arguments
      && request.arguments[0] === 'StartCooking';
  },

  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    // Get recipe from session (set when viewing recipe detail)
    const recipe = sessionAttributes.currentRecipe;
    if (!recipe || !recipe.name) {
      return handlerInput.responseBuilder
        .speak("I'm not sure which recipe to cook. Try selecting a recipe first.")
        .reprompt("What recipe would you like to cook?")
        .getResponse();
    }

    // Parse steps
    const steps = parseInstructionsToSteps(recipe.instructions || '', recipe.ingredients || []);

    // Store cooking mode state
    sessionAttributes.cookingMode = true;
    sessionAttributes.cookingSteps = steps;
    sessionAttributes.cookingStep = 0;
    sessionAttributes.cookingRecipe = recipe;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // Build voice output for Step 0 (ingredients)
    const ingredientList = (recipe.ingredients || []).map(i => i.name).join(', ');
    const speakOutput = `Let's make ${recipe.name}. First, gather your ingredients: ${ingredientList}. Swipe right or say 'next step' when ready.`;

    // Add APL cooking view
    handlerInput.responseBuilder.addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      token: 'cookingStepToken',
      document: cookingStepDocument,
      datasources: buildCookingStepDataSource(recipe, 0)
    });

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Say 'next step' to continue, or 'stop' to exit.")
      .getResponse();
  }
};

/**
 * StepChangedEventHandler
 * Handles swipe navigation on the step pager
 * Updates session state and reads current step aloud
 */
const StepChangedEventHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'Alexa.Presentation.APL.UserEvent'
      && request.arguments
      && request.arguments[0] === 'StepChanged';
  },

  handle(handlerInput) {
    const args = handlerInput.requestEnvelope.request.arguments;
    const newPageIndex = args[1]; // Page index from Pager onPageChanged

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const steps = sessionAttributes.cookingSteps || [];

    // Update current step
    sessionAttributes.cookingStep = newPageIndex;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    const step = steps[newPageIndex];
    if (!step) {
      return handlerInput.responseBuilder
        .speak("Something went wrong. Say 'repeat' to try again.")
        .reprompt("What would you like to do?")
        .getResponse();
    }

    const isLastStep = newPageIndex === steps.length - 1;
    let speakOutput;

    if (isLastStep && !step.isIngredients) {
      speakOutput = `${step.content} <break time="500ms"/> You're done! Enjoy your meal.`;
    } else {
      speakOutput = `${step.title}. ${step.content}`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Say 'next step', 'previous step', or 'repeat'.")
      .getResponse();
  }
};

/**
 * ExitCookingModeEventHandler
 * Handles back button press from cooking mode
 * Returns to recipe detail view
 */
const ExitCookingModeEventHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'Alexa.Presentation.APL.UserEvent'
      && request.arguments
      && request.arguments[0] === 'ExitCookingMode';
  },

  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const recipe = sessionAttributes.cookingRecipe || sessionAttributes.currentRecipe;

    // Clear cooking mode state
    sessionAttributes.cookingMode = false;
    sessionAttributes.cookingSteps = null;
    sessionAttributes.cookingStep = 0;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // If we have recipe, return to recipe detail
    if (recipe) {
      const speakOutput = `Back to ${recipe.name}. Would you like me to read the ingredients, read the instructions, or start cooking mode?`;

      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'recipeDetailToken',
        document: recipeDetailDocument,
        datasources: buildRecipeDetailDataSource(recipe)
      });

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("What would you like to do?")
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak("You've exited cooking mode. What would you like to do?")
      .reprompt("Try asking what's for dinner.")
      .getResponse();
  }
};

module.exports = {
  MealSelectedEventHandler,
  StartCookingEventHandler,
  StepChangedEventHandler,
  ExitCookingModeEventHandler
};
