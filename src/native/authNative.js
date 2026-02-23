// src/native/authNative.js
// ✅ CORRIGÉ : Suppression double authentification Apple

import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { getAuth, signOut } from "firebase/auth";

/**
 * ✅ FIX CRITIQUE : Apple Sign In
 * FirebaseAuthentication.signInWithApple() authentifie DIRECTEMENT avec Firebase
 * Pas besoin de réauthentifier avec signInWithCredential()
 */
export async function nativeSignInApple() {
  console.log("[Native] Starting Apple sign-in with FirebaseAuthentication");
  
  const result = await FirebaseAuthentication.signInWithApple({
    skipNativeAuth: false, // Firebase gère l'authentification
  });
  
  console.log("[Native] Apple sign-in success:", result?.user?.uid);
  
  if (!result?.user) {
    throw new Error("Apple sign-in: no user returned");
  }
  
  return result.user;
}

/**
 * Sign Out
 */
export async function nativeSignOut() {
  const auth = getAuth();
  await signOut(auth);
  await FirebaseAuthentication.signOut();
}

/**
 * Get Current User
 */
export async function nativeGetCurrentUser() {
  try {
    const result = await FirebaseAuthentication.getCurrentUser();
    return result?.user || null;
  } catch (error) {
    console.error("[Native] getCurrentUser error:", error);
    return null;
  }
}

/**
 * Auth State Listener
 */
export async function nativeOnAuthStateChange(callback) {
  return await FirebaseAuthentication.addListener('authStateChange', (change) => {
    callback(change?.user || null);
  });
}