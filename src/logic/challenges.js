// src/Logic/challenges.js
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { dayKeyNow } from "./day";
import { pickRandomCard } from "./cards";

function slugify(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function getCardType(card) {
  const direct =
    card?.type ??
    card?.theme ??
    card?.category ??
    card?.categorie ??
    card?.kind ??
    card?.tag;

  if (direct) return direct;

  const color = String(card?.color ?? card?.couleur ?? "").toLowerCase();
  if (["green", "vert", "verte"].includes(color)) return "challenge";
  if (["blue", "bleu", "bleue"].includes(color)) return "bonne_conduite";
  if (["red", "rouge"].includes(color)) return "contrainte";

  return null;
}

export async function sendChallenge({
  db,
  gameId,
  user,
  cards,
  toUid,
  cardId,
}) {
  if (!user) throw new Error("Non connecté");
  if (!toUid) throw new Error("Choisis un destinataire");
  if (!cardId) throw new Error("Choisis une carte");
  if (toUid === user.uid)
    throw new Error("Tu ne peux pas t’envoyer à toi-même");

  const today = dayKeyNow();

  const card = cards.find((c) => c.id === cardId);
  if (!card) throw new Error("Carte introuvable");

  // ✅ IMPORTANT: fallback anti-undefined (ça évite ton crash)
  const rawType = getCardType(card) || "unknown";
  const typeKey = slugify(rawType) || "unknown";

  const meRef = doc(db, `games/${gameId}/members/${user.uid}`);
  const chId = `${today}_${user.uid}_${toUid}_${typeKey}`;
  const chRef = doc(db, `games/${gameId}/challenges/${chId}`);

  await runTransaction(db, async (tx) => {
    const meSnap = await tx.get(meRef);
    if (!meSnap.exists()) throw new Error("Pas dans le jeu");

    const existing = await tx.get(chRef);
    if (existing.exists()) {
      throw new Error("Déjà envoyé aujourd’hui pour ce thème à cette personne");
    }

    const meData = meSnap.data();
    const hand = meData.hand || [];
    if (!hand.includes(cardId)) throw new Error("Carte pas dans ta main");

    tx.update(meRef, { hand: hand.filter((x) => x !== cardId) });

    tx.set(chRef, {
      dayKey: today,
      fromUid: user.uid,
      fromName: meData.displayName || "Skieur",
      toUid,
      cardId,

      // ✅ jamais undefined
      type: rawType,
      typeKey,

      status: "pending",
      createdAt: serverTimestamp(),
    });
  });
}

export async function resolveChallenge({
  db,
  gameId,
  user,
  cards,
  challengeId,
  result,
}) {
  if (!user) throw new Error("Non connecté");
  if (!challengeId) throw new Error("Défi introuvable");
  if (result !== "success" && result !== "fail")
    throw new Error("Résultat invalide");

  const chRef = doc(db, `games/${gameId}/challenges/${challengeId}`);
  const meRef = doc(db, `games/${gameId}/members/${user.uid}`);

  await runTransaction(db, async (tx) => {
    const chSnap = await tx.get(chRef);
    if (!chSnap.exists()) throw new Error("Défi introuvable");

    const ch = chSnap.data();
    if (ch.toUid !== user.uid) throw new Error("Pas ton défi");
    if (ch.status !== "pending") throw new Error("Défi déjà résolu");

    const meSnap = await tx.get(meRef);
    if (!meSnap.exists()) throw new Error("Pas dans le jeu");

    const me = meSnap.data();
    const hand = me.hand || [];

    let nextHand = hand;
    let gained = 0;

    if (result === "success") {
      const card = cards.find((c) => c.id === ch.cardId);
      gained = card?.points || 0;

      const newCard = pickRandomCard(cards, new Set(hand));
      if (newCard) nextHand = [...hand, newCard.id];
    }

    tx.update(chRef, { status: result, resolvedAt: serverTimestamp() });
    tx.update(meRef, { hand: nextHand, points: (me.points || 0) + gained });
  });
}
