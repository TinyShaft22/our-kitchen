/**
 * Response Interceptors
 * Run after every handler to cleanup/save
 */

/**
 * SavePersistentAttributesInterceptor
 * Auto-saves persistent attributes after every response
 * - Saves cooking progress when in cooking mode (for resume capability)
 * - Saves other attributes if dirty flag is set
 */
const SavePersistentAttributesInterceptor = {
  async process(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes() || {};

    // Check if cooking mode is active - persist progress for resume
    if (sessionAttributes.cookingMode === true && sessionAttributes.cookingRecipe) {
      try {
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes() || {};

        // Store cooking progress
        persistentAttributes.cookingProgress = {
          recipeId: sessionAttributes.cookingRecipe.id || '',
          recipeName: sessionAttributes.cookingRecipe.name || '',
          currentStep: sessionAttributes.cookingStep || 0,
          totalSteps: (sessionAttributes.cookingSteps || []).length,
          householdCode: sessionAttributes.householdCode || '',
          timestamp: Date.now()
        };

        handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
        await handlerInput.attributesManager.savePersistentAttributes();
        console.log('Saved cooking progress:', persistentAttributes.cookingProgress.recipeName,
          'step', persistentAttributes.cookingProgress.currentStep);
      } catch (error) {
        console.error('Failed to save cooking progress:', error.message);
      }
    }

    // Existing dirty flag save logic
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
