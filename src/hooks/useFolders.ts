import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface Folder {
  id: string;
  path: string;
  type: 'main' | 'baking';
  householdCode: string;
}

interface UseFoldersReturn {
  folders: Folder[];
  mainFolders: string[];
  bakingFolders: string[];
  loading: boolean;
  addFolder: (path: string, type: 'main' | 'baking') => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
}

export function useFolders(householdCode: string | null): UseFoldersReturn {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const foldersRef = useRef<Folder[]>([]);

  // Real-time listener for folders collection
  useEffect(() => {
    if (!householdCode) {
      setFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const foldersCollection = collection(db, 'folders');
    const q = query(foldersCollection, where('householdCode', '==', householdCode));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const folderList: Folder[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Folder[];
        setFolders(folderList);
        foldersRef.current = folderList;
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching folders:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdCode]);

  // Filter folders by type
  const mainFolders = folders
    .filter((f) => f.type === 'main')
    .map((f) => f.path)
    .sort();

  const bakingFolders = folders
    .filter((f) => f.type === 'baking')
    .map((f) => f.path)
    .sort();

  const addFolder = useCallback(
    async (path: string, type: 'main' | 'baking') => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      // Use ref for current folders to avoid stale closure
      const currentFolders = foldersRef.current;

      // Check if folder already exists
      const exists = currentFolders.some((f) => f.path === path && f.type === type);
      if (exists) {
        throw new Error('A folder with this name already exists');
      }

      try {
        const foldersCollectionRef = collection(db, 'folders');
        await addDoc(foldersCollectionRef, {
          path,
          type,
          householdCode,
        });
      } catch (err) {
        console.error('Failed to add folder:', err);
        throw err;
      }
    },
    [householdCode]
  );

  const deleteFolder = useCallback(
    async (folderId: string) => {
      if (!householdCode) {
        throw new Error('No household code available');
      }

      try {
        const folderRef = doc(db, 'folders', folderId);
        await deleteDoc(folderRef);
      } catch (err) {
        console.error('Failed to delete folder:', err);
        throw err;
      }
    },
    [householdCode]
  );

  return {
    folders,
    mainFolders,
    bakingFolders,
    loading,
    addFolder,
    deleteFolder,
  };
}
