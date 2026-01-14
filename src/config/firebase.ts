import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence enabled
// Uses IndexedDB for caching with multi-tab support
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (error) {
  // Fallback: persistence may fail in some browsers (e.g., private browsing)
  // or if Firestore was already initialized without persistence
  console.warn('Firestore persistence unavailable, using default cache:', error);
  // Import getFirestore dynamically as fallback
  const { getFirestore } = await import('firebase/firestore');
  db = getFirestore(app);
}

// Initialize Cloud Functions
const functions: Functions = getFunctions(app);

// Initialize Firebase Storage
const storage: FirebaseStorage = getStorage(app);

export { app, db, functions, storage };
