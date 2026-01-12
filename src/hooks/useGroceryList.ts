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
import type { GroceryItem, GroceryStatus, Store } from '../types';
import type { GroceryItemInput } from '../utils/generateGroceryItems';

export type { GroceryItemInput } from '../utils/generateGroceryItems';

interface UseGroceryListReturn {
  items: GroceryItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<GroceryItem, 'id' | 'householdCode'>) => Promise<string>;
  updateItem: (id: string, updates: Partial<Omit<GroceryItem, 'id' | 'householdCode'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateStatus: (id: string, status: GroceryStatus) => Promise<void>;
  clearBoughtItems: () => Promise<void>;
  generateFromWeeklyPlan: (items: GroceryItemInput[]) => Promise<void>;
  completeTrip: (store?: Store) => Promise<number>;
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

  const completeTrip = useCallback(
    async (store?: Store): Promise<number> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const groceryRef = collection(db, 'groceryList');
        const q = query(
          groceryRef,
          where('householdCode', '==', householdCode),
          where('status', '==', 'in-cart')
        );

        const snapshot = await getDocs(q);

        // Filter by store client-side to avoid compound index requirement
        const toDelete = store
          ? snapshot.docs.filter((d) => d.data().store === store)
          : snapshot.docs;

        if (toDelete.length === 0) {
          return 0;
        }

        const batch = writeBatch(db);
        toDelete.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();

        return toDelete.length;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to complete trip';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const generateFromWeeklyPlan = useCallback(
    async (newItems: GroceryItemInput[]): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const groceryRef = collection(db, 'groceryList');
        const batch = writeBatch(db);

        // Step 1: Delete all existing items where source === 'meal'
        const q = query(
          groceryRef,
          where('householdCode', '==', householdCode),
          where('source', '==', 'meal')
        );

        const snapshot = await getDocs(q);
        snapshot.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });

        // Step 2: Add all new items with status 'need' and source 'meal'
        for (const item of newItems) {
          const newDocRef = doc(groceryRef);
          batch.set(newDocRef, {
            ...item,
            status: 'need',
            source: 'meal',
            householdCode,
          });
        }

        // Step 3: Commit the batch atomically
        await batch.commit();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate grocery list';
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
    updateStatus,
    clearBoughtItems,
    generateFromWeeklyPlan,
    completeTrip,
  };
}
