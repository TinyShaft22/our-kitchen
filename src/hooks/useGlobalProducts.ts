import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { GlobalProduct } from '../types';

const COLLECTION = 'globalProducts';

export function useGlobalProducts() {
  const getGlobalProduct = async (barcode: string): Promise<GlobalProduct | null> => {
    try {
      const docRef = doc(db, COLLECTION, barcode);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        ...data,
        barcode: docSnap.id,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate()
          : new Date(data.updatedAt),
      } as GlobalProduct;
    } catch (err) {
      console.error('Error fetching global product:', err);
      return null;
    }
  };

  const setGlobalProduct = async (
    product: Omit<GlobalProduct, 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    const docRef = doc(db, COLLECTION, product.barcode);
    await setDoc(
      docRef,
      {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  };

  return { getGlobalProduct, setGlobalProduct };
}
