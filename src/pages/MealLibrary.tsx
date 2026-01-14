import { useState } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useMeals } from '../hooks/useMeals';
import { MealCard } from '../components/meals/MealCard';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { AddMealModal } from '../components/meals/AddMealModal';
import { EditMealModal } from '../components/meals/EditMealModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { Meal } from '../types';

function MealLibrary() {
  const { householdCode } = useHousehold();
  const { meals, loading, addMeal, updateMeal, deleteMeal } = useMeals(householdCode);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingMeal, setDeletingMeal] = useState<Meal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-charcoal mb-4">Meal Library</h1>

      {meals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-warm-gray text-lg">No meals yet.</p>
          <p className="text-warm-gray mt-1">Tap + to add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
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
        />
      )}

      {editingMeal && householdCode && (
        <EditMealModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          meal={editingMeal}
          onSave={handleUpdateMeal}
          householdCode={householdCode}
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
