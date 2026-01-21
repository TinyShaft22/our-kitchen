/**
 * Grocery List DataSource Builder
 * Groups items by store for visual display
 */

/**
 * Build datasource for grocery list APL template
 * @param {Array} items - Array of grocery items with name, store, category
 * @param {string} headerTitle - Title for the list header
 * @param {number} totalCount - Total items (for "X items" subtitle)
 * @returns {Object} APL datasource object
 */
function buildGroceryListDataSource(items, headerTitle = 'Grocery List', totalCount = null) {
  // Group items by store
  const storeGroups = {};
  items.forEach(item => {
    const store = item.store || 'Other';
    if (!storeGroups[store]) {
      storeGroups[store] = [];
    }
    storeGroups[store].push(item);
  });

  // Build list items with store headers
  const listItems = [];
  Object.entries(storeGroups).forEach(([store, storeItems]) => {
    // Add store header as a list item
    listItems.push({
      primaryText: `<b>${store}</b>`,
      secondaryText: `${storeItems.length} item${storeItems.length === 1 ? '' : 's'}`
    });

    // Add items under this store
    storeItems.forEach(item => {
      listItems.push({
        primaryText: item.name,
        secondaryText: item.category || ''
      });
    });
  });

  const count = totalCount || items.length;
  const subtitle = `${count} item${count === 1 ? '' : 's'}`;

  return {
    groceryListData: {
      type: 'object',
      objectId: 'groceryListDS',
      headerTitle: headerTitle,
      headerSubtitle: subtitle,
      listItems: listItems
    }
  };
}

module.exports = { buildGroceryListDataSource };
