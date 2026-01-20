/**
 * Cooking Step DataSource Builder
 * Transforms recipe data into APL datasource format for cooking mode
 */

const { parseInstructionsToSteps } = require('../util/stepParser');

/**
 * Build datasource for cooking step APL template
 * @param {Object} recipe - Recipe object with name, ingredients, instructions
 * @param {number} currentStep - Current step index (0 = ingredients)
 * @returns {Object} APL datasource object
 */
function buildCookingStepDataSource(recipe, currentStep = 0) {
  // Parse instructions into steps
  const steps = parseInstructionsToSteps(
    recipe.instructions || '',
    recipe.ingredients || []
  );

  // Clamp currentStep to valid range
  const clampedStep = Math.max(0, Math.min(currentStep, steps.length - 1));

  return {
    cookingData: {
      type: 'object',
      objectId: 'cookingStepDS',
      mealName: recipe.name || 'Recipe',
      currentStep: clampedStep,
      totalSteps: steps.length,
      steps: steps.map(step => ({
        number: step.number,
        title: step.title,
        content: step.content,
        isIngredients: step.isIngredients
      }))
    }
  };
}

module.exports = { buildCookingStepDataSource };
