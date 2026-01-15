import { useState, useMemo } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useMeals } from '../hooks/useMeals';
import { MealCard } from '../components/meals/MealCard';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { AddMealModal } from '../components/meals/AddMealModal';
import { EditMealModal } from '../components/meals/EditMealModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { FolderManagerModal } from '../components/meals/FolderManagerModal';
import { buildFolderTree, getAllFolderPaths, type FolderTreeNode } from '../utils/subcategoryUtils';
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

// Nested folder section for Baking (recursive)
interface NestedFolderSectionProps {
  node: FolderTreeNode;
  depth: number;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}

function NestedFolderSection({
  node,
  depth,
  expandedPaths,
  onToggle,
  onEdit,
  onDelete,
}: NestedFolderSectionProps) {
  // Root node (empty name) renders children directly without header
  if (!node.name) {
    return (
      <>
        {/* Render child folders first */}
        {Array.from(node.children.values()).map((child) => (
          <NestedFolderSection
            key={child.fullPath}
            node={child}
            depth={depth}
            expandedPaths={expandedPaths}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {/* Then render meals at root level */}
        {node.meals.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mb-4">
            {node.meals
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
          </div>
        )}
      </>
    );
  }

  const isExpanded = expandedPaths.has(node.fullPath);

  return (
    <div className="mb-4" style={{ marginLeft: `${depth * 16}px` }}>
      {/* Folder header */}
      <button
        onClick={() => onToggle(node.fullPath)}
        className="w-full flex items-center justify-between bg-cream/50 rounded-soft px-3 py-2 mb-2 hover:bg-cream transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-charcoal/40 text-sm">{isExpanded ? '📂' : '📁'}</span>
          <span className="text-sm font-medium text-charcoal">{node.name}</span>
          <span className="text-xs text-charcoal/50 bg-white px-1.5 py-0.5 rounded-full">
            {node.totalMealCount}
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

      {/* Expanded content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pl-4">
          {/* Render child folders first */}
          {Array.from(node.children.values()).map((child) => (
            <NestedFolderSection
              key={child.fullPath}
              node={child}
              depth={0}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          {/* Then render meals at this level */}
          {node.meals.length > 0 && (
            <div className="grid grid-cols-1 gap-4 mb-2">
              {node.meals
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
            </div>
          )}
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
  const [expandedBakingPaths, setExpandedBakingPaths] = useState<Set<string>>(new Set());
  const [isFolderManagerOpen, setIsFolderManagerOpen] = useState(false);

  // Split meals into main dishes and baking recipes, grouped by subcategory
  const { mainDishes, bakingRecipes, mainBySubcategory, existingSubcategories } = useMemo(() => {
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
      existingSubcategories: Array.from(subcategorySet).sort(),
    };
  }, [meals]);

  // Build folder tree for baking recipes (nested folders)
  const bakingFolderTree = useMemo(
    () => buildFolderTree(bakingRecipes),
    [bakingRecipes]
  );

  // Extract all baking paths for FolderManagerModal
  const existingBakingPaths = useMemo(
    () => getAllFolderPaths(bakingRecipes),
    [bakingRecipes]
  );

  // Toggle baking folder expansion
  const toggleBakingPath = (path: string) => {
    setExpandedBakingPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Handle creating new folder (adds to existingBakingPaths via meal updates)
  const handleCreateFolder = (path: string) => {
    // Folders are implicitly created when a meal is assigned to them
    // For now, just close the modal - the path will be available when adding/editing meals
    // In a future enhancement, we could store empty folder paths in Firestore
    console.log('Folder created:', path);
  };

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

  // Check if we need to show subcategories for Main Dishes (more than just uncategorized)
  const hasMainSubcategories = Object.keys(mainBySubcategory).length > 1 ||
    (Object.keys(mainBySubcategory).length === 1 && !mainBySubcategory['']);

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
    <div className="p-4 pb-32">
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

          {/* Baking & Desserts Section - with nested folders */}
          {bakingRecipes.length > 0 && (
            <div className="mb-6">
              {/* Custom header with Manage Folders button */}
              <div className="flex items-center gap-2 bg-white rounded-soft shadow-soft px-4 py-3 mb-3">
                <button
                  onClick={() => setBakingExpanded(!bakingExpanded)}
                  className="flex-1 flex items-center justify-between hover:bg-cream/50 -mx-2 px-2 py-1 rounded-soft transition-colors"
                  aria-expanded={bakingExpanded}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-charcoal">Baking & Desserts</h2>
                    <span className="text-sm text-charcoal/60 bg-cream px-2 py-0.5 rounded-full">
                      {bakingRecipes.length}
                    </span>
                  </div>
                  <span
                    className={`text-terracotta text-xl transition-transform duration-200 ${
                      bakingExpanded ? 'rotate-0' : '-rotate-90'
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {/* Manage Folders button */}
                <button
                  onClick={() => setIsFolderManagerOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-sage/30 hover:bg-sage/50 text-charcoal rounded-soft transition-colors"
                  aria-label="Manage baking folders"
                >
                  <span>📁</span>
                  <span className="hidden sm:inline">Manage</span>
                </button>
              </div>
              {/* Collapsible content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  bakingExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <NestedFolderSection
                  node={bakingFolderTree}
                  depth={0}
                  expandedPaths={expandedBakingPaths}
                  onToggle={toggleBakingPath}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </div>
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

      <FolderManagerModal
        isOpen={isFolderManagerOpen}
        onClose={() => setIsFolderManagerOpen(false)}
        existingPaths={existingBakingPaths}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
}

export default MealLibrary;
