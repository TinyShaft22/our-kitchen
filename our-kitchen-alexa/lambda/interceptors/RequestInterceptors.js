/**
 * Request Interceptors
 * Run before every handler to prepare context
 */

/**
 * LogRequestInterceptor
 * Logs incoming request for debugging
 */
const LogRequestInterceptor = {
  async process(handlerInput) {
    const requestType = handlerInput.requestEnvelope.request.type;
    const intentName = handlerInput.requestEnvelope.request.intent?.name || 'N/A';
    console.log(`Request: ${requestType} | Intent: ${intentName}`);
  }
};

/**
 * LoadHouseholdInterceptor
 * Loads persistent attributes and makes household state available in session
 */
const LoadHouseholdInterceptor = {
  async process(handlerInput) {
    const attributesManager = handlerInput.attributesManager;

    try {
      const persistentAttributes = await attributesManager.getPersistentAttributes() || {};

      // Make household code available in session attributes for easy access
      const sessionAttributes = attributesManager.getSessionAttributes() || {};
      sessionAttributes.householdCode = persistentAttributes.householdCode || null;
      sessionAttributes.isLinked = !!persistentAttributes.householdCode;
      attributesManager.setSessionAttributes(sessionAttributes);

      console.log('Loaded household state:', {
        householdCode: persistentAttributes.householdCode ? '***' : null,
        isLinked: !!persistentAttributes.householdCode
      });
    } catch (error) {
      // If persistence fails, continue with unlinked state
      console.error('Failed to load persistent attributes:', error.message);
      const sessionAttributes = attributesManager.getSessionAttributes() || {};
      sessionAttributes.householdCode = null;
      sessionAttributes.isLinked = false;
      attributesManager.setSessionAttributes(sessionAttributes);
    }
  }
};

module.exports = {
  LogRequestInterceptor,
  LoadHouseholdInterceptor
};
