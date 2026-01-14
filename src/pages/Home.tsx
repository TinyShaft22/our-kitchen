import { useState } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { useMeals } from '../hooks/useMeals';
import { WeeklyMealCard } from '../components/planning/WeeklyMealCard';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { AddToWeekModal } from '../components/planning/AddToWeekModal';
import { EditServingsModal } from '../components/planning/EditServingsModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { WeeklyMealEntry } from '../types';

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
  const { currentWeek, loading: weekLoading, weekId, addMealToWeek, removeMealFromWeek, updateServings, toggleAlreadyHave } = useWeeklyPlan(householdCode);
  const { meals, loading: mealsLoading } = useMeals(householdCode);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit servings modal state
  const [editingEntry, setEditingEntry] = useState<WeeklyMealEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Remove confirmation dialog state
  const [removingEntry, setRemovingEntry] = useState<WeeklyMealEntry | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  // Helper to get meal by ID
  const getMealById = (mealId: string) => {
    return meals.find((m) => m.id === mealId) ?? null;
  };

  // Helper to get meal name by ID
  const getMealName = (mealId: string): string => {
    const meal = getMealById(mealId);
    return meal?.name ?? 'Unknown Meal';
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

  const isLoading = weekLoading || mealsLoading;

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-charcoal mb-4">
          {formatWeekId(weekId)}
        </h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-warm-gray">Loading weekly plan...</div>
        </div>
      </div>
    );
  }

  const weeklyMeals = currentWeek?.meals ?? [];

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-charcoal mb-4">
        {formatWeekId(weekId)}
      </h1>

      {weeklyMeals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-warm-gray text-lg">No meals planned this week.</p>
          <p className="text-warm-gray mt-1">Tap + to add some!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {weeklyMeals.map((entry) => (
            <WeeklyMealCard
              key={entry.mealId}
              entry={entry}
              meal={getMealById(entry.mealId)}
              alreadyHave={alreadyHave}
              onEditServings={handleEditServings}
              onRemove={handleRemove}
              onToggleAlreadyHave={toggleAlreadyHave}
            />
          ))}
        </div>
      )}

      <FloatingActionButton
        onClick={handleAddClick}
        ariaLabel="Add meal to week"
      />

      <AddToWeekModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
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

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRemoveDialogOpen}
        onClose={handleCloseRemoveDialog}
        onConfirm={handleConfirmRemove}
        title="Remove from Week"
        message={`Remove ${removingEntry ? getMealName(removingEntry.mealId) : ''} from this week's plan?`}
        confirmText="Remove"
        confirmVariant="danger"
      />
    </div>
  );
}

export default Home;
