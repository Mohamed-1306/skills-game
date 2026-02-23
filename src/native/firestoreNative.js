// src/native/firestoreNative.js
import { FirebaseFirestore } from "@capacitor-firebase/firestore";

/**
 * Convertit un snapshot plugin -> { id, ...data }
 * (défensif, car selon plateformes/types, les champs peuvent varier)
 */
function docToObj(doc) {
  const id = doc?.id ?? doc?.reference?.split("/").pop() ?? "";
  const data = doc?.data ?? doc?.data?.() ?? doc?.snapshot?.data ?? {};
  return { id, ...(data || {}) };
}

/** Document: set (merge option) */
export async function fsSetDoc(reference, data, merge = true) {
  await FirebaseFirestore.setDocument({ reference, data, merge });
}

/** Document: get */
export async function fsGetDoc(reference) {
  const res = await FirebaseFirestore.getDocument({ reference });
  // res.snapshot: DocumentSnapshot
  const snap = res?.snapshot;
  const exists =
    snap?.exists ?? (snap?.data != null && Object.keys(snap.data).length > 0);
  return { exists: !!exists, data: snap?.data || null, id: snap?.id || null };
}

/** Document: update */
export async function fsUpdateDoc(reference, data) {
  await FirebaseFirestore.updateDocument({ reference, data });
}

/** Document: delete */
export async function fsDeleteDoc(reference) {
  await FirebaseFirestore.deleteDocument({ reference });
}

/** Collection: get */
export async function fsGetCollection(reference, { compositeFilter, queryConstraints } = {}) {
  const res = await FirebaseFirestore.getCollection({
    reference,
    compositeFilter,
    queryConstraints,
  });
  const snaps = res?.snapshots || res?.snapshot?.documents || [];
  // Selon la lib, ça peut être res.snapshots: DocumentSnapshot[]
  return Array.isArray(snaps) ? snaps.map(docToObj) : [];
}

/**
 * Collection: listen
 * @returns {Promise<() => Promise<void>>} unsubscribe async
 */
export async function fsListenCollection(
  reference,
  { compositeFilter, queryConstraints } = {},
  onData,
  onError
) {
  const callbackId = await FirebaseFirestore.addCollectionSnapshotListener(
    { reference, compositeFilter, queryConstraints },
    (event) => {
      try {
        const snaps = event?.snapshots || event?.documents || event?.snapshot?.documents || [];
        const list = Array.isArray(snaps) ? snaps.map(docToObj) : [];
        onData(list, event);
      } catch (e) {
        onError?.(e);
      }
    }
  );

  return async () => {
    await FirebaseFirestore.removeSnapshotListener({ callbackId });
  };
}

/**
 * Document: listen
 */
export async function fsListenDoc(reference, onData, onError) {
  const callbackId = await FirebaseFirestore.addDocumentSnapshotListener(
    { reference },
    (event) => {
      try {
        const snap = event?.snapshot || event;
        onData(
          {
            id: snap?.id ?? reference.split("/").pop(),
            exists: !!snap?.exists,
            data: snap?.data || null,
          },
          event
        );
      } catch (e) {
        onError?.(e);
      }
    }
  );

  return async () => {
    await FirebaseFirestore.removeSnapshotListener({ callbackId });
  };
}

/**
 * Helpers “filters / constraints”
 * ⚠️ Pour l’instant, on ne génère pas ces objets (les types sont plus bas dans le d.ts).
 * On les passera tels quels depuis l’appelant.
 *
 * Si tu veux, à l’étape suivante on extrait et on te donne des helpers where/orderBy/limit prêts à l’emploi.
 */