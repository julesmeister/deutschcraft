import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXN6iUqGKTGX-Q6pxze0khGuCDHBU298k",
  authDomain: "testmanship-ac721.firebaseapp.com",
  projectId: "testmanship-ac721",
  storageBucket: "testmanship-ac721.firebasestorage.app",
  messagingSenderId: "221057021972",
  appId: "1:221057021972:web:545c0b140fe7c3fad70f01"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
