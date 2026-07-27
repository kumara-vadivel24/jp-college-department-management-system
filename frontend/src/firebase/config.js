import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDlVKgbXPIEONSA079arUcxv0Qb5wAguuU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aiandds-erp.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aiandds-erp",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aiandds-erp.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "756088256387",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:756088256387:web:b8f0fc4007343408f8a8b6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-17Q2W7XFQR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics support check
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export default app;
