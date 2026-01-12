import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Meal } from '../types';

interface UseMealsReturn {
  meals: Meal[];
  loading: boolean;
  error: string | null;
  addMeal: (meal: Omit<Meal, 'id' | 'householdCode'>) => Promise<string>;
  updateMeal: (id: string, updates: Partial<Omit<Meal, 'id' | 'householdCode'>>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
}

export function useMeals(householdCode: string | null): UseMealsReturn {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for meals collection
  useEffect(() => {
    // Return early if no householdCode
    if (!householdCode) {
      setMeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const mealsRef = collection(db, 'meals');
    const q = query(mealsRef, where('householdCode', '==', householdCode));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mealsList: Meal[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Meal[];
        setMeals(mealsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching meals:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [householdCode]);

  const addMeal = useCallback(
    async (meal: Omit<Meal, 'id' | 'householdCode'>): Promise<string> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const mealsRef = collection(db, 'meals');
        const docRef = await addDoc(mealsRef, {
          ...meal,
          householdCode, // Auto-inject householdCode
        });
        return docRef.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add meal';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const updateMeal = useCallback(
    async (id: string, updates: Partial<Omit<Meal, 'id' | 'householdCode'>>): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const mealRef = doc(db, 'meals', id);
        // Don't allow updating householdCode - it's omitted from the type
        await updateDoc(mealRef, updates);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update meal';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const deleteMeal = useCallback(
    async (id: string): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const mealRef = doc(db, 'meals', id);
        await deleteDoc(mealRef);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete meal';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  return {
    meals,
    loading,
    error,
    addMeal,
    updateMeal,
    deleteMeal,
  };
}
