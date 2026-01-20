import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { WeeklyMeal, WeeklyMealEntry, WeeklySnackEntry, DayOfWeek } from '../types';

interface UseWeeklyPlanReturn {
  currentWeek: WeeklyMeal | null;
  loading: boolean;
  error: string | null;
  weekId: string;
  addMealToWeek: (mealId: string, servings: number) => Promise<void>;
  removeMealFromWeek: (mealId: string) => Promise<void>;
  updateServings: (mealId: string, servings: number) => Promise<void>;
  toggleAlreadyHave: (ingredientName: string) => Promise<void>;
  addSnackToWeek: (snackId: string, qty: number) => Promise<void>;
  removeSnackFromWeek: (snackId: string) => Promise<void>;
  updateSnackQty: (snackId: string, qty: number) => Promise<void>;
  updateMealDay: (mealId: string, day: DayOfWeek | undefined) => Promise<void>;
  updateSnackDay: (snackId: string, day: DayOfWeek | undefined) => Promise<void>;
}

/**
 * Get ISO week number for a date
 * Returns week number (1-53) based on ISO 8601 standard
 */
function getISOWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  // ISO week starts on Monday
  const dayNumber = (date.getDay() + 6) % 7;
  // Set to nearest Thursday (current date + 4 - current day number)
  target.setDate(target.getDate() - dayNumber + 3);
  // Get first Thursday of the year
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNumber = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNumber + 3);
  // Calculate week number
  const weekNumber = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return weekNumber;
}

/**
 * Get current week identifier in 'YYYY-WNN' format
 * Example: '2026-W02' for the second week of 2026
 */
function getWeekId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const weekNum = getISOWeekNumber(now);
  // Pad week number to 2 digits
  const weekStr = weekNum.toString().padStart(2, '0');
  return `${year}-W${weekStr}`;
}

export function useWeeklyPlan(householdCode: string | null): UseWeeklyPlanReturn {
  const [currentWeek, setCurrentWeek] = useState<WeeklyMeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate weekId once and memoize
  const weekId = useMemo(() => getWeekId(), []);

  // Real-time listener for the current week's document
  useEffect(() => {
    // Return early if no householdCode
    if (!householdCode) {
      setCurrentWeek(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Document path: weeklyMeals/{householdCode}_{weekId}
    // Using compound key to ensure unique per household per week
    const docId = `${householdCode}_${weekId}`;
    const weekRef = doc(db, 'weeklyMeals', docId);

    const unsubscribe = onSnapshot(
      weekRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setCurrentWeek({
            id: snapshot.id,
            ...snapshot.data(),
          } as WeeklyMeal);
        } else {
          // Document doesn't exist yet - that's OK, will be created on first add
          setCurrentWeek(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching weekly plan:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [householdCode, weekId]);

  const addMealToWeek = useCallback(
    async (mealId: string, servings: number): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const docId = `${householdCode}_${weekId}`;
        const weekRef = doc(db, 'weeklyMeals', docId);

        const newEntry: WeeklyMealEntry = { mealId, servings };

        if (!currentWeek) {
          // Create the document with first meal
          await setDoc(weekRef, {
            weekId,
            householdCode,
            meals: [newEntry],
          });
        } else {
          // Check if meal already exists in the week
          const existingIndex = currentWeek.meals.findIndex((m) => m.mealId === mealId);

          if (existingIndex >= 0) {
            // Meal exists - update servings (add to existing)
            const updatedMeals = [...currentWeek.meals];
            updatedMeals[existingIndex] = {
              ...updatedMeals[existingIndex],
              servings: updatedMeals[existingIndex].servings + servings,
            };
            await updateDoc(weekRef, { meals: updatedMeals });
          } else {
            // Add new meal to the array
            const updatedMeals = [...currentWeek.meals, newEntry];
            await updateDoc(weekRef, { meals: updatedMeals });
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add meal to week';
        setError(message);
        throw err;
      }
    },
    [householdCode, weekId, currentWeek]
  );

  const removeMealFromWeek = useCallback(
    async (mealId: string): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      if (!currentWeek) {
        throw new Error('No weekly plan exists');
      }

      try {
        const docId = `${householdCode}_${weekId}`;
        const weekRef = doc(db, 'weeklyMeals', docId);

        const updatedMeals = currentWeek.meals.filter((m) => m.mealId !== mealId);
        await updateDoc(weekRef, { meals: updatedMeals });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove meal from week';
        setError(message);
        throw err;
      }
    },
    [householdCode, weekId, currentWeek]
  );

  const updateServings = useCallback(
    async (mealId: string, servings: number): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      if (!currentWeek) {
        throw new Error('No weekly plan exists');
      }

      try {
        const docId = `${householdCode}_${weekId}`;
        const weekRef = doc(db, 'weeklyMeals', docId);

        const updatedMeals = currentWeek.meals.map((m) =>
          m.mealId === mealId ? { ...m, servings } : m
        );
        await updateDoc(weekRef, { meals: updatedMeals });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update servings';
        setError(message);
        throw err;
      }
    },
    [householdCode, weekId, currentWeek]
  );

  const updateMealDay = useCallback(
    async (mealId: string, day: DayOfWeek | undefined): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      if (!currentWeek) {
        throw new Error('No weekly plan exists');
      }

      try {
        const docId = `${householdCode}_${weekId}`;
        const weekRef = doc(db, 'weeklyMeals', docId);

        const updatedMeals = currentWeek.meals.map((m) =>
          m.mealId === mealId ? { ...m, day } : m
        );
        await updateDoc(weekRef, { meals: updatedMeals });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update meal day';
        setError(message);
        throw err;
      }
    },
    [householdCode, weekId, currentWeek]
  );

  const toggleAlreadyHave = useCallback(
    async (ingredientName: string): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const docId = `${householdCode}_${weekId}`;
        const weekRef = doc(db, 'weeklyMeals', docId);

        // Normalize to lowercase for consistent matching
        const normalizedName = ingredientName.toLowerCase().trim();

        if (!currentWeek) {
          // Create the document with the alreadyHave array
          await setDoc(weekRef, {
            weekId,
            householdCode,
            meals: [],
            alreadyHave: [normalizedName],
          });
        } else {
          // Check if ingredient is already in alreadyHave
          const alreadyHaveList = currentWeek.alreadyHave ?? [];
          const isAlreadyMarked = alreadyHaveList.includes(normalizedName);

          if (isAlreadyMarked) {
            // Remove from alreadyHave
            await updateDoc(weekRef, { alreadyHave: arrayRemove(normalizedName) });
          } else {
            // Add to alreadyHave
            await updateDoc(weekRef, { alreadyHave: arrayUnion(normalizedName) });
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to toggle already have';
        setError(message);
        throw err;
      }
    },
    [householdCode, weekId, currentWeek]
  );

  const addSnackToWeek = useCallback(
    async (snackId: string, qty: number): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const docId = `${householdCode}_${weekId}`;
        const weekRef = doc(db, 'weeklyMeals', docId);

        const newEntry: WeeklySnackEntry = { snackId, qty };

        if (!currentWeek) {
          // Create the document with first snack
          await setDoc(weekRef, {
            weekId,
            householdCode,
            meals: [],
            snacks: [newEntry],
          });
        } else {
          const currentSnacks = currentWeek.snacks ?? [];
          const existingIndex = currentSnacks.findIndex((s) => s.snackId === snackId);

          if (existingIndex >= 0) {
            // Snack exists - update qty (add to existing)
            const updatedSnacks = [...currentSnacks];
            updatedSnacks[existingIndex] = {
              ...updatedSnacks[existingIndex],
              qty: updatedSnacks[existingIndex].qty + qty,
            };
            await updateDoc(weekRef, { snacks: updatedSnacks });
          } else {
            // Add new snack
            const updatedSnacks = [...currentSnacks, newEntry];
            await updateDoc(weekRef, { snacks: updatedSnacks });
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add snack to week';
        setError(message);
        throw err;
      }
    },
    [householdCode, weekId, currentWeek]
  );

  const removeSnackFromWeek = useCallback(
    async (snackId: string): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      if (!currentWeek) {
        throw new Error('No weekly plan exists');
      }

      try {
        const docId = `${householdCode}_${weekId}`;
        const weekRef = doc(db, 'weeklyMeals', docId);

        const currentSnacks = currentWeek.snacks ?? [];
        const updatedSnacks = currentSnacks.filter((s) => s.snackId !== snackId);
        await updateDoc(weekRef, { snacks: updatedSnacks });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove snack from week';
        setError(message);
        throw err;
      }
    },
    [householdCode, weekId, currentWeek]
  );

  const updateSnackQty = useCallback(
    async (snackId: string, qty: number): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      if (!currentWeek) {
        throw new Error('No weekly plan exists');
      }

      try {
        const docId = `${householdCode}_${weekId}`;
        const weekRef = doc(db, 'weeklyMeals', docId);

        const currentSnacks = currentWeek.snacks ?? [];
        const updatedSnacks = currentSnacks.map((s) =>
          s.snackId === snackId ? { ...s, qty } : s
        );
        await updateDoc(weekRef, { snacks: updatedSnacks });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update snack quantity';
        setError(message);
        throw err;
      }
    },
    [householdCode, weekId, currentWeek]
  );

  const updateSnackDay = useCallback(
    async (snackId: string, day: DayOfWeek | undefined): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      if (!currentWeek) {
        throw new Error('No weekly plan exists');
      }

      try {
        const docId = `${householdCode}_${weekId}`;
        const weekRef = doc(db, 'weeklyMeals', docId);

        const currentSnacks = currentWeek.snacks ?? [];
        const updatedSnacks = currentSnacks.map((s) =>
          s.snackId === snackId ? { ...s, day } : s
        );
        await updateDoc(weekRef, { snacks: updatedSnacks });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update snack day';
        setError(message);
        throw err;
      }
    },
    [householdCode, weekId, currentWeek]
  );

  return {
    currentWeek,
    loading,
    error,
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
  };
}
