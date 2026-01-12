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
import type { Staple } from '../types';

interface UseStaplesReturn {
  staples: Staple[];
  enabledStaples: Staple[];
  loading: boolean;
  error: string | null;
  addStaple: (staple: Omit<Staple, 'id' | 'householdCode'>) => Promise<string>;
  updateStaple: (id: string, updates: Partial<Omit<Staple, 'id' | 'householdCode'>>) => Promise<void>;
  deleteStaple: (id: string) => Promise<void>;
  toggleEnabled: (id: string, enabled: boolean) => Promise<void>;
}

export function useStaples(householdCode: string | null): UseStaplesReturn {
  const [staples, setStaples] = useState<Staple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed value: only enabled staples
  const enabledStaples = useMemo(() => staples.filter((s) => s.enabled), [staples]);

  // Real-time listener for staples collection
  useEffect(() => {
    // Return early if no householdCode
    if (!householdCode) {
      setStaples([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const staplesRef = collection(db, 'staples');
    const q = query(staplesRef, where('householdCode', '==', householdCode));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const staplesList: Staple[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Staple[];
        setStaples(staplesList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching staples:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [householdCode]);

  const addStaple = useCallback(
    async (staple: Omit<Staple, 'id' | 'householdCode'>): Promise<string> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const staplesRef = collection(db, 'staples');
        const docRef = await addDoc(staplesRef, {
          ...staple,
          householdCode, // Auto-inject householdCode
        });
        return docRef.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add staple';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const updateStaple = useCallback(
    async (id: string, updates: Partial<Omit<Staple, 'id' | 'householdCode'>>): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const stapleRef = doc(db, 'staples', id);
        // Don't allow updating householdCode - it's omitted from the type
        await updateDoc(stapleRef, updates);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update staple';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const deleteStaple = useCallback(
    async (id: string): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const stapleRef = doc(db, 'staples', id);
        await deleteDoc(stapleRef);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete staple';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const toggleEnabled = useCallback(
    async (id: string, enabled: boolean): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const stapleRef = doc(db, 'staples', id);
        await updateDoc(stapleRef, { enabled });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to toggle staple';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  return {
    staples,
    enabledStaples,
    loading,
    error,
    addStaple,
    updateStaple,
    deleteStaple,
    toggleEnabled,
  };
}
