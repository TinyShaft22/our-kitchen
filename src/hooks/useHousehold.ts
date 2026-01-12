import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const STORAGE_KEY = 'householdCode';

interface UseHouseholdReturn {
  householdCode: string | null;
  loading: boolean;
  error: string | null;
  createHousehold: (customCode?: string) => Promise<string>;
  joinHousehold: (code: string) => Promise<boolean>;
  leaveHousehold: () => void;
}

export function useHousehold(): UseHouseholdReturn {
  const [householdCode, setHouseholdCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setHouseholdCode(stored);
    setLoading(false);
  }, []);

  // Generate a random 4-digit code (1000-9999)
  const generateCode = (): string => {
    return String(Math.floor(1000 + Math.random() * 9000));
  };

  const createHousehold = useCallback(async (customCode?: string): Promise<string> => {
    setError(null);
    setLoading(true);

    try {
      // If custom code provided, validate and use it
      if (customCode) {
        if (!/^\d{4}$/.test(customCode)) {
          throw new Error('Code must be exactly 4 digits');
        }

        const docRef = doc(db, 'households', customCode);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          throw new Error('This code is already taken. Try a different one.');
        }

        // Create household with custom code
        await setDoc(docRef, {
          members: [],
          createdAt: serverTimestamp(),
        });

        localStorage.setItem(STORAGE_KEY, customCode);
        setHouseholdCode(customCode);
        setLoading(false);
        return customCode;
      }

      // Otherwise, generate a random code
      let code: string;
      let attempts = 0;
      const maxAttempts = 10;

      // Keep generating until we find an unused code
      do {
        code = generateCode();
        const docRef = doc(db, 'households', code);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // Code is available, create the household
          await setDoc(docRef, {
            members: [],
            createdAt: serverTimestamp(),
          });

          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, code);
          setHouseholdCode(code);
          setLoading(false);
          return code;
        }

        attempts++;
      } while (attempts < maxAttempts);

      throw new Error('Could not generate unique code. Please try again.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create household';
      setError(message);
      setLoading(false);
      throw err;
    }
  }, []);

  const joinHousehold = useCallback(async (code: string): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      // Validate code format
      if (!/^\d{4}$/.test(code)) {
        throw new Error('Code must be 4 digits');
      }

      // Check if household exists
      const docRef = doc(db, 'households', code);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Invalid code');
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, code);
      setHouseholdCode(code);
      setLoading(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join household';
      setError(message);
      setLoading(false);
      throw err;
    }
  }, []);

  const leaveHousehold = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEY);
    setHouseholdCode(null);
    setError(null);
  }, []);

  return {
    householdCode,
    loading,
    error,
    createHousehold,
    joinHousehold,
    leaveHousehold,
  };
}
