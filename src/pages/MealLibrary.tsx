import { useState } from 'react';
import { useHousehold } from '../hooks/useHousehold';
import { useMeals } from '../hooks/useMeals';
import { MealCard } from '../components/meals/MealCard';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { AddMealModal } from '../components/meals/AddMealModal';
import type { Meal } from '../types';

function MealLibrary() {
  const { householdCode } = useHousehold();
  const { meals, loading, addMeal } = useMeals(householdCode);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleEdit = (meal: Meal) => {
    // Will be wired up in 04-03
    console.log('Edit meal:', meal.id);
  };

  const handleDelete = (meal: Meal) => {
    // Will be wired up in 04-03
    console.log('Delete meal:', meal.id);
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

      <AddMealModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMeal}
      />
    </div>
  );
}

export default MealLibrary;
