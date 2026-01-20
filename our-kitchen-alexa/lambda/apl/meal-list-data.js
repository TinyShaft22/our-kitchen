/**
 * Meal List DataSource Builder
 * Transforms meal data from Firebase into APL datasource format
 */

/**
 * Build datasource for meal list APL template
 * @param {Array} meals - Array of meal objects with id, name, imageUrl
 * @param {string} headerTitle - Title for the list header (default: 'Our Kitchen')
 * @returns {Object} APL datasource object
 */
function buildMealListDataSource(meals, headerTitle = 'Our Kitchen') {
  return {
    mealListData: {
      type: 'object',
      objectId: 'mealListDS',
      headerTitle: headerTitle,
      listItems: meals.map(meal => ({
        primaryText: meal.name,
        imageSource: meal.imageUrl || '',
        mealId: meal.id
      }))
    }
  };
}

module.exports = { buildMealListDataSource };
