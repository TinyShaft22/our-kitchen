import { useState, useMemo } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useMeals } from '../hooks/useMeals';
import { MealCard } from '../components/meals/MealCard';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { AddMealModal } from '../components/meals/AddMealModal';
import { EditMealModal } from '../components/meals/EditMealModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { Meal } from '../types';

interface CollapsibleSectionProps {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, count, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between bg-white rounded-soft shadow-soft px-4 py-3 mb-3 hover:bg-cream/50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
          <span className="text-sm text-charcoal/60 bg-cream px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <span
          className={`text-terracotta text-xl transition-transform duration-200 ${
            isExpanded ? 'rotate-0' : '-rotate-90'
          }`}
        >
          ▼
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

interface SubcategorySectionProps {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function SubcategorySection({ title, count, isExpanded, onToggle, children }: SubcategorySectionProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between bg-cream/50 rounded-soft px-3 py-2 mb-2 hover:bg-cream transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-charcoal/40 text-sm">📁</span>
          <span className="text-sm font-medium text-charcoal">{title}</span>
          <span className="text-xs text-charcoal/50 bg-white px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <span
          className={`text-charcoal/40 text-sm transition-transform duration-200 ${
            isExpanded ? 'rotate-0' : '-rotate-90'
          }`}
        >
          ▼
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pl-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Group meals by subcategory
interface MealsBySubcategory {
  [subcategory: string]: Meal[];
}

function groupBySubcategory(meals: Meal[]): MealsBySubcategory {
  const groups: MealsBySubcategory = {};

  for (const meal of meals) {
    const key = meal.subcategory || '';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(meal);
  }

  // Sort meals within each group
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.name.localeCompare(b.name));
  }

  return groups;
}

function MealLibrary() {
  const { householdCode } = useHousehold();
  const { meals, loading, addMeal, updateMeal, deleteMeal } = useMeals(householdCode);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingMeal, setDeletingMeal] = useState<Meal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mainDishesExpanded, setMainDishesExpanded] = useState(true);
  const [bakingExpanded, setBakingExpanded] = useState(true);
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Split meals into main dishes and baking recipes, grouped by subcategory
  const { mainDishes, bakingRecipes, mainBySubcategory, bakingBySubcategory, existingSubcategories } = useMemo(() => {
    const main: Meal[] = [];
    const baking: Meal[] = [];
    const subcategorySet = new Set<string>();

    for (const meal of meals) {
      if (meal.isBaking) {
        baking.push(meal);
      } else {
        main.push(meal);
      }
      if (meal.subcategory) {
        subcategorySet.add(meal.subcategory);
      }
    }

    return {
      mainDishes: main,
      bakingRecipes: baking,
      mainBySubcategory: groupBySubcategory(main),
      bakingBySubcategory: groupBySubcategory(baking),
      existingSubcategories: Array.from(subcategorySet).sort(),
    };
  }, [meals]);

  // Get sorted subcategory keys with "Uncategorized" first
  const getSortedSubcategoryKeys = (groups: MealsBySubcategory): string[] => {
    const keys = Object.keys(groups).sort();
    // Move empty string (uncategorized) to front if it exists
    const uncatIndex = keys.indexOf('');
    if (uncatIndex > 0) {
      keys.splice(uncatIndex, 1);
      keys.unshift('');
    }
    return keys;
  };

  const toggleSubcategory = (key: string) => {
    setExpandedSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Check if we need to show subcategories (more than just uncategorized)
  const hasMainSubcategories = Object.keys(mainBySubcategory).length > 1 ||
    (Object.keys(mainBySubcategory).length === 1 && !mainBySubcategory['']);
  const hasBakingSubcategories = Object.keys(bakingBySubcategory).length > 1 ||
    (Object.keys(bakingBySubcategory).length === 1 && !bakingBySubcategory['']);

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingMeal(null);
  };

  const handleUpdateMeal = async (updates: Omit<Meal, 'id' | 'householdCode'>) => {
    if (editingMeal) {
      await updateMeal(editingMeal.id, updates);
    }
  };

  const handleDelete = (meal: Meal) => {
    setDeletingMeal(meal);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingMeal(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingMeal) {
      await deleteMeal(deletingMeal.id);
      handleCloseDeleteDialog();
    }
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSaveMeal = async (mealData: Omit<Meal, 'id' | 'householdCode'>) => {
    await addMeal(mealData);
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-charcoal mb-4">Meal Library</h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-warm-gray">Loading meals...</div>
        </div>
      </div>
    );
  }

  const hasNoMeals = mainDishes.length === 0 && bakingRecipes.length === 0;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-charcoal mb-4">Meal Library</h1>

      {hasNoMeals ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-warm-gray text-lg">No meals yet.</p>
          <p className="text-warm-gray mt-1">Tap + to add one!</p>
        </div>
      ) : (
        <>
          {/* Main Dishes Section */}
          {mainDishes.length > 0 && (
            <CollapsibleSection
              title="Main Dishes"
              count={mainDishes.length}
              isExpanded={mainDishesExpanded}
              onToggle={() => setMainDishesExpanded(!mainDishesExpanded)}
            >
              {hasMainSubcategories ? (
                // Show with subcategory folders
                getSortedSubcategoryKeys(mainBySubcategory).map((subcatKey) => {
                  const subcatMeals = mainBySubcategory[subcatKey];
                  const displayName = subcatKey || 'Uncategorized';
                  const expandKey = `main-${subcatKey}`;
                  return (
                    <SubcategorySection
                      key={subcatKey}
                      title={displayName}
                      count={subcatMeals.length}
                      isExpanded={expandedSubcategories.has(expandKey)}
                      onToggle={() => toggleSubcategory(expandKey)}
                    >
                      <div className="grid grid-cols-1 gap-4">
                        {subcatMeals.map((meal) => (
                          <MealCard
                            key={meal.id}
                            meal={meal}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </SubcategorySection>
                  );
                })
              ) : (
                // No subcategories, show flat list
                <div className="grid grid-cols-1 gap-4">
                  {mainDishes.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </CollapsibleSection>
          )}

          {/* Baking & Desserts Section */}
          {bakingRecipes.length > 0 && (
            <CollapsibleSection
              title="Baking & Desserts"
              count={bakingRecipes.length}
              isExpanded={bakingExpanded}
              onToggle={() => setBakingExpanded(!bakingExpanded)}
            >
              {hasBakingSubcategories ? (
                // Show with subcategory folders
                getSortedSubcategoryKeys(bakingBySubcategory).map((subcatKey) => {
                  const subcatMeals = bakingBySubcategory[subcatKey];
                  const displayName = subcatKey || 'Uncategorized';
                  const expandKey = `baking-${subcatKey}`;
                  return (
                    <SubcategorySection
                      key={subcatKey}
                      title={displayName}
                      count={subcatMeals.length}
                      isExpanded={expandedSubcategories.has(expandKey)}
                      onToggle={() => toggleSubcategory(expandKey)}
                    >
                      <div className="grid grid-cols-1 gap-4">
                        {subcatMeals.map((meal) => (
                          <MealCard
                            key={meal.id}
                            meal={meal}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </SubcategorySection>
                  );
                })
              ) : (
                // No subcategories, show flat list
                <div className="grid grid-cols-1 gap-4">
                  {bakingRecipes.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </CollapsibleSection>
          )}
        </>
      )}

      <FloatingActionButton
        onClick={handleAddClick}
        ariaLabel="Add new meal"
      />

      {householdCode && (
        <AddMealModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveMeal}
          householdCode={householdCode}
          existingSubcategories={existingSubcategories}
        />
      )}

      {editingMeal && householdCode && (
        <EditMealModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          meal={editingMeal}
          onSave={handleUpdateMeal}
          householdCode={householdCode}
          existingSubcategories={existingSubcategories}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Meal"
        message={`Are you sure you want to delete "${deletingMeal?.name}"? This cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

export default MealLibrary;
