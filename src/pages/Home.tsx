import { useState } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useHousehold } from '../hooks/useHousehold';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { useMeals } from '../hooks/useMeals';
import { useSnacks } from '../hooks/useSnacks';
import { WeeklyMealCard } from '../components/planning/WeeklyMealCard';
import { WeeklySnackCard } from '../components/planning/WeeklySnackCard';
import { WeeklyDessertCard } from '../components/planning/WeeklyDessertCard';
import { AddToWeekModal } from '../components/planning/AddToWeekModal';
import { AddSnackToWeekModal } from '../components/planning/AddSnackToWeekModal';
import { AddDessertToWeekModal } from '../components/planning/AddDessertToWeekModal';
import { LoadMealsModal } from '../components/planning/LoadMealsModal';
import { EditServingsModal } from '../components/planning/EditServingsModal';
import { EditSnackQtyModal } from '../components/planning/EditSnackQtyModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { WeeklyPlanSkeleton, Skeleton } from '../components/ui/skeleton';
import { EmptyWeeklyPlan } from '../components/ui/EmptyState';
import { WeekViewToggle, type ViewMode } from '../components/ui/WeekViewToggle';
import { WeekView } from '../components/planning/WeekView';
import { MealQuickViewModal } from '../components/planning/MealQuickViewModal';
import type { DayOfWeek, WeeklyMealEntry, WeeklySnackEntry, WeeklyDessertEntry, Meal, Snack } from '../types';

/**
 * Parse weekId (e.g., "2026-W02") into display format (e.g., "Week 02, 2026")
 */
function formatWeekId(weekId: string): string {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekId;
  const [, year, week] = match;
  return `Week ${week}, ${year}`;
}

function Home() {
  const { householdCode } = useHousehold();
  const {
    currentWeek,
    loading: weekLoading,
    weekId,
    addMealToWeek,
    removeMealFromWeek,
    updateServings,
    toggleAlreadyHave,
    addSnackToWeek,
    removeSnackFromWeek,
    updateSnackQty,
    updateMealDay,
    updateSnackDay,
    addDessertToWeek,
    removeDessertFromWeek,
    updateDessertServings,
    updateDessertDay,
  } = useWeeklyPlan(householdCode);
  const { meals, loading: mealsLoading } = useMeals(householdCode);
  const { snacks, loading: snacksLoading } = useSnacks(householdCode);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSnackModalOpen, setIsAddSnackModalOpen] = useState(false);
  const [isAddDessertModalOpen, setIsAddDessertModalOpen] = useState(false);
  const [isLoadMealsModalOpen, setIsLoadMealsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Collapsible section state for list view
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['meals', 'snacks', 'desserts'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Edit servings modal state
  const [editingEntry, setEditingEntry] = useState<WeeklyMealEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit snack qty modal state
  const [editingSnackEntry, setEditingSnackEntry] = useState<WeeklySnackEntry | null>(null);
  const [isEditSnackModalOpen, setIsEditSnackModalOpen] = useState(false);

  // Remove confirmation dialog state
  const [removingEntry, setRemovingEntry] = useState<WeeklyMealEntry | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  // Remove snack confirmation dialog state
  const [removingSnackEntry, setRemovingSnackEntry] = useState<WeeklySnackEntry | null>(null);
  const [isRemoveSnackDialogOpen, setIsRemoveSnackDialogOpen] = useState(false);

  // Edit dessert servings modal state
  const [editingDessertEntry, setEditingDessertEntry] = useState<WeeklyDessertEntry | null>(null);
  const [isEditDessertModalOpen, setIsEditDessertModalOpen] = useState(false);

  // Remove dessert confirmation dialog state
  const [removingDessertEntry, setRemovingDessertEntry] = useState<WeeklyDessertEntry | null>(null);
  const [isRemoveDessertDialogOpen, setIsRemoveDessertDialogOpen] = useState(false);

  // Active drag item for DragOverlay
  const [activeDragItem, setActiveDragItem] = useState<{
    type: 'meal' | 'snack' | 'dessert';
    entry: WeeklyMealEntry | WeeklySnackEntry | WeeklyDessertEntry;
  } | null>(null);

  // Quick view modal state for viewing item details
  const [quickViewItem, setQuickViewItem] = useState<{
    item: Meal | Snack;
    type: 'meal' | 'snack' | 'dessert';
    servings: number;
  } | null>(null);

  // Configure drag sensors for both desktop and mobile
  const sensors = useSensors(
    // Desktop: mouse/trackpad - start drag after 8px movement
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    // Mobile: touch - hold for 200ms before drag starts (allows scrolling)
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    // Keyboard accessibility
    useSensor(KeyboardSensor)
  );

  // Helper to get meal by ID
  const getMealById = (mealId: string) => {
    return meals.find((m) => m.id === mealId) ?? null;
  };

  // Helper to get meal name by ID
  const getMealName = (mealId: string): string => {
    const meal = getMealById(mealId);
    return meal?.name ?? 'Unknown Meal';
  };

  // Helper to get snack by ID
  const getSnackById = (snackId: string) => {
    return snacks.find((s) => s.id === snackId) ?? null;
  };

  // Helper to get snack name by ID
  const getSnackName = (snackId: string): string => {
    const snack = getSnackById(snackId);
    return snack?.name ?? 'Unknown Snack';
  };

  // Get alreadyHave list from current week
  const alreadyHave = currentWeek?.alreadyHave ?? [];

  // Modal handlers
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddMealToWeek = async (mealId: string, servings: number) => {
    await addMealToWeek(mealId, servings);
  };

  // Edit servings handlers
  const handleEditServings = (entry: WeeklyMealEntry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEntry(null);
  };

  const handleSaveServings = async (servings: number) => {
    if (!editingEntry) {
      throw new Error('No meal selected for editing');
    }
    await updateServings(editingEntry.mealId, servings);
  };

  // Remove meal handlers
  const handleRemove = (entry: WeeklyMealEntry) => {
    setRemovingEntry(entry);
    setIsRemoveDialogOpen(true);
  };

  const handleCloseRemoveDialog = () => {
    setIsRemoveDialogOpen(false);
    setRemovingEntry(null);
  };

  const handleConfirmRemove = async () => {
    if (removingEntry) {
      await removeMealFromWeek(removingEntry.mealId);
      handleCloseRemoveDialog();
    }
  };

  // Snack modal handlers
  const handleAddSnackClick = () => {
    setIsAddSnackModalOpen(true);
  };

  const handleCloseSnackModal = () => {
    setIsAddSnackModalOpen(false);
  };

  const handleAddSnackToWeek = async (snackId: string, qty: number) => {
    await addSnackToWeek(snackId, qty);
  };

  const handleEditSnackQty = (entry: WeeklySnackEntry) => {
    setEditingSnackEntry(entry);
    setIsEditSnackModalOpen(true);
  };

  const handleCloseEditSnackModal = () => {
    setIsEditSnackModalOpen(false);
    setEditingSnackEntry(null);
  };

  const handleSaveSnackQty = async (qty: number) => {
    if (!editingSnackEntry) {
      throw new Error('No snack selected for editing');
    }
    await updateSnackQty(editingSnackEntry.snackId, qty);
  };

  const handleRemoveSnack = (entry: WeeklySnackEntry) => {
    setRemovingSnackEntry(entry);
    setIsRemoveSnackDialogOpen(true);
  };

  const handleCloseRemoveSnackDialog = () => {
    setIsRemoveSnackDialogOpen(false);
    setRemovingSnackEntry(null);
  };

  const handleConfirmRemoveSnack = async () => {
    if (removingSnackEntry) {
      await removeSnackFromWeek(removingSnackEntry.snackId);
      handleCloseRemoveSnackDialog();
    }
  };

  // Dessert modal handlers
  const handleAddDessertClick = () => {
    setIsAddDessertModalOpen(true);
  };

  const handleCloseDessertModal = () => {
    setIsAddDessertModalOpen(false);
  };

  const handleAddDessertToWeek = async (mealId: string, servings: number) => {
    await addDessertToWeek(mealId, servings);
  };

  const handleEditDessertServings = (entry: WeeklyDessertEntry) => {
    setEditingDessertEntry(entry);
    setIsEditDessertModalOpen(true);
  };

  const handleCloseEditDessertModal = () => {
    setIsEditDessertModalOpen(false);
    setEditingDessertEntry(null);
  };

  const handleSaveDessertServings = async (servings: number) => {
    if (!editingDessertEntry) {
      throw new Error('No dessert selected for editing');
    }
    await updateDessertServings(editingDessertEntry.mealId, servings);
  };

  const handleRemoveDessert = (entry: WeeklyDessertEntry) => {
    setRemovingDessertEntry(entry);
    setIsRemoveDessertDialogOpen(true);
  };

  const handleCloseRemoveDessertDialog = () => {
    setIsRemoveDessertDialogOpen(false);
    setRemovingDessertEntry(null);
  };

  const handleConfirmRemoveDessert = async () => {
    if (removingDessertEntry) {
      await removeDessertFromWeek(removingDessertEntry.mealId);
      handleCloseRemoveDessertDialog();
    }
  };

  // Quick view handlers for week view cards
  const handleViewMeal = (meal: Meal, entry: WeeklyMealEntry) => {
    setQuickViewItem({ item: meal, type: 'meal', servings: entry.servings });
  };

  const handleViewSnack = (snack: Snack, entry: WeeklySnackEntry) => {
    setQuickViewItem({ item: snack, type: 'snack', servings: entry.qty });
  };

  const handleViewDessert = (meal: Meal, entry: WeeklyDessertEntry) => {
    setQuickViewItem({ item: meal, type: 'dessert', servings: entry.servings });
  };

  const handleCloseQuickView = () => {
    setQuickViewItem(null);
  };

  // Handle drag start - capture the item being dragged for DragOverlay
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type && activeData?.entry) {
      setActiveDragItem({
        type: activeData.type as 'meal' | 'snack' | 'dessert',
        entry: activeData.entry,
      });
    }
  };

  // Handle drag end - update meal/snack/dessert day assignment
  const handleDragEnd = async (event: DragEndEvent) => {
    // Clear the drag overlay
    setActiveDragItem(null);

    const { active, over } = event;

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    // Determine target day (undefined for unassigned)
    const targetDay = overData.day as DayOfWeek | undefined;

    // Handle meal drop
    if (activeData.type === 'meal') {
      const entry = activeData.entry as WeeklyMealEntry;
      // Only update if day changed
      if (entry.day !== targetDay) {
        await updateMealDay(entry.mealId, targetDay);
      }
    }

    // Handle snack drop
    if (activeData.type === 'snack') {
      const entry = activeData.entry as WeeklySnackEntry;
      // Only update if day changed
      if (entry.day !== targetDay) {
        await updateSnackDay(entry.snackId, targetDay);
      }
    }

    // Handle dessert drop
    if (activeData.type === 'dessert') {
      const entry = activeData.entry as WeeklyDessertEntry;
      // Only update if day changed
      if (entry.day !== targetDay) {
        await updateDessertDay(entry.mealId, targetDay);
      }
    }
  };

  const isLoading = weekLoading || mealsLoading || snacksLoading;

  if (isLoading) {
    return (
      <div className="pb-32">
        <div className="hero-gradient px-4 pt-6 pb-4 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-display font-semibold text-charcoal">
                {formatWeekId(weekId)}
              </h1>
              <p className="text-charcoal/60 text-sm mt-1">Loading your week...</p>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16 rounded-soft" />
              <Skeleton className="h-8 w-24 rounded-soft" />
            </div>
          </div>
        </div>
        <div className="px-4 space-y-6">
          {/* Meals section skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span>🍽️</span>
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ animationDelay: `${i * 100}ms` }}>
                  <WeeklyPlanSkeleton />
                </div>
              ))}
            </div>
          </div>
          {/* Snacks section skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span>🍿</span>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} style={{ animationDelay: `${(i + 3) * 100}ms` }}>
                  <Skeleton className="h-16 w-full rounded-soft" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const weeklyMeals = currentWeek?.meals ?? [];
  const weeklySnacks = currentWeek?.snacks ?? [];
  const weeklyDesserts = currentWeek?.desserts ?? [];
  const hasContent = weeklyMeals.length > 0 || weeklySnacks.length > 0 || weeklyDesserts.length > 0;

  // Filter baking items for desserts modal
  const bakingItems = meals.filter((m) => m.isBaking);

  return (
    <div className="pb-32">
      {/* Hero section with gradient */}
      <div className="hero-gradient px-4 pt-6 pb-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold text-charcoal">
              {formatWeekId(weekId)}
            </h1>
            <p className="text-charcoal/60 text-sm mt-1">
              {weeklyMeals.length} meal{weeklyMeals.length !== 1 ? 's' : ''} •{' '}
              {weeklySnacks.length} snack{weeklySnacks.length !== 1 ? 's' : ''} •{' '}
              {weeklyDesserts.length} dessert{weeklyDesserts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WeekViewToggle viewMode={viewMode} onToggle={setViewMode} />
          </div>
        </div>
      </div>

      <div className="px-4">
        {!hasContent ? (
          <EmptyWeeklyPlan onAdd={() => setIsLoadMealsModalOpen(true)} />
        ) : viewMode === 'list' ? (
          /* List View - each section has its own add button at the bottom */
          <div className="space-y-6">
            {/* Meals Section */}
            <div>
              <button
                onClick={() => toggleSection('meals')}
                className="w-full flex items-center gap-3 mb-3 text-left"
              >
                <span
                  className={`text-charcoal/40 transition-transform duration-200 ${
                    expandedSections.has('meals') ? 'rotate-90' : ''
                  }`}
                >
                  ▶
                </span>
                <span className="text-xl">🍽️</span>
                <span className="text-lg font-semibold text-charcoal">
                  Meals ({weeklyMeals.length})
                </span>
              </button>
              {expandedSections.has('meals') && (
                <>
                  {weeklyMeals.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 mb-3">
                      {weeklyMeals.map((entry, index) => (
                        <div
                          key={entry.mealId}
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <WeeklyMealCard
                            entry={entry}
                            meal={getMealById(entry.mealId)}
                            alreadyHave={alreadyHave}
                            onEditServings={handleEditServings}
                            onRemove={handleRemove}
                            onToggleAlreadyHave={toggleAlreadyHave}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setIsLoadMealsModalOpen(true)}
                    className="w-full py-3 border-2 border-dashed border-terracotta/40 rounded-soft text-terracotta hover:border-terracotta hover:bg-terracotta/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🍽️</span>
                    <span>Add Meals</span>
                  </button>
                </>
              )}
            </div>

            {/* Snacks Section */}
            <div>
              <button
                onClick={() => toggleSection('snacks')}
                className="w-full flex items-center gap-3 mb-3 text-left"
              >
                <span
                  className={`text-charcoal/40 transition-transform duration-200 ${
                    expandedSections.has('snacks') ? 'rotate-90' : ''
                  }`}
                >
                  ▶
                </span>
                <span className="text-xl">🍿</span>
                <span className="text-lg font-semibold text-charcoal">
                  Snacks ({weeklySnacks.length})
                </span>
              </button>
              {expandedSections.has('snacks') && (
                <>
                  {weeklySnacks.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 mb-3">
                      {weeklySnacks.map((entry, index) => (
                        <div
                          key={entry.snackId}
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${(weeklyMeals.length + index) * 50}ms` }}
                        >
                          <WeeklySnackCard
                            entry={entry}
                            snack={getSnackById(entry.snackId)}
                            onEditQty={handleEditSnackQty}
                            onRemove={handleRemoveSnack}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {snacks.length > 0 && (
                    <button
                      onClick={handleAddSnackClick}
                      className="w-full py-3 border-2 border-dashed border-sage/40 rounded-soft text-sage hover:border-sage hover:bg-sage/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>🍿</span>
                      <span>Add Snacks</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Desserts Section */}
            <div>
              <button
                onClick={() => toggleSection('desserts')}
                className="w-full flex items-center gap-3 mb-3 text-left"
              >
                <span
                  className={`text-charcoal/40 transition-transform duration-200 ${
                    expandedSections.has('desserts') ? 'rotate-90' : ''
                  }`}
                >
                  ▶
                </span>
                <span className="text-xl">🧁</span>
                <span className="text-lg font-semibold text-charcoal">
                  Desserts ({weeklyDesserts.length})
                </span>
              </button>
              {expandedSections.has('desserts') && (
                <>
                  {weeklyDesserts.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 mb-3">
                      {weeklyDesserts.map((entry, index) => (
                        <div
                          key={entry.mealId}
                          className="animate-fade-in-up"
                          style={{ animationDelay: `${(weeklyMeals.length + weeklySnacks.length + index) * 50}ms` }}
                        >
                          <WeeklyDessertCard
                            entry={entry}
                            meal={getMealById(entry.mealId)}
                            onEditServings={handleEditDessertServings}
                            onRemove={handleRemoveDessert}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {bakingItems.length > 0 && (
                    <button
                      onClick={handleAddDessertClick}
                      className="w-full py-3 border-2 border-dashed border-honey/40 rounded-soft text-honey hover:border-honey hover:bg-honey/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>🧁</span>
                      <span>Add Desserts</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Week View with Drag and Drop */
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <WeekView
              meals={weeklyMeals}
              snacks={weeklySnacks}
              desserts={weeklyDesserts}
              getMealById={getMealById}
              getSnackById={getSnackById}
              onViewMeal={handleViewMeal}
              onViewSnack={handleViewSnack}
              onViewDessert={handleViewDessert}
            />
            {/* DragOverlay renders the dragged item in a portal - always visible on top */}
            <DragOverlay dropAnimation={null}>
              {activeDragItem ? (
                <div className="p-3 bg-white rounded-soft shadow-lg ring-2 ring-terracotta text-sm opacity-95">
                  <div className="flex items-center gap-2">
                    {activeDragItem.type === 'meal' && (
                      <>
                        {(() => {
                          const meal = getMealById((activeDragItem.entry as WeeklyMealEntry).mealId);
                          return meal ? (
                            <>
                              {meal.imageUrl ? (
                                <img src={meal.imageUrl} alt="" className="w-8 h-8 rounded-soft object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-soft bg-terracotta/10 flex items-center justify-center">
                                  <span className="text-sm">🍽️</span>
                                </div>
                              )}
                              <span className="font-medium text-charcoal truncate">{meal.name}</span>
                            </>
                          ) : null;
                        })()}
                      </>
                    )}
                    {activeDragItem.type === 'snack' && (
                      <>
                        {(() => {
                          const snack = getSnackById((activeDragItem.entry as WeeklySnackEntry).snackId);
                          return snack ? (
                            <>
                              {snack.imageUrl ? (
                                <img src={snack.imageUrl} alt="" className="w-8 h-8 rounded-soft object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-soft bg-sage/20 flex items-center justify-center">
                                  <span className="text-sm">🍿</span>
                                </div>
                              )}
                              <span className="font-medium text-charcoal truncate">{snack.name}</span>
                            </>
                          ) : null;
                        })()}
                      </>
                    )}
                    {activeDragItem.type === 'dessert' && (
                      <>
                        {(() => {
                          const meal = getMealById((activeDragItem.entry as WeeklyDessertEntry).mealId);
                          return meal ? (
                            <>
                              {meal.imageUrl ? (
                                <img src={meal.imageUrl} alt="" className="w-8 h-8 rounded-soft object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-soft bg-honey/10 flex items-center justify-center">
                                  <span className="text-sm">🧁</span>
                                </div>
                              )}
                              <span className="font-medium text-charcoal truncate">{meal.name}</span>
                            </>
                          ) : null;
                        })()}
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <AddToWeekModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        meals={meals}
        onAdd={handleAddMealToWeek}
      />

      <AddSnackToWeekModal
        isOpen={isAddSnackModalOpen}
        onClose={handleCloseSnackModal}
        snacks={snacks}
        onAdd={handleAddSnackToWeek}
      />

      <LoadMealsModal
        isOpen={isLoadMealsModalOpen}
        onClose={() => setIsLoadMealsModalOpen(false)}
        meals={meals}
        onAdd={handleAddMealToWeek}
      />

      {/* Edit Servings Modal */}
      <EditServingsModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        mealName={editingEntry ? getMealName(editingEntry.mealId) : ''}
        currentServings={editingEntry?.servings ?? 1}
        onSave={handleSaveServings}
      />

      {/* Edit Snack Qty Modal */}
      <EditSnackQtyModal
        isOpen={isEditSnackModalOpen}
        onClose={handleCloseEditSnackModal}
        snackName={editingSnackEntry ? getSnackName(editingSnackEntry.snackId) : ''}
        currentQty={editingSnackEntry?.qty ?? 1}
        onSave={handleSaveSnackQty}
      />

      {/* Remove Meal Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRemoveDialogOpen}
        onClose={handleCloseRemoveDialog}
        onConfirm={handleConfirmRemove}
        title="Remove from Week"
        message={`Remove ${removingEntry ? getMealName(removingEntry.mealId) : ''} from this week's plan?`}
        confirmText="Remove"
        confirmVariant="danger"
      />

      {/* Remove Snack Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRemoveSnackDialogOpen}
        onClose={handleCloseRemoveSnackDialog}
        onConfirm={handleConfirmRemoveSnack}
        title="Remove Snack"
        message={`Remove ${removingSnackEntry ? getSnackName(removingSnackEntry.snackId) : ''} from this week's plan?`}
        confirmText="Remove"
        confirmVariant="danger"
      />

      {/* Add Dessert Modal */}
      <AddDessertToWeekModal
        isOpen={isAddDessertModalOpen}
        onClose={handleCloseDessertModal}
        meals={meals}
        onAdd={handleAddDessertToWeek}
      />

      {/* Edit Dessert Servings Modal */}
      <EditServingsModal
        isOpen={isEditDessertModalOpen}
        onClose={handleCloseEditDessertModal}
        mealName={editingDessertEntry ? getMealName(editingDessertEntry.mealId) : ''}
        currentServings={editingDessertEntry?.servings ?? 1}
        onSave={handleSaveDessertServings}
      />

      {/* Remove Dessert Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRemoveDessertDialogOpen}
        onClose={handleCloseRemoveDessertDialog}
        onConfirm={handleConfirmRemoveDessert}
        title="Remove Dessert"
        message={`Remove ${removingDessertEntry ? getMealName(removingDessertEntry.mealId) : ''} from this week's plan?`}
        confirmText="Remove"
        confirmVariant="danger"
      />

      {/* Quick View Modal for Week View Cards */}
      <MealQuickViewModal
        item={quickViewItem?.item ?? null}
        type={quickViewItem?.type ?? 'meal'}
        servings={quickViewItem?.servings}
        isOpen={!!quickViewItem}
        onClose={handleCloseQuickView}
      />
    </div>
  );
}

export default Home;
