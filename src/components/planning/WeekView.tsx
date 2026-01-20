import { useMemo } from 'react';
import type { DayOfWeek, WeeklyMealEntry, WeeklySnackEntry, Meal, Snack } from '../../types';
import { DayColumn } from './DayColumn';
import { UnassignedSection } from './UnassignedSection';

interface WeekViewProps {
  meals: WeeklyMealEntry[];
  snacks: WeeklySnackEntry[];
  getMealById: (mealId: string) => Meal | null;
  getSnackById: (snackId: string) => Snack | null;
}

// Get current day of week (1=Monday, 7=Sunday)
function getCurrentDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0=Sunday, 6=Saturday
  // Convert to ISO (1=Monday, 7=Sunday)
  return (jsDay === 0 ? 7 : jsDay) as DayOfWeek;
}

export function WeekView({ meals, snacks, getMealById, getSnackById }: WeekViewProps) {
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

  const days: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-4">
      {/* Unassigned Section */}
      <UnassignedSection
        meals={mealsByDay.unassigned}
        snacks={snacksByDay.unassigned}
        getMealById={getMealById}
        getSnackById={getSnackById}
      />

      {/* Week Grid - 7 columns on desktop, stacked on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {days.map((day) => (
          <DayColumn
            key={day}
            day={day}
            meals={mealsByDay[day]}
            snacks={snacksByDay[day]}
            getMealById={getMealById}
            getSnackById={getSnackById}
            isToday={day === today}
          />
        ))}
      </div>
    </div>
  );
}
