import { useMemo } from 'react';
import type { DayOfWeek, WeeklyMealEntry, WeeklySnackEntry, WeeklyDessertEntry, Meal, Snack } from '../../types';
import { DayColumn } from './DayColumn';
import { UnassignedSection } from './UnassignedSection';

interface WeekViewProps {
  meals: WeeklyMealEntry[];
  snacks: WeeklySnackEntry[];
  desserts: WeeklyDessertEntry[];
  getMealById: (mealId: string) => Meal | null;
  getSnackById: (snackId: string) => Snack | null;
  onViewMeal?: (meal: Meal, entry: WeeklyMealEntry) => void;
  onViewSnack?: (snack: Snack, entry: WeeklySnackEntry) => void;
  onViewDessert?: (meal: Meal, entry: WeeklyDessertEntry) => void;
}

// Get current day of week (1=Monday, 7=Sunday)
function getCurrentDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0=Sunday, 6=Saturday
  // Convert to ISO (1=Monday, 7=Sunday)
  return (jsDay === 0 ? 7 : jsDay) as DayOfWeek;
}

export function WeekView({ meals, snacks, desserts, getMealById, getSnackById, onViewMeal, onViewSnack, onViewDessert }: WeekViewProps) {
  const today = useMemo(() => getCurrentDayOfWeek(), []);

  // Group meals by day
  const mealsByDay = useMemo(() => {
    const grouped: Record<DayOfWeek | 'unassigned', WeeklyMealEntry[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
      unassigned: [],
    };

    for (const entry of meals) {
      if (entry.day) {
        grouped[entry.day].push(entry);
      } else {
        grouped.unassigned.push(entry);
      }
    }

    return grouped;
  }, [meals]);

  // Group snacks by day
  const snacksByDay = useMemo(() => {
    const grouped: Record<DayOfWeek | 'unassigned', WeeklySnackEntry[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
      unassigned: [],
    };

    for (const entry of snacks) {
      if (entry.day) {
        grouped[entry.day].push(entry);
      } else {
        grouped.unassigned.push(entry);
      }
    }

    return grouped;
  }, [snacks]);

  // Group desserts by day
  const dessertsByDay = useMemo(() => {
    const grouped: Record<DayOfWeek | 'unassigned', WeeklyDessertEntry[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
      unassigned: [],
    };

    for (const entry of desserts) {
      if (entry.day) {
        grouped[entry.day].push(entry);
      } else {
        grouped.unassigned.push(entry);
      }
    }

    return grouped;
  }, [desserts]);

  const days: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-4">
      {/* Unassigned Section */}
      <UnassignedSection
        meals={mealsByDay.unassigned}
        snacks={snacksByDay.unassigned}
        desserts={dessertsByDay.unassigned}
        getMealById={getMealById}
        getSnackById={getSnackById}
        onViewMeal={onViewMeal}
        onViewSnack={onViewSnack}
        onViewDessert={onViewDessert}
      />

      {/* Mobile hint */}
      <p className="text-xs text-charcoal/50 text-center md:hidden">
        Hold an item to drag • Swipe to see more days
      </p>

      {/* Week Grid - horizontal scroll on mobile, grid on desktop */}
      <div className="
        flex gap-3 overflow-x-auto pb-2 scroll-smooth
        md:grid md:grid-cols-7 md:gap-2 md:overflow-visible md:pb-0
        -mx-4 px-4 md:mx-0 md:px-0
      ">
        {days.map((day) => (
          <div key={day} className="flex-shrink-0 w-[30%] sm:w-[25%] md:w-auto">
            <DayColumn
              day={day}
              meals={mealsByDay[day]}
              snacks={snacksByDay[day]}
              desserts={dessertsByDay[day]}
              getMealById={getMealById}
              getSnackById={getSnackById}
              isToday={day === today}
              onViewMeal={onViewMeal}
              onViewSnack={onViewSnack}
              onViewDessert={onViewDessert}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
