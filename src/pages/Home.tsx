import { useState } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useHousehold } from '../hooks/useHousehold';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { useMeals } from '../hooks/useMeals';
import { useSnacks } from '../hooks/useSnacks';
import { WeeklyMealCard } from '../components/planning/WeeklyMealCard';
import { WeeklySnackCard } from '../components/planning/WeeklySnackCard';
import { AddToWeekModal } from '../components/planning/AddToWeekModal';
import { AddSnackToWeekModal } from '../components/planning/AddSnackToWeekModal';
import { LoadMealsModal } from '../components/planning/LoadMealsModal';
import { EditServingsModal } from '../components/planning/EditServingsModal';
import { EditSnackQtyModal } from '../components/planning/EditSnackQtyModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { WeeklyPlanSkeleton, Skeleton } from '../components/ui/skeleton';
import { EmptyWeeklyPlan } from '../components/ui/EmptyState';
import { WeekViewToggle, type ViewMode } from '../components/ui/WeekViewToggle';
import { WeekView } from '../components/planning/WeekView';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import type { DayOfWeek, WeeklyMealEntry, WeeklySnackEntry } from '../types';

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
  } = useWeeklyPlan(householdCode);
  const { meals, loading: mealsLoading } = useMeals(householdCode);
  const { snacks, loading: snacksLoading } = useSnacks(householdCode);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSnackModalOpen, setIsAddSnackModalOpen] = useState(false);
  const [isLoadMealsModalOpen, setIsLoadMealsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

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

  // Configure drag sensors - require 10px movement before starting drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
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
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

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

  // Handle drag end - update meal/snack day assignment
  const handleDragEnd = async (event: DragEndEvent) => {
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
  const hasContent = weeklyMeals.length > 0 || weeklySnacks.length > 0;

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
              {weeklySnacks.length} snack{weeklySnacks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WeekViewToggle viewMode={viewMode} onToggle={setViewMode} />
            <Button
              onClick={() => setIsLoadMealsModalOpen(true)}
              size="sm"
              className="bg-terracotta text-white hover:bg-terracotta/90"
            >
              <Plus className="h-4 w-4 mr-1" />
              Load Meals
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4">
        {!hasContent ? (
          <EmptyWeeklyPlan onAdd={() => setIsLoadMealsModalOpen(true)} />
        ) : viewMode === 'list' ? (
          /* List View (existing) */
          <div className="space-y-6">
            {/* Meals Section */}
            {weeklyMeals.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-charcoal/60 mb-3 flex items-center gap-2">
                  <span>&#127869;</span> Meals ({weeklyMeals.length})
                </h2>
                <div className="grid grid-cols-1 gap-4">
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
              </div>
            )}

            {/* Snacks Section */}
            {weeklySnacks.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-charcoal/60 mb-3 flex items-center gap-2">
                  <span>&#127871;</span> Snacks ({weeklySnacks.length})
                </h2>
                <div className="grid grid-cols-1 gap-3">
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
              </div>
            )}
          </div>
        ) : (
          /* Week View with Drag and Drop */
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <WeekView
              meals={weeklyMeals}
              snacks={weeklySnacks}
              getMealById={getMealById}
              getSnackById={getSnackById}
            />
          </DndContext>
        )}

        {/* Quick Add Buttons - always visible when there's content or meals in library */}
        {(hasContent || meals.length > 0) && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setIsLoadMealsModalOpen(true)}
              className="flex-1 py-3 border-2 border-dashed border-terracotta/40 rounded-soft text-terracotta hover:border-terracotta hover:bg-terracotta/5 transition-colors flex items-center justify-center gap-2"
            >
              <span>&#127869;</span>
              <span>Meals</span>
            </button>
            {snacks.length > 0 && (
              <button
                onClick={handleAddSnackClick}
                className="flex-1 py-3 border-2 border-dashed border-sage/40 rounded-soft text-sage hover:border-sage hover:bg-sage/5 transition-colors flex items-center justify-center gap-2"
              >
                <span>&#127871;</span>
                <span>Snacks</span>
              </button>
            )}
          </div>
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
    </div>
  );
}

export default Home;
