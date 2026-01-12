import { useState, useEffect, useCallback, useMemo } from 'react';
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
import type { BakingEssential, BakingStatus } from '../types';

interface UseBakingReturn {
  essentials: BakingEssential[];
  lowStockItems: BakingEssential[];
  loading: boolean;
  error: string | null;
  addEssential: (essential: Omit<BakingEssential, 'id' | 'householdCode'>) => Promise<string>;
  updateEssential: (id: string, updates: Partial<Omit<BakingEssential, 'id' | 'householdCode'>>) => Promise<void>;
  deleteEssential: (id: string) => Promise<void>;
  updateStatus: (id: string, status: BakingStatus) => Promise<void>;
}

export function useBaking(householdCode: string | null): UseBakingReturn {
  const [essentials, setEssentials] = useState<BakingEssential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed value: items that are low or out of stock
  const lowStockItems = useMemo(
    () => essentials.filter((e) => e.status === 'low' || e.status === 'out'),
    [essentials]
  );

  // Real-time listener for bakingEssentials collection
  useEffect(() => {
    // Return early if no householdCode
    if (!householdCode) {
      setEssentials([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const essentialsRef = collection(db, 'bakingEssentials');
    const q = query(essentialsRef, where('householdCode', '==', householdCode));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const essentialsList: BakingEssential[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BakingEssential[];
        setEssentials(essentialsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching baking essentials:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [householdCode]);

  const addEssential = useCallback(
    async (essential: Omit<BakingEssential, 'id' | 'householdCode'>): Promise<string> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const essentialsRef = collection(db, 'bakingEssentials');
        const docRef = await addDoc(essentialsRef, {
          ...essential,
          householdCode, // Auto-inject householdCode
        });
        return docRef.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add baking essential';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const updateEssential = useCallback(
    async (id: string, updates: Partial<Omit<BakingEssential, 'id' | 'householdCode'>>): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const essentialRef = doc(db, 'bakingEssentials', id);
        // Don't allow updating householdCode - it's omitted from the type
        await updateDoc(essentialRef, updates);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update baking essential';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const deleteEssential = useCallback(
    async (id: string): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const essentialRef = doc(db, 'bakingEssentials', id);
        await deleteDoc(essentialRef);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete baking essential';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const updateStatus = useCallback(
    async (id: string, status: BakingStatus): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const essentialRef = doc(db, 'bakingEssentials', id);
        await updateDoc(essentialRef, { status });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update baking essential status';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  return {
    essentials,
    lowStockItems,
    loading,
    error,
    addEssential,
    updateEssential,
    deleteEssential,
    updateStatus,
  };
}
