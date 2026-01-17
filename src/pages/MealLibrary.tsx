import { useState, useMemo } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useMeals } from '../hooks/useMeals';
import { useFolders } from '../hooks/useFolders';
import { MealCard } from '../components/meals/MealCard';
import { MealGridCard } from '../components/meals/MealGridCard';
import { MealDetailModal } from '../components/meals/MealDetailModal';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { AddMealModal } from '../components/meals/AddMealModal';
import { EditMealModal } from '../components/meals/EditMealModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { FolderManagerModal } from '../components/meals/FolderManagerModal';
import { buildFolderTree, getAllFolderPaths, type FolderTreeNode } from '../utils/subcategoryUtils';
import type { Meal } from '../types';

type ViewMode = 'list' | 'grid';

interface SubcategorySectionProps {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function SubcategorySection({ title, count, isExpanded, onToggle, children }: SubcategorySectionProps) {
  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="group w-full flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-soft px-4 py-3 mb-2 shadow-soft hover:shadow-lifted transition-all duration-200"
        style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        aria-expanded={isExpanded}
      >
        {/* Folder icon with color */}
        <div className={`w-10 h-10 rounded-soft flex items-center justify-center transition-colors ${
          isExpanded ? 'bg-terracotta/10' : 'bg-sage/10'
        }`}>
          <span className="text-xl">{isExpanded ? '📂' : '📁'}</span>
        </div>

        {/* Title and count */}
        <div className="flex-1 text-left">
          <span className="font-display font-medium text-charcoal">{title}</span>
          <span className="ml-2 text-xs text-charcoal/50 bg-cream px-2 py-0.5 rounded-full">
            {count} recipe{count !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Chevron */}
        <span
          className={`text-terracotta/60 text-sm transition-transform duration-200 group-hover:text-terracotta ${
            isExpanded ? 'rotate-0' : '-rotate-90'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          ▼
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ transitionTimingFunction: 'var(--ease-spring)' }}
      >
        <div className="pl-4 border-l-2 border-sage/30 ml-5">
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
    <div className="mb-3" style={{ marginLeft: `${depth * 12}px` }}>
      {/* Folder header */}
      <button
        onClick={() => onToggle(node.fullPath)}
        className="group w-full flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-soft px-4 py-3 mb-2 shadow-soft hover:shadow-lifted transition-all duration-200"
        style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        aria-expanded={isExpanded}
      >
        {/* Folder icon with color */}
        <div className={`w-10 h-10 rounded-soft flex items-center justify-center transition-colors ${
          isExpanded ? 'bg-honey/20' : 'bg-terracotta/10'
        }`}>
          <span className="text-xl">{isExpanded ? '📂' : '📁'}</span>
        </div>

        {/* Title and count */}
        <div className="flex-1 text-left">
          <span className="font-display font-medium text-charcoal">{node.name}</span>
          <span className="ml-2 text-xs text-charcoal/50 bg-cream px-2 py-0.5 rounded-full">
            {node.totalMealCount} recipe{node.totalMealCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Chevron */}
        <span
          className={`text-terracotta/60 text-sm transition-transform duration-200 group-hover:text-terracotta ${
            isExpanded ? 'rotate-0' : '-rotate-90'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          ▼
        </span>
      </button>

      {/* Expanded content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ transitionTimingFunction: 'var(--ease-spring)' }}
      >
        <div className="pl-4 border-l-2 border-honey/30 ml-5">
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
  const { folders, addFolder, deleteFolder } = useFolders(householdCode);
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
  const [folderManagerType, setFolderManagerType] = useState<'main' | 'baking'>('baking');

  // View mode and detail modal state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  // Extract all baking paths for FolderManagerModal (combine meal paths + persisted folders)
  const existingBakingPaths = useMemo(() => {
    const mealPaths = getAllFolderPaths(bakingRecipes);
    const persistedPaths = folders.filter(f => f.type === 'baking').map(f => f.path);
    const allPaths = new Set([...mealPaths, ...persistedPaths]);
    return Array.from(allPaths).sort();
  }, [bakingRecipes, folders]);

  // Extract all main dish paths (subcategories + persisted folders)
  const existingMainPaths = useMemo(() => {
    const subcatPaths = existingSubcategories;
    const persistedPaths = folders.filter(f => f.type === 'main').map(f => f.path);
    const allPaths = new Set([...subcatPaths, ...persistedPaths]);
    return Array.from(allPaths).sort();
  }, [existingSubcategories, folders]);

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

  // Open folder manager for specific type
  const openFolderManager = (type: 'main' | 'baking') => {
    setFolderManagerType(type);
    setIsFolderManagerOpen(true);
  };

  // Handle creating new folder (persists to Firestore)
  const handleCreateFolder = async (path: string) => {
    try {
      await addFolder(path, folderManagerType);
    } catch (err) {
      console.error('Failed to create folder:', err);
      throw err;
    }
  };

  // Handle deleting a folder by path
  const handleDeleteFolder = async (path: string) => {
    const folder = folders.find(f => f.path === path && f.type === folderManagerType);
    if (folder) {
      try {
        await deleteFolder(folder.id);
      } catch (err) {
        console.error('Failed to delete folder:', err);
        throw err;
      }
    }
  };

  // Handle meal selection for detail modal (grid view)
  const handleMealSelect = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedMeal(null);
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
        <div className="hero-gradient -mx-4 -mt-4 px-4 pt-6 pb-4 mb-4">
          <h1 className="text-2xl font-display font-semibold text-charcoal">Meal Library</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-warm-gray">Loading meals...</div>
        </div>
      </div>
    );
  }

  const hasNoMeals = mainDishes.length === 0 && bakingRecipes.length === 0;

  return (
    <div className="pb-32">
      {/* Hero section with view toggle */}
      <div className="hero-gradient px-4 pt-6 pb-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-charcoal">Meal Library</h1>
            <p className="text-charcoal/60 text-sm mt-1">
              {meals.length} recipe{meals.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex bg-white/80 rounded-soft p-1 shadow-soft">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-10 h-10 rounded-soft flex items-center justify-center transition-all ${
                viewMode === 'grid'
                  ? 'bg-terracotta text-white shadow-soft'
                  : 'text-charcoal/60 hover:text-charcoal'
              }`}
              aria-label="Grid view"
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-10 h-10 rounded-soft flex items-center justify-center transition-all ${
                viewMode === 'list'
                  ? 'bg-terracotta text-white shadow-soft'
                  : 'text-charcoal/60 hover:text-charcoal'
              }`}
              aria-label="List view"
              title="List view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4">
        {hasNoMeals ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-warm-gray text-lg font-display">No meals yet.</p>
            <p className="text-warm-gray mt-1">Tap + to add one!</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW - Visual, image-focused */
          <div className="space-y-6">
            {/* Main Dishes Grid */}
            {mainDishes.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <span className="text-xl">🍽️</span>
                  Main Dishes
                  <span className="text-sm font-normal text-charcoal/50">({mainDishes.length})</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {mainDishes
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((meal) => (
                      <MealGridCard key={meal.id} meal={meal} onSelect={handleMealSelect} />
                    ))}
                </div>
              </div>
            )}

            {/* Baking Recipes Grid */}
            {bakingRecipes.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <span className="text-xl">🧁</span>
                  Baking & Desserts
                  <span className="text-sm font-normal text-charcoal/50">({bakingRecipes.length})</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {bakingRecipes
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((meal) => (
                      <MealGridCard key={meal.id} meal={meal} onSelect={handleMealSelect} />
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* LIST VIEW - Organized with folders */
          <>
            {/* Main Dishes Section - with folders */}
            {mainDishes.length > 0 && (
              <div className="mb-6">
                {/* Custom header with Manage Folders button */}
                <div className="flex items-center gap-2 bg-white rounded-soft shadow-soft px-4 py-3 mb-3">
                  <button
                    onClick={() => setMainDishesExpanded(!mainDishesExpanded)}
                    className="flex-1 flex items-center justify-between hover:bg-cream/50 -mx-2 px-2 py-1 rounded-soft transition-colors"
                    aria-expanded={mainDishesExpanded}
                  >
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-display font-semibold text-charcoal">Main Dishes</h2>
                      <span className="text-sm text-charcoal/60 bg-cream px-2 py-0.5 rounded-full">
                        {mainDishes.length}
                      </span>
                    </div>
                    <span
                      className={`text-terracotta text-xl transition-transform duration-200 transition-spring ${
                        mainDishesExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {/* Manage Folders button */}
                  <button
                    onClick={() => openFolderManager('main')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-sage/30 hover:bg-sage/50 text-charcoal rounded-soft transition-colors"
                    aria-label="Manage main dish folders"
                  >
                    <span>📁</span>
                    <span className="hidden sm:inline">Manage</span>
                  </button>
                </div>
                {/* Collapsible content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    mainDishesExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
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
                </div>
              </div>
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
                    <h2 className="text-lg font-display font-semibold text-charcoal">Baking & Desserts</h2>
                    <span className="text-sm text-charcoal/60 bg-cream px-2 py-0.5 rounded-full">
                      {bakingRecipes.length}
                    </span>
                  </div>
                  <span
                    className={`text-terracotta text-xl transition-transform duration-200 transition-spring ${
                      bakingExpanded ? 'rotate-0' : '-rotate-90'
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {/* Manage Folders button */}
                <button
                  onClick={() => openFolderManager('baking')}
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
      </div>

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
          existingBakingPaths={existingBakingPaths}
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
          existingBakingPaths={existingBakingPaths}
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
        existingPaths={folderManagerType === 'baking' ? existingBakingPaths : existingMainPaths}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        title={folderManagerType === 'baking' ? 'Manage Baking Folders' : 'Manage Main Dish Folders'}
      />

      {/* Meal detail modal for grid view */}
      <MealDetailModal
        meal={selectedMeal}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default MealLibrary;
