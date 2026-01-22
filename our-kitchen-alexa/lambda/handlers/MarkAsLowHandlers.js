/**
 * Mark As Low Handlers
 * Handle "we're low on {item}" voice commands
 * Searches baking inventory first, then household items
 * Handles disambiguation for multiple matches
 */
const Alexa = require('ask-sdk-core');
const { markAsLow, addGroceryItemWithDefaults } = require('../api/firebaseClient');
const { isLinked, getHouseholdCode } = require('../util/sessionHelper');
const { createPinPromptResponse } = require('./HouseholdHandlers');

/**
 * MarkAsLowIntentHandler
 * "We're low on flour" / "Mark butter as low" / "We're out of sugar"
 *
 * Flow:
 * 1. Search baking inventory (contains match)
 * 2. Single match -> mark as low, ask about adding to grocery
 * 3. Multiple matches -> ask to disambiguate
 * 4. No baking match -> search household items
 * 5. Household match -> confirm found, ask about adding to grocery
 * 6. No match -> offer to add to grocery anyway
 */
const MarkAsLowIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarkAsLowIntent';
  },

  async handle(handlerInput) {
    // Check if linked
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'MarkAsLow');
    }

    const householdCode = getHouseholdCode(handlerInput);
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const item = slots.Item?.value;

    if (!item) {
      return handlerInput.responseBuilder
        .speak("What item are you low on?")
        .reprompt("Say the name of the item you're running low on.")
        .getResponse();
    }

    try {
      const result = await markAsLow(householdCode, item);

      // Handle disambiguation needed
      if (result.needsDisambiguation) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.pendingMarkAsLow = {
          originalItem: item,
          matches: result.matches
        };
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const matchNames = result.matches.map(m => m.name);
        const options = formatOptions(matchNames);

        return handlerInput.responseBuilder
          .speak(`I found ${matchNames.length} types of ${item}. Did you mean ${options}?`)
          .reprompt(`Which one? ${options}?`)
          .getResponse();
      }

      // Handle single match found
      if (result.success) {
        const markedItem = result.markedItem;
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        // Store for potential grocery add
        sessionAttributes.pendingGroceryFromLow = {
          name: markedItem.name,
          store: markedItem.store,
          category: markedItem.category || 'baking'
        };
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const sourceNote = result.source === 'baking' ? " in your baking supplies" : "";
        return handlerInput.responseBuilder
          .speak(`${markedItem.name} is marked as low${sourceNote}. Would you like me to add it to your shopping list?`)
          .reprompt("Should I add it to your grocery list?")
          .getResponse();
      }

      // Not found in baking or household items
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes.pendingUnknownItem = {
        name: item,
        store: 'safeway',
        category: 'pantry'
      };
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(`I don't have ${item} saved in your inventory. Would you like me to add it to your grocery list anyway?`)
        .reprompt("Say yes to add it to your shopping list, or no to cancel.")
        .getResponse();

    } catch (error) {
      console.log('Mark as low error:', error.message);
      return handlerInput.responseBuilder
        .speak("I'm having trouble checking your inventory right now. Try again in a moment.")
        .reprompt("What would you like to do?")
        .getResponse();
    }
  }
};

/**
 * MarkAsLowDisambiguationHandler
 * Handles user selection when multiple items match
 * Triggers on AMAZON.SearchQuery or specific item name after disambiguation prompt
 */
const MarkAsLowDisambiguationHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && sessionAttributes.pendingMarkAsLow
      && sessionAttributes.pendingMarkAsLow.matches;
  },

  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const pending = sessionAttributes.pendingMarkAsLow;
    const householdCode = getHouseholdCode(handlerInput);

    // Try to extract what the user said
    let userChoice = null;

    // Check for direct slot value if using a specific intent
    const request = handlerInput.requestEnvelope.request;
    if (request.intent?.slots) {
      // Look for any slot that might have a value
      for (const slotName of Object.keys(request.intent.slots)) {
        if (request.intent.slots[slotName]?.value) {
          userChoice = request.intent.slots[slotName].value.toLowerCase();
          break;
        }
      }
    }

    // Match user choice against available options
    let selectedMatch = null;
    if (userChoice) {
      selectedMatch = pending.matches.find(m =>
        m.name.toLowerCase().includes(userChoice) ||
        userChoice.includes(m.name.toLowerCase())
      );
    }

    // If no match found and user said a number, try index
    if (!selectedMatch && userChoice) {
      const numberMatch = userChoice.match(/first|second|third|1|2|3|one|two|three/i);
      if (numberMatch) {
        const indexMap = { 'first': 0, '1': 0, 'one': 0, 'second': 1, '2': 1, 'two': 1, 'third': 2, '3': 2, 'three': 2 };
        const index = indexMap[numberMatch[0].toLowerCase()];
        if (index !== undefined && index < pending.matches.length) {
          selectedMatch = pending.matches[index];
        }
      }
    }

    if (!selectedMatch) {
      const matchNames = pending.matches.map(m => m.name);
      const options = formatOptions(matchNames);
      return handlerInput.responseBuilder
        .speak(`I didn't catch that. Which one: ${options}?`)
        .reprompt(`Please choose: ${options}`)
        .getResponse();
    }

    // Clear disambiguation state
    sessionAttributes.pendingMarkAsLow = null;

    try {
      // Mark the specific item
      const result = await markAsLow(householdCode, selectedMatch.name, selectedMatch.id);

      if (result.success) {
        // Store for potential grocery add
        sessionAttributes.pendingGroceryFromLow = {
          name: result.markedItem.name,
          store: result.markedItem.store,
          category: result.markedItem.category || 'baking'
        };
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
          .speak(`${result.markedItem.name} is marked as low. Would you like me to add it to your shopping list?`)
          .reprompt("Should I add it to your grocery list?")
          .getResponse();
      }
    } catch (error) {
      console.log('Disambiguation mark error:', error.message);
    }

    return handlerInput.responseBuilder
      .speak("I couldn't mark that item. Try again.")
      .reprompt("What would you like to do?")
      .getResponse();
  }
};

/**
 * ConfirmAddFromLowHandler
 * Handles Yes/No response after marking item as low
 * Adds item to grocery list if confirmed
 */
const ConfirmAddFromLowHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const hasPendingLow = sessionAttributes.pendingGroceryFromLow || sessionAttributes.pendingUnknownItem;

    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
          || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent')
      && hasPendingLow;
  },

  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const pendingItem = sessionAttributes.pendingGroceryFromLow || sessionAttributes.pendingUnknownItem;
    const isYes = Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';

    // Clear pending state
    sessionAttributes.pendingGroceryFromLow = null;
    sessionAttributes.pendingUnknownItem = null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    if (!isYes) {
      return handlerInput.responseBuilder
        .speak("Okay. Anything else?")
        .reprompt("What would you like to do?")
        .getResponse();
    }

    // Add to grocery list
    const householdCode = getHouseholdCode(handlerInput);

    try {
      const result = await addGroceryItemWithDefaults(
        householdCode,
        pendingItem.name,
        null, // no quantity
        pendingItem.store,
        pendingItem.category
      );

      if (result.success) {
        return handlerInput.responseBuilder
          .speak(`Added ${pendingItem.name} to your grocery list. Anything else?`)
          .reprompt("What else would you like to do?")
          .getResponse();
      }
    } catch (error) {
      console.log('Add from low error:', error.message);
    }

    return handlerInput.responseBuilder
      .speak(`I couldn't add ${pendingItem.name} right now. Try again.`)
      .reprompt("What would you like to do?")
      .getResponse();
  }
};

/**
 * Format options for natural speech
 * ["a", "b", "c"] -> "a, b, or c"
 */
function formatOptions(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  const last = items[items.length - 1];
  const rest = items.slice(0, -1);
  return `${rest.join(', ')}, or ${last}`;
}

module.exports = {
  MarkAsLowIntentHandler,
  MarkAsLowDisambiguationHandler,
  ConfirmAddFromLowHandler
};
