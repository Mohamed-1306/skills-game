// src/Logic/avatar.js
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { compressImage } from "./photos";

/**
 * Upload l'avatar de l'utilisateur et synchronise Firestore
 * @param {Object} params
 * @param {import("firebase/firestore").Firestore} params.db
 * @param {Object} params.user - user Firebase Auth
 * @param {File} params.file - image choisie
 * @param {string} [params.groupId] - groupe actif (optionnel)
 */
export async function uploadMyAvatar({ db, user, file, groupId }) {
  if (!user?.uid) throw new Error("Utilisateur non connecté");
  if (!file) throw new Error("Aucun fichier fourni");

  // 1️⃣ Compression
  const compressed = await compressImage(file, 900, 0.85);

  const storage = getStorage();
  const ext = file.type?.includes("png") ? "png" : "jpg";
  const path = `avatars/${user.uid}.${ext}`;
  const storageRef = ref(storage, path);

  // 2️⃣ Upload
  await uploadBytes(storageRef, compressed, {
    contentType: ext === "png" ? "image/png" : "image/jpeg",
    cacheControl: "public,max-age=3600", // cache OK, on bust côté UI
  });

  // 3️⃣ URL
  const avatarUrl = await getDownloadURL(storageRef);
  const avatarUpdatedAt = serverTimestamp();

  // 4️⃣ users/{uid}
  await setDoc(
    doc(db, "users", user.uid),
    {
      avatarUrl,
      avatarUpdatedAt,
    },
    { merge: true }
  );

  // 5️⃣ groups/{groupId}/members/{uid}
  if (groupId) {
    await setDoc(
      doc(db, `groups/${groupId}/members/${user.uid}`),
      {
        avatarUrl,
        avatarUpdatedAt,
      },
      { merge: true }
    );
  }

  return avatarUrl;
}
