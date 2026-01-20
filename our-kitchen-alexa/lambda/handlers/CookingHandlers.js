/**
 * Cooking Handlers
 * Step-by-step cooking mode with voice navigation
 */
const Alexa = require('ask-sdk-core');
const { getRecipe } = require('../api/firebaseClient');
const { isLinked, getHouseholdCode } = require('../util/sessionHelper');
const { createPinPromptResponse } = require('./HouseholdHandlers');
const { parseInstructionsToSteps } = require('../util/stepParser');
const cookingStepDocument = require('../apl/cooking-step.json');
const { buildCookingStepDataSource } = require('../apl/cooking-step-data');

/**
 * StartCookingIntentHandler
 * "Let's cook {MealName}" / "Start cooking" (from recipe view)
 *
 * Enters cooking mode with Step 0 (ingredients) displayed first
 */
const StartCookingIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartCookingIntent';
  },

  async handle(handlerInput) {
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'StartCooking');
    }

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const mealNameSlot = slots?.MealName;

    let recipe = null;

    // Option 1: Meal name provided in slot
    if (mealNameSlot?.value) {
      const householdCode = getHouseholdCode(handlerInput);
      const lastMealList = sessionAttributes.lastMealList || [];
      const matchedMeal = lastMealList.find(m =>
        m.name.toLowerCase().includes(mealNameSlot.value.toLowerCase()) ||
        mealNameSlot.value.toLowerCase().includes(m.name.toLowerCase())
      );

      if (matchedMeal) {
        recipe = await getRecipe(householdCode, matchedMeal.id);
      }
    }

    // Option 2: Use current recipe from session (viewing a recipe)
    if (!recipe && sessionAttributes.currentRecipe) {
      recipe = sessionAttributes.currentRecipe;
    }

    // No recipe found
    if (!recipe || !recipe.name) {
      return handlerInput.responseBuilder
        .speak("Which recipe would you like to cook? Try asking to see the recipe first.")
        .reprompt("What recipe do you want to cook?")
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
    const speakOutput = `Let's make ${recipe.name}. First, gather your ingredients: ${ingredientList}. Say 'next step' when you're ready to begin.`;

    const responseBuilder = handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Say 'next step' to continue, or 'stop' to exit.");

    // Add APL if supported
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'cookingStepToken',
        document: cookingStepDocument,
        datasources: buildCookingStepDataSource(recipe, 0)
      });
    }

    return responseBuilder.getResponse();
  }
};

/**
 * NextStepIntentHandler
 * Handles AMAZON.NextIntent when in cooking mode
 *
 * Advances to next step and reads it aloud
 */
const NextStepIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NextIntent'
      && sessionAttributes.cookingMode === true;
  },

  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const steps = sessionAttributes.cookingSteps || [];
    let currentStep = sessionAttributes.cookingStep || 0;

    // Advance step
    currentStep = Math.min(currentStep + 1, steps.length - 1);
    sessionAttributes.cookingStep = currentStep;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    let speakOutput;
    if (isLastStep && !step.isIngredients) {
      // Clear cooking mode and progress on completion
      sessionAttributes.cookingMode = false;
      sessionAttributes.cookingSteps = null;
      sessionAttributes.cookingRecipe = null;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      // Clear persistent cooking progress
      try {
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes() || {};
        if (persistentAttributes.cookingProgress) {
          delete persistentAttributes.cookingProgress;
          handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
          await handlerInput.attributesManager.savePersistentAttributes();
          console.log('Cleared cooking progress on completion');
        }
      } catch (error) {
        console.error('Failed to clear cooking progress:', error.message);
      }

      speakOutput = `${step.content} <break time="500ms"/> You're done! Enjoy your meal.`;
    } else {
      speakOutput = `${step.title}. ${step.content} <break time="300ms"/> Say 'next step' to continue.`;
    }

    const responseBuilder = handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Say 'next step', 'previous step', or 'repeat'.");

    // Update APL pager
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.ExecuteCommands',
        token: 'cookingStepToken',
        commands: [{
          type: 'SetPage',
          componentId: 'stepPager',
          position: 'absolute',
          value: currentStep
        }]
      });
    }

    return responseBuilder.getResponse();
  }
};

/**
 * PreviousStepIntentHandler
 * Handles AMAZON.PreviousIntent when in cooking mode
 *
 * Goes back to previous step and reads it aloud
 */
const PreviousStepIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PreviousIntent'
      && sessionAttributes.cookingMode === true;
  },

  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const steps = sessionAttributes.cookingSteps || [];
    let currentStep = sessionAttributes.cookingStep || 0;

    // Go back
    currentStep = Math.max(currentStep - 1, 0);
    sessionAttributes.cookingStep = currentStep;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    const step = steps[currentStep];
    const speakOutput = `${step.title}. ${step.content} <break time="300ms"/> Say 'next step' to continue.`;

    const responseBuilder = handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Say 'next step', 'previous step', or 'repeat'.");

    // Update APL pager
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.ExecuteCommands',
        token: 'cookingStepToken',
        commands: [{
          type: 'SetPage',
          componentId: 'stepPager',
          position: 'absolute',
          value: currentStep
        }]
      });
    }

    return responseBuilder.getResponse();
  }
};

/**
 * RepeatStepIntentHandler
 * Handles AMAZON.RepeatIntent when in cooking mode
 *
 * Re-reads the current step
 */
const RepeatStepIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent'
      && sessionAttributes.cookingMode === true;
  },

  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const steps = sessionAttributes.cookingSteps || [];
    const currentStep = sessionAttributes.cookingStep || 0;

    const step = steps[currentStep];
    if (!step) {
      return handlerInput.responseBuilder
        .speak("I'm not sure what to repeat. Try saying 'next step'.")
        .reprompt("What would you like to do?")
        .getResponse();
    }

    const speakOutput = `${step.title}. ${step.content}`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Say 'next step', 'previous step', or 'repeat'.")
      .getResponse();
  }
};

/**
 * ResumeCookingIntentHandler
 * Handles "Continue cooking", "Resume", "Pick up where I left off"
 *
 * Resumes cooking at the saved step from persistent storage
 */
const ResumeCookingIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResumeCookingIntent';
  },
  async handle(handlerInput) {
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'ResumeCooking');
    }

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const pendingResume = sessionAttributes.pendingCookingResume;

    // Check if we have pending resume from LaunchRequest
    if (!pendingResume || !pendingResume.recipeId) {
      return handlerInput.responseBuilder
        .speak("I don't have a recipe to resume. What would you like to cook?")
        .reprompt("Try asking what's for dinner.")
        .getResponse();
    }

    // Fetch the recipe from Firebase
    const householdCode = getHouseholdCode(handlerInput) || pendingResume.householdCode;
    let recipe;
    try {
      recipe = await getRecipe(householdCode, pendingResume.recipeId);
    } catch (error) {
      console.error('Failed to fetch recipe for resume:', error.message);
      return handlerInput.responseBuilder
        .speak("I couldn't find that recipe anymore. What would you like to do?")
        .reprompt("Try asking what's for dinner.")
        .getResponse();
    }

    if (!recipe || !recipe.name) {
      return handlerInput.responseBuilder
        .speak("That recipe seems to have been removed. What would you like to do?")
        .reprompt("Try asking what's for dinner.")
        .getResponse();
    }

    // Parse steps and restore cooking state
    const steps = parseInstructionsToSteps(recipe.instructions || '', recipe.ingredients || []);
    const resumeStep = Math.min(pendingResume.currentStep || 0, steps.length - 1);

    // Store cooking mode state
    sessionAttributes.cookingMode = true;
    sessionAttributes.cookingSteps = steps;
    sessionAttributes.cookingStep = resumeStep;
    sessionAttributes.cookingRecipe = recipe;
    delete sessionAttributes.pendingCookingResume; // Clear pending resume
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // Build voice output for resumed step
    const step = steps[resumeStep];
    const speakOutput = `Resuming ${recipe.name}. ${step.title}. ${step.content} <break time="300ms"/> Say 'next step' to continue.`;

    const responseBuilder = handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt("Say 'next step', 'previous step', or 'repeat'.");

    // Add APL if supported
    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'cookingStepToken',
        document: cookingStepDocument,
        datasources: buildCookingStepDataSource(recipe, resumeStep)
      });
    }

    return responseBuilder.getResponse();
  }
};

/**
 * ExitCookingIntentHandler
 * Handles "Exit cooking", "Stop cooking", "I'm done cooking"
 *
 * Clears cooking state and persistent progress
 */
const ExitCookingIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ExitCookingIntent'
      && sessionAttributes.cookingMode === true;
  },
  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const recipe = sessionAttributes.cookingRecipe;

    // Clear cooking mode state
    sessionAttributes.cookingMode = false;
    sessionAttributes.cookingSteps = null;
    sessionAttributes.cookingStep = 0;
    sessionAttributes.cookingRecipe = null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    // Clear persistent cooking progress
    try {
      const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes() || {};
      if (persistentAttributes.cookingProgress) {
        delete persistentAttributes.cookingProgress;
        handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
        await handlerInput.attributesManager.savePersistentAttributes();
        console.log('Cleared cooking progress on exit');
      }
    } catch (error) {
      console.error('Failed to clear cooking progress:', error.message);
    }

    const recipeName = recipe?.name || 'your recipe';
    return handlerInput.responseBuilder
      .speak(`Exited cooking mode for ${recipeName}. What would you like to do?`)
      .reprompt("Try asking what's for dinner, or what's on the grocery list.")
      .getResponse();
  }
};

module.exports = {
  StartCookingIntentHandler,
  NextStepIntentHandler,
  PreviousStepIntentHandler,
  RepeatStepIntentHandler,
  ResumeCookingIntentHandler,
  ExitCookingIntentHandler
};
