// src/native/storageNative.js
import { FirebaseStorage } from "@capacitor-firebase/storage";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

function isNative() {
  return Capacitor.isNativePlatform();
}

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function guessContentType(file, fallback = "image/jpeg") {
  return file?.type || fallback;
}

function guessExt(file) {
  const t = String(file?.type || "").toLowerCase();
  if (t.includes("png")) return "png";
  if (t.includes("webp")) return "webp";
  return "jpg";
}

/**
 * Upload natif:
 * - Web: plugin accepte blob
 * - iOS/Android: plugin exige uri (fichier local)
 */
export async function storageUploadImage({ path, fileOrBlob, metadata = {} }) {
  if (!path) throw new Error("storageUploadImage: path manquant");
  if (!fileOrBlob) throw new Error("storageUploadImage: file/blob manquant");

  // WEB -> blob direct
  if (!isNative()) {
    const cbId = await FirebaseStorage.uploadFile(
      { path, blob: fileOrBlob, metadata },
      () => {}
    );
    // pas nécessaire de remove callback côté web
    const { downloadUrl } = await FirebaseStorage.getDownloadUrl({ path });
    return downloadUrl;
  }

  // NATIVE -> écrire un fichier cache et uploader via uri
  const ext = guessExt(fileOrBlob);
  const contentType = metadata?.contentType || guessContentType(fileOrBlob);
  const base64 = await blobToBase64(fileOrBlob);

  const filename = `upload_${Date.now()}.${ext}`;
  const writeRes = await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  });

  const uri = writeRes?.uri;
  if (!uri) throw new Error("storageUploadImage: uri cache manquant");

  await FirebaseStorage.uploadFile(
    { path, uri, metadata: { ...metadata, contentType } },
    () => {}
  );

  const { downloadUrl } = await FirebaseStorage.getDownloadUrl({ path });
  return downloadUrl;
}

export async function storageGetDownloadUrl(path) {
  const { downloadUrl } = await FirebaseStorage.getDownloadUrl({ path });
  return downloadUrl;
}

export async function storageDeleteFile(path) {
  await FirebaseStorage.deleteFile({ path });
}