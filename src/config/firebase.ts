import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCQYnOc20ViDbYAD6wMxosmp0riF6Fpao",
  authDomain: "gridshield-ai.firebaseapp.com",
  projectId: "gridshield-ai",
  storageBucket: "gridshield-ai.firebasestorage.app",
  messagingSenderId: "615667607857",
  appId: "1:615667607857:web:fc46c4af601e371224a810",
  measurementId: "G-MQJH6ZZJ41"
};

export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
