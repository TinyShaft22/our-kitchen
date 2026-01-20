/**
 * Recipe Detail DataSource Builder
 * Transforms recipe data from Firebase into APL datasource format
 */

/**
 * Build datasource for recipe detail APL template
 * @param {Object} recipe - Recipe object with id, name, imageUrl, ingredients, instructions
 * @returns {Object} APL datasource object
 */
function buildRecipeDetailDataSource(recipe) {
  // Extract ingredient names from the ingredients array
  const ingredientNames = (recipe.ingredients || []).map(i => i.name);

  return {
    recipeDetailData: {
      type: 'object',
      objectId: 'recipeDetailDS',
      mealId: recipe.id || '',
      mealName: recipe.name || 'Recipe',
      imageUrl: recipe.imageUrl || '',
      ingredients: ingredientNames,
      instructions: recipe.instructions || 'No instructions available'
    }
  };
}

module.exports = { buildRecipeDetailDataSource };
