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
import type { HouseholdItem } from '../types';

interface UseHouseholdItemsReturn {
  items: HouseholdItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<HouseholdItem, 'id' | 'householdCode' | 'nameLower'>) => Promise<string>;
  updateItem: (id: string, updates: Partial<Omit<HouseholdItem, 'id' | 'householdCode' | 'nameLower'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export function useHouseholdItems(householdCode: string | null): UseHouseholdItemsReturn {
  const [items, setItems] = useState<HouseholdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for householdItems collection
  useEffect(() => {
    // Return early if no householdCode
    if (!householdCode) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const itemsRef = collection(db, 'householdItems');
    const q = query(itemsRef, where('householdCode', '==', householdCode));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemsList: HouseholdItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as HouseholdItem[];
        setItems(itemsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching household items:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [householdCode]);

  const addItem = useCallback(
    async (item: Omit<HouseholdItem, 'id' | 'householdCode' | 'nameLower'>): Promise<string> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const itemsRef = collection(db, 'householdItems');
        const docRef = await addDoc(itemsRef, {
          ...item,
          nameLower: item.name.trim().toLowerCase(), // Auto-compute nameLower
          householdCode, // Auto-inject householdCode
        });
        return docRef.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add household item';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<Omit<HouseholdItem, 'id' | 'householdCode' | 'nameLower'>>): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const itemRef = doc(db, 'householdItems', id);
        // If name is being updated, also update nameLower
        const finalUpdates: Record<string, unknown> = { ...updates };
        if (updates.name) {
          finalUpdates.nameLower = updates.name.trim().toLowerCase();
        }
        await updateDoc(itemRef, finalUpdates);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update household item';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const itemRef = doc(db, 'householdItems', id);
        await deleteDoc(itemRef);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete household item';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
  };
}
