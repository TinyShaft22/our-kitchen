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
import type { Snack } from '../types';

interface UseSnacksReturn {
  snacks: Snack[];
  loading: boolean;
  error: string | null;
  addSnack: (snack: Omit<Snack, 'id' | 'householdCode'>) => Promise<string>;
  updateSnack: (id: string, updates: Partial<Omit<Snack, 'id' | 'householdCode'>>) => Promise<void>;
  deleteSnack: (id: string) => Promise<void>;
}

export function useSnacks(householdCode: string | null): UseSnacksReturn {
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for snacks collection
  useEffect(() => {
    if (!householdCode) {
      setSnacks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const snacksRef = collection(db, 'snacks');
    const q = query(snacksRef, where('householdCode', '==', householdCode));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const snacksList: Snack[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Snack[];
        setSnacks(snacksList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching snacks:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdCode]);

  const addSnack = useCallback(
    async (snack: Omit<Snack, 'id' | 'householdCode'>): Promise<string> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const snacksRef = collection(db, 'snacks');
        const docRef = await addDoc(snacksRef, {
          ...snack,
          householdCode,
        });
        return docRef.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add snack';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const updateSnack = useCallback(
    async (id: string, updates: Partial<Omit<Snack, 'id' | 'householdCode'>>): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const snackRef = doc(db, 'snacks', id);
        // Filter out undefined values
        const cleanUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
          if (value !== undefined) {
            cleanUpdates[key] = value;
          } else if (key === 'brand' || key === 'barcode' || key === 'imageUrl') {
            cleanUpdates[key] = '';
          }
        }
        await updateDoc(snackRef, cleanUpdates);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update snack';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const deleteSnack = useCallback(
    async (id: string): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const snackRef = doc(db, 'snacks', id);
        await deleteDoc(snackRef);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete snack';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  return {
    snacks,
    loading,
    error,
    addSnack,
    updateSnack,
    deleteSnack,
  };
}
