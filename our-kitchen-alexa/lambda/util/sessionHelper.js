/**
 * Session Attribute Helpers
 * Convenience functions for common session operations
 */

function isLinked(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  return sessionAttributes.isLinked === true;
}

function getHouseholdCode(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  return sessionAttributes.householdCode;
}

function setPendingAction(handlerInput, action, params = {}) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.pendingAction = action;
  sessionAttributes.pendingParams = params;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function getPendingAction(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  return {
    action: sessionAttributes.pendingAction,
    params: sessionAttributes.pendingParams || {}
  };
}

function clearPendingAction(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.pendingAction = null;
  sessionAttributes.pendingParams = null;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

/**
 * Mark persistent attributes as needing save
 * Call this after modifying persistent attributes
 */
function markPersistentDirty(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.persistentAttributesDirty = true;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

module.exports = {
  isLinked,
  getHouseholdCode,
  setPendingAction,
  getPendingAction,
  clearPendingAction,
  markPersistentDirty
};
