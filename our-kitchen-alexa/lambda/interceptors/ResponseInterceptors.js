/**
 * Response Interceptors
 * Run after every handler to cleanup/save
 */

/**
 * SavePersistentAttributesInterceptor
 * Auto-saves persistent attributes after every response
 * Only saves if attributes were modified (dirty flag pattern)
 */
const SavePersistentAttributesInterceptor = {
  async process(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes() || {};

    // Only save if we've marked attributes as dirty
    if (sessionAttributes.persistentAttributesDirty) {
      try {
        await handlerInput.attributesManager.savePersistentAttributes();
        console.log('Saved persistent attributes');

        // Clear dirty flag
        sessionAttributes.persistentAttributesDirty = false;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
      } catch (error) {
        console.error('Failed to save persistent attributes:', error.message);
      }
    }
  }
};

module.exports = {
  SavePersistentAttributesInterceptor
};
