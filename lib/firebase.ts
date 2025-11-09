import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCgHR2yS9u_kX0YQU6FyfEAzJHZeenyWVw",
  authDomain: "testmanship-ac721.firebaseapp.com",
  projectId: "testmanship-ac721",
  storageBucket: "testmanship-ac721.firebasestorage.app",
  messagingSenderId: "221057021972",
  appId: "1:221057021972:web:66096756d4ba3e1bd70f01",
  measurementId: "G-D4XL0F89R1"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only in browser
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, db, analytics };
