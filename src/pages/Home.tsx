import { useHousehold } from '../hooks/useHousehold';
import { useWeeklyPlan } from '../hooks/useWeeklyPlan';
import { useMeals } from '../hooks/useMeals';
import { WeeklyMealCard } from '../components/planning/WeeklyMealCard';
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
  const { currentWeek, loading: weekLoading, weekId } = useWeeklyPlan(householdCode);
  const { meals, loading: mealsLoading } = useMeals(householdCode);

  // Helper to get meal name by ID
  const getMealName = (mealId: string): string => {
    const meal = meals.find((m) => m.id === mealId);
    return meal?.name ?? 'Unknown Meal';
  };

  // Stub handlers - will be wired in 05-03
  const handleEditServings = (entry: WeeklyMealEntry) => {
    console.log('Edit servings:', entry);
  };

  const handleRemove = (entry: WeeklyMealEntry) => {
    console.log('Remove from week:', entry);
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
              mealName={getMealName(entry.mealId)}
              onEditServings={handleEditServings}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
