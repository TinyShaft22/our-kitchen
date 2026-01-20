/**
 * Grocery Handlers
 * Read, Add, Undo, Remove, CheckOff grocery items
 */
const Alexa = require('ask-sdk-core');
const { getGroceryList, addGroceryItem, removeGroceryItem } = require('../api/firebaseClient');
const { isLinked, getHouseholdCode } = require('../util/sessionHelper');
const { createPinPromptResponse } = require('./HouseholdHandlers');

/**
 * ReadGroceryListIntentHandler
 * "What's on the grocery list?" / "What do we need to buy?"
 *
 * Per CONTEXT.md:
 * - Names only, cap at 5 items
 * - "and X more" if more than 5
 */
const ReadGroceryListIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReadGroceryListIntent';
  },

  async handle(handlerInput) {
    // Check if linked
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'ReadGroceryList');
    }

    const householdCode = getHouseholdCode(handlerInput);

    try {
      const result = await getGroceryList(householdCode);
      const items = result.items || [];

      if (items.length === 0) {
        return handlerInput.responseBuilder
          .speak("Your grocery list is empty. Say 'add' followed by an item to add something.")
          .reprompt("What would you like to add to the list?")
          .getResponse();
      }

      // Cap at 5 items per CONTEXT.md
      const itemNames = items.slice(0, 5).map(i => i.name);
      const remaining = items.length - 5;

      let speakOutput = `On your list: ${formatList(itemNames)}`;
      if (remaining > 0) {
        speakOutput += `, and ${remaining} more`;
      }
      speakOutput += ". Would you like to add anything?";

      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("What would you like to add, or say check off to mark something done.")
        .getResponse();

    } catch (error) {
      console.log('Read grocery list error:', error.message);
      return handlerInput.responseBuilder
        .speak("I'm having trouble getting your grocery list right now. Try again in a moment.")
        .reprompt("What would you like to do?")
        .getResponse();
    }
  }
};

/**
 * AddGroceryIntentHandler
 * "Add milk to the list" / "We need eggs"
 *
 * Per CONTEXT.md:
 * - Short confirmations: "Added" or "Got it"
 * - Mention undo option
 */
const AddGroceryIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddGroceryIntent';
  },

  async handle(handlerInput) {
    // Check if linked
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'AddGrocery');
    }

    const householdCode = getHouseholdCode(handlerInput);
    const slots = handlerInput.requestEnvelope.request.intent.slots;

    const item = slots.GroceryItem?.value;
    const quantity = slots.Quantity?.value ? parseInt(slots.Quantity.value) : null;

    if (!item) {
      return handlerInput.responseBuilder
        .speak("What would you like to add to the list?")
        .reprompt("Say the name of the item to add.")
        .getResponse();
    }

    try {
      const result = await addGroceryItem(householdCode, item, quantity);

      if (result.success) {
        // Store for undo
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.lastAddedItem = {
          name: item,
          id: result.itemId,
          timestamp: Date.now()
        };
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        // Short confirmation per CONTEXT.md
        const quantityText = quantity ? `${quantity} ` : '';
        const speakOutput = `Added ${quantityText}${item}. Say undo to remove, or add something else.`;

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt("What else would you like to add?")
          .getResponse();
      } else {
        return handlerInput.responseBuilder
          .speak(`I couldn't add ${item} right now. Try again.`)
          .reprompt("What would you like to add?")
          .getResponse();
      }

    } catch (error) {
      console.log('Add grocery error:', error.message);
      return handlerInput.responseBuilder
        .speak("I'm having trouble adding that right now. Try again in a moment.")
        .reprompt("What would you like to add?")
        .getResponse();
    }
  }
};

/**
 * UndoGroceryIntentHandler
 * "Undo" / "Take that back" / "Never mind"
 *
 * Session-scoped: only works immediately after adding
 */
const UndoGroceryIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'UndoGroceryIntent';
  },

  async handle(handlerInput) {
    // Check if linked
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'UndoGrocery');
    }

    const householdCode = getHouseholdCode(handlerInput);
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const lastAdded = sessionAttributes.lastAddedItem;

    // Check if there's something to undo (within 60 seconds)
    if (!lastAdded || (Date.now() - lastAdded.timestamp) > 60000) {
      return handlerInput.responseBuilder
        .speak("There's nothing to undo. Add something to the list first.")
        .reprompt("What would you like to add?")
        .getResponse();
    }

    try {
      await removeGroceryItem(householdCode, lastAdded.name);

      // Clear undo state
      sessionAttributes.lastAddedItem = null;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(`Removed ${lastAdded.name}. What else?`)
        .reprompt("What would you like to do?")
        .getResponse();

    } catch (error) {
      console.log('Undo grocery error:', error.message);
      return handlerInput.responseBuilder
        .speak("I couldn't undo that. Try saying remove and the item name.")
        .reprompt("What would you like to do?")
        .getResponse();
    }
  }
};

/**
 * RemoveGroceryIntentHandler
 * "Remove milk from the list" / "We don't need eggs"
 */
const RemoveGroceryIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemoveGroceryIntent';
  },

  async handle(handlerInput) {
    // Check if linked
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'RemoveGrocery');
    }

    const householdCode = getHouseholdCode(handlerInput);
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const item = slots.GroceryItem?.value;

    if (!item) {
      return handlerInput.responseBuilder
        .speak("What would you like to remove from the list?")
        .reprompt("Say the name of the item to remove.")
        .getResponse();
    }

    try {
      const result = await removeGroceryItem(householdCode, item);

      if (result.success) {
        return handlerInput.responseBuilder
          .speak(`Removed ${item}. Anything else?`)
          .reprompt("What would you like to do?")
          .getResponse();
      } else {
        return handlerInput.responseBuilder
          .speak(`I couldn't find ${item} on the list.`)
          .reprompt("What would you like to do?")
          .getResponse();
      }

    } catch (error) {
      console.log('Remove grocery error:', error.message);
      return handlerInput.responseBuilder
        .speak("I'm having trouble removing that right now. Try again.")
        .reprompt("What would you like to do?")
        .getResponse();
    }
  }
};

/**
 * CheckOffGroceryIntentHandler
 * "Check off milk" / "Got the eggs" / "Picked up bread"
 *
 * Note: This marks item as in-cart, doesn't delete it
 * For now, uses removeGroceryItem since we don't have a checkOff endpoint
 * TODO: Add proper checkOff endpoint to Cloud Functions
 */
const CheckOffGroceryIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckOffGroceryIntent';
  },

  async handle(handlerInput) {
    // Check if linked
    if (!isLinked(handlerInput)) {
      return createPinPromptResponse(handlerInput, 'CheckOffGrocery');
    }

    const householdCode = getHouseholdCode(handlerInput);
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const item = slots.GroceryItem?.value;

    if (!item) {
      return handlerInput.responseBuilder
        .speak("What did you get?")
        .reprompt("Say the name of the item you picked up.")
        .getResponse();
    }

    try {
      // For now, just remove the item (simulates checking off)
      // TODO: Implement proper check-off that sets inCart=true
      const result = await removeGroceryItem(householdCode, item);

      if (result.success) {
        return handlerInput.responseBuilder
          .speak(`Got it, ${item} is checked off. What's next?`)
          .reprompt("What else did you get?")
          .getResponse();
      } else {
        return handlerInput.responseBuilder
          .speak(`I couldn't find ${item} on the list.`)
          .reprompt("What else?")
          .getResponse();
      }

    } catch (error) {
      console.log('Check off grocery error:', error.message);
      return handlerInput.responseBuilder
        .speak("I'm having trouble with that right now. Try again.")
        .reprompt("What would you like to do?")
        .getResponse();
    }
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

module.exports = {
  ReadGroceryListIntentHandler,
  AddGroceryIntentHandler,
  UndoGroceryIntentHandler,
  RemoveGroceryIntentHandler,
  CheckOffGroceryIntentHandler
};
