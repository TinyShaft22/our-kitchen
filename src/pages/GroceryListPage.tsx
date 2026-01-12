import { useState, useMemo } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useMeals } from '../hooks/useMeals';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { useGroceryList } from '../hooks/useGroceryList';
import { generateGroceryItems } from '../utils/generateGroceryItems';
import { GroceryItemCard } from '../components/grocery/GroceryItemCard';
import { CATEGORIES } from '../types';
import type { GroceryItem, Category } from '../types';

function GroceryListPage() {
  const { householdCode } = useHousehold();
  const { meals, loading: mealsLoading } = useMeals(householdCode);
  const { currentWeek, loading: weekLoading } = useWeeklyPlan(householdCode);
  const { items, loading: groceryLoading, generateFromWeeklyPlan } = useGroceryList(householdCode);
  const [generating, setGenerating] = useState(false);

  // Combined loading state
  const loading = mealsLoading || weekLoading || groceryLoading;

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = new Map<Category, GroceryItem[]>();

    // Initialize groups in CATEGORIES order
    for (const cat of CATEGORIES) {
      groups.set(cat.id, []);
    }

    // Add items to their category groups
    for (const item of items) {
      const group = groups.get(item.category);
      if (group) {
        group.push(item);
      }
    }

    // Filter out empty categories and convert to array
    return CATEGORIES.filter((cat) => {
      const group = groups.get(cat.id);
      return group && group.length > 0;
    }).map((cat) => ({
      category: cat,
      items: groups.get(cat.id) || [],
    }));
  }, [items]);

  const handleGenerate = async () => {
    if (!currentWeek?.meals.length) {
      return;
    }

    setGenerating(true);
    try {
      const generatedItems = generateGroceryItems(meals, currentWeek.meals);
      await generateFromWeeklyPlan(generatedItems);
    } catch (err) {
      console.error('Failed to generate grocery list:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-charcoal">Grocery List</h1>
        <p className="text-warm-gray mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32">
      <h1 className="text-xl font-semibold text-charcoal">Grocery List</h1>
      <p className="text-sm text-warm-gray mt-1">
        {items.length} item{items.length !== 1 ? 's' : ''}
      </p>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-warm-gray">No items yet.</p>
          <p className="text-warm-gray mt-1">Generate from your weekly plan!</p>
        </div>
      )}

      {/* Grouped items */}
      {groupedItems.length > 0 && (
        <div className="mt-6 space-y-6">
          {groupedItems.map(({ category, items: categoryItems }) => (
            <section key={category.id}>
              <h2 className="text-lg font-semibold text-charcoal mb-3">
                {category.name}
              </h2>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <GroceryItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Generate FAB */}
      <button
        onClick={handleGenerate}
        disabled={generating || !currentWeek?.meals.length}
        className="fixed bottom-24 right-4 w-14 h-14 bg-terracotta text-white rounded-full shadow-lg flex items-center justify-center hover:bg-terracotta/90 active:bg-terracotta/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Generate grocery list from weekly meals"
      >
        {generating ? (
          <span className="text-sm">...</span>
        ) : (
          <span className="text-xl">🛒</span>
        )}
      </button>
    </div>
  );
}

export default GroceryListPage;
