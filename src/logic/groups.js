// src/logic/groups.js
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

export function cleanGroupId(id) {
  return String(id || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

export async function createGroup({ db, user, groupId, pseudo }) {
  const gid = cleanGroupId(groupId);
  if (!gid) throw new Error("ID groupe invalide");

  const groupRef = doc(db, "groups", gid);
  const memberRef = doc(db, `groups/${gid}/members/${user.uid}`);

  await runTransaction(db, async (tx) => {
    if ((await tx.get(groupRef)).exists()) {
      throw new Error("Ce groupe existe déjà");
    }

    tx.set(groupRef, {
      id: gid,
      createdAt: serverTimestamp(),
      ownerUid: user.uid,
    });

    tx.set(memberRef, {
      pseudo,
      avatarUrl: "",
      points: 0,
      stats: { success: 0, fail: 0, eco: 0 },
      createdAt: serverTimestamp(),
    });
  });

  return gid;
}

export async function joinGroup({ db, user, groupId, pseudo }) {
  const gid = cleanGroupId(groupId);

  const groupRef = doc(db, "groups", gid);
  const memberRef = doc(db, `groups/${gid}/members/${user.uid}`);

  await runTransaction(db, async (tx) => {
    if (!(await tx.get(groupRef)).exists()) {
      throw new Error("Groupe introuvable");
    }

    tx.set(
      memberRef,
      {
        pseudo,
        avatarUrl: "",
        points: 0,
        stats: { success: 0, fail: 0, eco: 0 },
        joinedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
}
