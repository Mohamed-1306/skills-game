// src/Lopickextgic/photos.js
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/* =========================
   Utils
========================= */

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} (timeout ${ms}ms)`)), ms)
    ),
  ]);
}

function pickExt(blobOrFile, originalFile) {
  // blob => jpeg
  if (blobOrFile instanceof Blob) return "jpg";

  const t = String(originalFile?.type || "").toLowerCase();
  if (t.includes("heic")) return "heic";
  if (t.includes("heif")) return "heif";
  if (t.includes("png")) return "png";
  return "jpg";
}

function pickContentType(blobOrFile, originalFile) {
  return blobOrFile instanceof Blob
    ? "image/jpeg"
    : originalFile?.type || "image/jpeg";
}

/* =========================
   Compression SAFE
========================= */
/**
 * Compression via canvas.
 * - HEIC/HEIF: renvoie tel quel (iOS)
 * - Timeout pour éviter les blocages
 */
export async function compressImage(file, maxSide = 3200, quality = 0.92) {
  if (!file) throw new Error("Aucun fichier");

  // iOS HEIC/HEIF -> upload brut
  if (file.type === "image/heic" || file.type === "image/heif") return file;
  if (!String(file.type || "").startsWith("image/")) return file;

  // Charger image (createImageBitmap si possible)
  let width = 0;
  let height = 0;
  let drawFn = null;

  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await withTimeout(
        createImageBitmap(file),
        8000,
        "createImageBitmap bloqué"
      );

      width = bmp.width;
      height = bmp.height;
      drawFn = (ctx, w, h) => {
        ctx.drawImage(bmp, 0, 0, w, h);
        try {
          bmp.close?.();
        } catch {}
      };
    } catch {
      // fallback <img>
    }
  }

  if (!drawFn) {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);

    try {
      await withTimeout(
        new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        }),
        8000,
        "Chargement image bloqué"
      );

      width = img.naturalWidth || img.width;
      height = img.naturalHeight || img.height;

      drawFn = (ctx, w, h) => {
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      URL.revokeObjectURL(url);
      console.warn("compressImage fallback -> upload brut", e);
      return file;
    }
  }

  if (!width || !height) return file;

  const scale = Math.min(1, maxSide / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  drawFn(ctx, targetW, targetH);

  const blob = await withTimeout(
    new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality)),
    8000,
    "Compression bloquée"
  );

  return blob || file;
}

/* =========================
   Upload RESUMABLE + timeout
========================= */

async function uploadResumableWithTimeout(
  storageRef,
  blobOrFile,
  metadata,
  ms = 25000
) {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, blobOrFile, metadata);

    let lastProgressAt = Date.now();
    let lastBytes = 0;

    const watchdog = setInterval(() => {
      const snap = task.snapshot;
      const bytes = snap?.bytesTransferred || 0;

      // Si ça progresse, on reset le timer
      if (bytes !== lastBytes) {
        lastBytes = bytes;
        lastProgressAt = Date.now();
      }

      // Si aucun progrès pendant ms -> cancel
      if (Date.now() - lastProgressAt > ms) {
        try {
          task.cancel();
        } catch {}
        clearInterval(watchdog);
        reject(
          new Error(
            "Upload bloqué (aucun progrès). Vérifie réseau / Safari / règles Storage."
          )
        );
      }
    }, 800);

    task.on(
      "state_changed",
      () => {},
      (err) => {
        clearInterval(watchdog);
        reject(err);
      },
      () => {
        clearInterval(watchdog);
        resolve(task.snapshot);
      }
    );
  });
}

/* =========================
   Public API: uploads
========================= */

export async function uploadAvatarPhoto({ file, uid }) {
  if (!file) throw new Error("Aucun fichier");
  if (!uid) throw new Error("uid manquant");

  const blobOrFile = await compressImage(file, 1200, 0.9);
  const ext = pickExt(blobOrFile, file);

  const path = `avatars/${uid}.${ext}`;
  const r = ref(storage, path);

  await uploadResumableWithTimeout(
    r,
    blobOrFile,
    { contentType: pickContentType(blobOrFile, file) },
    25000
  );

  return await withTimeout(getDownloadURL(r), 8000, "getDownloadURL bloqué");
}

export async function uploadChallengePhoto({ file, groupId, challengeId }) {
  if (!file) throw new Error("Aucun fichier");
  if (!groupId) throw new Error("groupId manquant");
  if (!challengeId) throw new Error("challengeId manquant");

  const blobOrFile = await compressImage(file, 2600, 0.9);
  const ext = pickExt(blobOrFile, file);

  const path = `groups/${groupId}/challenges/${challengeId}.${ext}`;
  const r = ref(storage, path);

  await uploadResumableWithTimeout(
    r,
    blobOrFile,
    { contentType: pickContentType(blobOrFile, file) },
    25000
  );

  return await withTimeout(getDownloadURL(r), 8000, "getDownloadURL bloqué");
}

export async function uploadGroupPostPhoto({ file, groupId, postId }) {
  console.log("BUCKET:", storage.app.options.storageBucket);
  console.log(
    "AUTH UID:",
    storage.app.options.projectId,
    "uid:",
    (await import("firebase/auth")).getAuth().currentUser?.uid
  );

  if (!file) throw new Error("Aucun fichier");
  if (!groupId) throw new Error("groupId manquant");
  if (!postId) throw new Error("postId manquant");

  const blobOrFile = await compressImage(file, 2600, 0.9);
  const ext = pickExt(blobOrFile, file);

  const path = `groups/${groupId}/posts/${postId}.${ext}`;
  const r = ref(storage, path);

  await uploadResumableWithTimeout(
    r,
    blobOrFile,
    { contentType: pickContentType(blobOrFile, file) },
    25000
  );

  return await withTimeout(getDownloadURL(r), 8000, "getDownloadURL bloqué");
}
