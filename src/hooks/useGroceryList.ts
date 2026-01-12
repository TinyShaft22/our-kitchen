import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { GroceryItem, GroceryStatus } from '../types';

interface UseGroceryListReturn {
  items: GroceryItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<GroceryItem, 'id' | 'householdCode'>) => Promise<string>;
  updateItem: (id: string, updates: Partial<Omit<GroceryItem, 'id' | 'householdCode'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateStatus: (id: string, status: GroceryStatus) => Promise<void>;
  clearBoughtItems: () => Promise<void>;
}

export function useGroceryList(householdCode: string | null): UseGroceryListReturn {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for groceryList collection
  useEffect(() => {
    // Return early if no householdCode
    if (!householdCode) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const groceryRef = collection(db, 'groceryList');
    const q = query(
      groceryRef,
      where('householdCode', '==', householdCode),
      orderBy('category'),
      orderBy('name')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemsList: GroceryItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as GroceryItem[];
        setItems(itemsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching grocery list:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [householdCode]);

  const addItem = useCallback(
    async (item: Omit<GroceryItem, 'id' | 'householdCode'>): Promise<string> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const groceryRef = collection(db, 'groceryList');
        const docRef = await addDoc(groceryRef, {
          ...item,
          householdCode, // Auto-inject householdCode
        });
        return docRef.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add item';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<Omit<GroceryItem, 'id' | 'householdCode'>>): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const itemRef = doc(db, 'groceryList', id);
        await updateDoc(itemRef, updates);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update item';
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
        const itemRef = doc(db, 'groceryList', id);
        await deleteDoc(itemRef);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete item';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const updateStatus = useCallback(
    async (id: string, status: GroceryStatus): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const itemRef = doc(db, 'groceryList', id);
        await updateDoc(itemRef, { status });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update status';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const clearBoughtItems = useCallback(async (): Promise<void> => {
    if (!householdCode) {
      throw new Error('No household code available');
    }

    try {
      const groceryRef = collection(db, 'groceryList');
      const q = query(
        groceryRef,
        where('householdCode', '==', householdCode),
        where('status', '==', 'bought')
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return; // Nothing to delete
      }

      // Use batch delete for efficiency
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear bought items';
      setError(message);
      throw err;
    }
  }, [householdCode]);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    updateStatus,
    clearBoughtItems,
  };
}
