import { useState, useCallback } from 'react';
import { lookupBarcode, type ProductLookupResult } from '../services/openFoodFacts';
import { useScannedProducts } from './useScannedProducts';
import type { ScannedProduct } from '../types';

export type LookupState = 'idle' | 'checking-cache' | 'fetching' | 'found' | 'not-found' | 'error';

interface LookupResultWithSource extends ProductLookupResult {
  source: 'cache' | 'off' | 'none';
  cachedProduct?: ScannedProduct;
}

interface UseOpenFoodFactsReturn {
  state: LookupState;
  result: LookupResultWithSource | null;
  error: string | null;
  lookup: (barcode: string) => Promise<LookupResultWithSource>;
  cacheProduct: (product: Omit<ScannedProduct, 'id' | 'householdCode' | 'lastUpdated'>) => Promise<string>;
  clearResult: () => void;
}

export function useOpenFoodFacts(householdCode: string | null): UseOpenFoodFactsReturn {
  const [state, setState] = useState<LookupState>('idle');
  const [result, setResult] = useState<LookupResultWithSource | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getByBarcode, addProduct } = useScannedProducts(householdCode);

  const lookup = useCallback(
    async (barcode: string): Promise<LookupResultWithSource> => {
      setState('checking-cache');
      setError(null);

      try {
        // Step 1: Check local cache first
        const cached = getByBarcode(barcode);
        if (cached) {
          const cacheResult: LookupResultWithSource = {
            found: true,
            barcode,
            name: cached.name,
            brand: cached.brand,
            imageUrl: cached.imageUrl,
            source: 'cache',
            cachedProduct: cached,
          };
          setResult(cacheResult);
          setState('found');
          return cacheResult;
        }

        // Step 2: Query Open Food Facts
        setState('fetching');
        const offResult = await lookupBarcode(barcode);

        if (offResult.found) {
          // Cache the result for future lookups
          if (householdCode) {
            await addProduct({
              barcode,
              name: offResult.name || 'Unknown Product',
              brand: offResult.brand,
              imageUrl: offResult.imageUrl,
              source: 'off',
            });
          }

          const foundResult: LookupResultWithSource = {
            ...offResult,
            source: 'off',
          };
          setResult(foundResult);
          setState('found');
          return foundResult;
        }

        // Step 3: Not found anywhere
        const notFoundResult: LookupResultWithSource = {
          found: false,
          barcode,
          source: 'none',
        };
        setResult(notFoundResult);
        setState('not-found');
        return notFoundResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lookup failed';
        setError(message);
        setState('error');
        return {
          found: false,
          barcode,
          source: 'none',
        };
      }
    },
    [getByBarcode, addProduct, householdCode]
  );

  const cacheProduct = useCallback(
    async (product: Omit<ScannedProduct, 'id' | 'householdCode' | 'lastUpdated'>): Promise<string> => {
      return addProduct(product);
    },
    [addProduct]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setState('idle');
    setError(null);
  }, []);

  return {
    state,
    result,
    error,
    lookup,
    cacheProduct,
    clearResult,
  };
}
