// src/logic/auth.js
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

export async function signInWithGoogle(auth) {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch {
    await signInWithRedirect(auth, provider);
  }
}

export async function logout(auth) {
  await signOut(auth);
}
