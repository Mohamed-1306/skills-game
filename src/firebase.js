// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAW5eMfmngHHP1Cwar6kayVSBKLPVCBsvQ",
  authDomain: "application13-12.firebaseapp.com",
  projectId: "application13-12",
  storageBucket: "application13-12.firebasestorage.app",
  messagingSenderId: "631002991387",
  appId: "1:631002991387:web:ed87ca8d32789b3bd002ed",
};

// ✅ Important : n'initialise qu'une seule fois (utile en dev / hot reload)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Services Firebase (UNE seule source de vérité)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
