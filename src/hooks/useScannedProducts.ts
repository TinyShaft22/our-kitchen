import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ScannedProduct } from '../types';

interface UseScannedProductsReturn {
  products: ScannedProduct[];
  loading: boolean;
  error: string | null;
  getByBarcode: (barcode: string) => ScannedProduct | null;
  addProduct: (product: Omit<ScannedProduct, 'id' | 'householdCode' | 'lastUpdated'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Omit<ScannedProduct, 'id' | 'householdCode'>>) => Promise<void>;
}

export function useScannedProducts(householdCode: string | null): UseScannedProductsReturn {
  const [products, setProducts] = useState<ScannedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for scannedProducts collection
  useEffect(() => {
    if (!householdCode) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const productsRef = collection(db, 'scannedProducts');
    const q = query(productsRef, where('householdCode', '==', householdCode));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsList: ScannedProduct[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            // Convert Firestore Timestamp to Date
            lastUpdated: data.lastUpdated instanceof Timestamp
              ? data.lastUpdated.toDate()
              : new Date(data.lastUpdated),
          } as ScannedProduct;
        });
        setProducts(productsList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching scanned products:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdCode]);

  // Look up a product by barcode in the local cache
  const getByBarcode = useCallback(
    (barcode: string): ScannedProduct | null => {
      return products.find((p) => p.barcode === barcode) ?? null;
    },
    [products]
  );

  const addProduct = useCallback(
    async (product: Omit<ScannedProduct, 'id' | 'householdCode' | 'lastUpdated'>): Promise<string> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        // Check if barcode already exists
        const productsRef = collection(db, 'scannedProducts');
        const q = query(
          productsRef,
          where('householdCode', '==', householdCode),
          where('barcode', '==', product.barcode)
        );
        const existing = await getDocs(q);

        if (!existing.empty) {
          // Update existing product instead of creating duplicate
          const existingDoc = existing.docs[0];
          await updateDoc(existingDoc.ref, {
            ...product,
            lastUpdated: Timestamp.now(),
          });
          return existingDoc.id;
        }

        // Create new product
        const docRef = await addDoc(productsRef, {
          ...product,
          householdCode,
          lastUpdated: Timestamp.now(),
        });
        return docRef.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add scanned product';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Omit<ScannedProduct, 'id' | 'householdCode'>>): Promise<void> => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const productRef = doc(db, 'scannedProducts', id);
        await updateDoc(productRef, {
          ...updates,
          lastUpdated: Timestamp.now(),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update scanned product';
        setError(message);
        throw err;
      }
    },
    [householdCode]
  );

  return {
    products,
    loading,
    error,
    getByBarcode,
    addProduct,
    updateProduct,
  };
}
