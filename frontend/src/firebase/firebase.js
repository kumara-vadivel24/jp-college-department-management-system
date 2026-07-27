import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
 apiKey: "AIzaSyDlVKgbXPIEONSA079arUcxv0Qb5wAguuU",

    authDomain: "aiandds-erp.firebaseapp.com",

    projectId: "aiandds-erp",

    storageBucket: "aiandds-erp.firebasestorage.app",

    messagingSenderId: "756088256387",

    appId: "1:756088256387:web:b8f0fc4007343408f8a8b6",

    measurementId: "G-17Q2W7XFQR"

  };


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
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
  }).catch(() => {});
}

export default app;
