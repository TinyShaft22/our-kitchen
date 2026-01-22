/**
 * Grocery Handlers
 * Read, Add, Undo, Remove, CheckOff grocery items
 * Enhanced with APL display and duplicate detection
 */
const Alexa = require('ask-sdk-core');
const { getGroceryList, addGroceryItem, removeGroceryItem, checkDuplicateGrocery, lookupHouseholdItem, addGroceryItemWithDefaults } = require('../api/firebaseClient');
const { isLinked, getHouseholdCode } = require('../util/sessionHelper');
const { createPinPromptResponse } = require('./HouseholdHandlers');
const groceryListDocument = require('../apl/grocery-list.json');
const { buildGroceryListDataSource } = require('../apl/grocery-list-data.js');

/**
 * ReadGroceryListIntentHandler
 * "What's on the grocery list?" / "What do we need to buy?"
 * "What do I need at Costco?" (store-filtered)
 *
 * Per CONTEXT.md:
 * - Cap at 5 items when reading aloud
 * - "and X more" if more than 5
 * - Include store names ("eggs from Costco")
 * - Support store filter ("What do I need at Costco?")
 * - APL visual display on Echo Show (grouped by store)
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

    // Check for store filter slot
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const storeSlot = slots.StoreName?.value;

    try {
      // Pass store filter to API if provided
      const result = await getGroceryList(householdCode, storeSlot);
      const items = result.items || [];

      if (items.length === 0) {
        const emptyMessage = storeSlot
          ? `You don't have anything on the list for ${storeSlot}. Say 'add' followed by an item to add something.`
          : "Your grocery list is empty. Say 'add' followed by an item to add something.";

        return handlerInput.responseBuilder
          .speak(emptyMessage)
          .reprompt("What would you like to add to the list?")
          .getResponse();
      }

      // Build voice output with store names
      const displayItems = items.slice(0, 5);
      const remaining = items.length - 5;

      // Format items with store names for voice
      const itemsWithStore = formatItemsWithStore(displayItems);
      let speakOutput;

      if (storeSlot) {
        // Store-filtered: "At Costco: eggs, milk, and 3 more"
        speakOutput = `At ${storeSlot}: ${formatList(itemsWithStore.map(i => i.name))}`;
      } else {
        // All items: "On your list: eggs from Costco, milk from Trader Joes..."
        speakOutput = `On your list: ${formatList(itemsWithStore.map(i => i.display))}`;
      }

      if (remaining > 0) {
        speakOutput += `, and ${remaining} more`;
      }
      speakOutput += ". Would you like to add anything?";

      // Build response
      const responseBuilder = handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("What would you like to add, or say check off to mark something done.");

      // Add APL directive if device supports it
      if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
        const headerTitle = storeSlot ? `${storeSlot} List` : 'Grocery List';
        responseBuilder.addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          token: 'groceryListToken',
          document: groceryListDocument,
          datasources: buildGroceryListDataSource(items, headerTitle, items.length)
        });
      }

      return responseBuilder.getResponse();

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
 * - Check for duplicates before adding
 * - Duplicate detected: "You already have X on the list. Add duplicate?"
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
      // Lookup saved household item first for store/category defaults
      let savedItem = null;
      try {
        const lookup = await lookupHouseholdItem(householdCode, item);
        if (lookup.found) {
          savedItem = lookup.item;
        }
      } catch (lookupError) {
        // Lookup failed, proceed with defaults
        console.log('Household item lookup failed, using defaults:', lookupError.message);
      }

      // Use saved item name if found (preserves proper capitalization)
      const itemName = savedItem ? savedItem.name : item;

      // Check for duplicate before adding
      const dupCheck = await checkDuplicateGrocery(householdCode, itemName);

      if (dupCheck.exists) {
        // Store pending add in session for confirmation
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.pendingGroceryAdd = {
          item: itemName,
          quantity: quantity,
          existingItem: dupCheck.existingItem,
          savedItem: savedItem // Store for use if user confirms
        };
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const existingName = dupCheck.existingItem.name;
        return handlerInput.responseBuilder
          .speak(`You already have ${existingName} on the list. Would you like to add a duplicate?`)
          .reprompt("Say yes to add another, or no to cancel.")
          .getResponse();
      }

      // No duplicate - proceed with add
      // Use saved store/category if found
      let result;
      if (savedItem) {
        result = await addGroceryItemWithDefaults(
          householdCode,
          savedItem.name,
          quantity,
          savedItem.store,
          savedItem.category
        );
      } else {
        result = await addGroceryItem(householdCode, item, quantity);
      }

      if (result.success) {
        // Store for undo - use itemName for proper capitalization
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.lastAddedItem = {
          name: itemName,
          id: result.itemId,
          timestamp: Date.now()
        };
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        // Short confirmation per CONTEXT.md
        const quantityText = quantity ? `${quantity} ` : '';
        const speakOutput = `Added ${quantityText}${itemName}. Say undo to remove, or add something else.`;

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt("What else would you like to add?")
          .getResponse();
      } else {
        return handlerInput.responseBuilder
          .speak(`I couldn't add ${itemName} right now. Try again.`)
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
 * ConfirmDuplicateIntentHandler
 * Handles AMAZON.YesIntent / AMAZON.NoIntent after duplicate detection
 * Only triggers when pendingGroceryAdd is in session
 */
const ConfirmDuplicateIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent'
          || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent')
      && sessionAttributes.pendingGroceryAdd;
  },

  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const pending = sessionAttributes.pendingGroceryAdd;
    const isYes = Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';

    // Clear pending state
    sessionAttributes.pendingGroceryAdd = null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    if (!isYes) {
      return handlerInput.responseBuilder
        .speak("Okay, I didn't add it. Anything else?")
        .reprompt("What would you like to do?")
        .getResponse();
    }

    // User confirmed - add the duplicate
    // Use saved store/category if available from household item lookup
    const householdCode = getHouseholdCode(handlerInput);
    try {
      let result;
      if (pending.savedItem) {
        result = await addGroceryItemWithDefaults(
          householdCode,
          pending.savedItem.name,
          pending.quantity,
          pending.savedItem.store,
          pending.savedItem.category
        );
      } else {
        result = await addGroceryItem(householdCode, pending.item, pending.quantity);
      }

      if (result.success) {
        // Store for undo
        sessionAttributes.lastAddedItem = {
          name: pending.item,
          id: result.itemId,
          timestamp: Date.now()
        };
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
          .speak(`Added another ${pending.item}. Say undo to remove.`)
          .reprompt("What else would you like to add?")
          .getResponse();
      }
    } catch (error) {
      console.log('Confirm duplicate add error:', error.message);
    }

    return handlerInput.responseBuilder
      .speak("I couldn't add that right now. Try again.")
      .reprompt("What would you like to do?")
      .getResponse();
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

/**
 * Format items with store names for voice output
 * @param {Array} items - Array of grocery items with name and store
 * @returns {Array} Array of {name, display} where display includes store
 */
function formatItemsWithStore(items) {
  return items.map(item => {
    if (item.store) {
      return {
        name: item.name,
        display: `${item.name} from ${item.store}`
      };
    }
    return {
      name: item.name,
      display: item.name
    };
  });
}

module.exports = {
  ReadGroceryListIntentHandler,
  AddGroceryIntentHandler,
  ConfirmDuplicateIntentHandler,
  UndoGroceryIntentHandler,
  RemoveGroceryIntentHandler,
  CheckOffGroceryIntentHandler
};
