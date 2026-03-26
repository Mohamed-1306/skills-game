// src/App.js



import { useEffect, useMemo, useRef, useState } from "react";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";

import { db, storage } from "./firebase";

import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  where,
  setDoc,
  getDoc,
} from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// i18n imports
import './i18n';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';

import Hand from "./components/Hand";
import SendCard from "./components/SendCard";
import Incoming from "./components/Incoming";
import Toast from "./components/Toast";
import Leaderboard from "./components/Leaderboard";
import History from "./components/History";
import { QRCodeCanvas } from "qrcode.react";
import GroupFeed from "./components/GroupFeed";
import QrScanner from "./components/QrScanner";
import HomeScreen from "./screens/HomeScreen";
import BottomNav from "./components/BottomNav";

import Logo from "./assets/logo-skills-challenge.svg";



console.log("STORAGE BUCKET =", storage?.app?.options?.storageBucket);

console.log("APP BUILD:", "2026-02-06 15:xx");
/* =========================
   Errors (lisibles + debug)
========================= */
function humanFirebaseError(error) {
  const code = error?.code || "";
  const msg = error?.message || "";
  const debug = `[${code || "no-code"}] ${msg || "no-message"}`;

  // Auth
  switch (code) {
    case "auth/invalid-email":
      return "Adresse email invalide.";
    case "auth/user-not-found":
      return "Aucun compte n’est associé à cet email.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email ou mot de passe incorrect.";
    case "auth/missing-password":
      return "Veuillez entrer un mot de passe.";
    case "auth/weak-password":
      return "Le mot de passe doit contenir au moins 6 caractères.";
    case "auth/email-already-in-use":
      return "Un compte existe déjà avec cet email.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Réessaie plus tard.";
    default:
      break;
  }

 // Firestore (messages UX)
if (code === "not-found") {
  return "Élément introuvable.";
}
if (code === "invalid-argument") {
  return "Donnée invalide. Vérifie les informations saisies.";
}

return "";
}


function handleAuthError(e, setErr) {
  // ✅ FIX: Log l'erreur de manière lisible
  console.error("[ERROR] Code:", e?.code);
  console.error("[ERROR] Message:", e?.message);
  console.error("[ERROR] Full:", JSON.stringify(e, null, 2));
  
  if (e?.message && !e?.code) {
    setErr(e.message);
    return;
  }
  const msg = humanFirebaseError(e);
  console.error("[ERROR] Humanized:", msg);
  setErr(msg);
}


/* =========================
   UI THEME
========================= */
const ui = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #0b5ed7 0%, #3aa0ff 35%, #e7f1ff 70%, #ffffff 100%)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    paddingBottom: 90,
  },
  container: { maxWidth: 980, margin: "0 auto", padding: 24 },

  header: {
    padding: 14,
    borderRadius: 18,
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.25)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.15)",
  },

  title: {
    margin: 0,
    color: "#fff",
    textShadow: "0 2px 12px rgba(0,0,0,0.35)",
    letterSpacing: 0.2,
    fontWeight: 950,
    fontSize: "clamp(26px, 7vw, 44px)",
    lineHeight: 1.05,
    wordBreak: "break-word",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    fontSize: "clamp(13px, 3.8vw, 16px)",
    lineHeight: 1.3,
    overflowWrap: "anywhere",
    maxWidth: 520,
  },

  statsBar: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
    color: "#08304d",
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },

  error: {
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    background: "rgba(255,255,255,0.95)",
    border: "1px solid rgba(229,83,61,0.35)",
    boxShadow: "0 12px 28px rgba(0,0,0,0.10)",
    whiteSpace: "pre-wrap",
  },

  panel: {
    borderRadius: 18,
    padding: 16,
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    border: "1px solid rgba(0,0,0,0.04)",
  },

  stackCenter: {
    display: "grid",
    gap: 10,
    maxWidth: 520,
    margin: "0 auto",
  },

  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  button: {
    background: "#0b5ed7",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "10px 16px",
    fontWeight: 950,
    cursor: "pointer",
  },
  buttonGhost: {
    background: "rgba(255,255,255,0.85)",
    color: "#08304d",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 999,
    padding: "10px 16px",
    fontWeight: 950,
    cursor: "pointer",
  },

  pill: {
    display: "inline-flex",
    gap: 6,
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(11,94,215,0.10)",
    border: "1px solid rgba(11,94,215,0.20)",
    fontWeight: 950,
    color: "#08304d",
  },
};

/* =========================
   Helpers
========================= */
function daysBetween(dayA, dayB) {
  const a = new Date(dayA + "T00:00:00");
  const b = new Date(dayB + "T00:00:00");
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cleanId(id) {
  return String(id || "")
    .trim()
    .replace(/\.png$/i, "");
}

// ✅ jour basé Europe/Paris (pas UTC)
function dayKeyParis() {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // YYYY-MM-DD
}

function handForCycleIndex(deck, idx) {
  return [
    deck?.challenge?.[idx],
    deck?.bonne_conduite?.[idx],
    deck?.contrainte?.[idx],
  ]
    .filter(Boolean)
    .map(cleanId);
}

function mergeUniqueIds(base = [], add = []) {
  const s = new Set((base || []).map(cleanId).filter(Boolean));
  (add || [])
    .map(cleanId)
    .filter(Boolean)
    .forEach((id) => s.add(id));
  return Array.from(s);
}

function getCardType(card) {
  const direct =
    card?.type ??
    card?.theme ??
    card?.category ??
    card?.categorie ??
    card?.kind ??
    card?.tag;
  if (direct) return String(direct);

  const color = String(card?.color ?? card?.couleur ?? "").toLowerCase();
  if (["green", "vert", "verte"].includes(color)) return "challenge";
  if (["blue", "bleu", "bleue"].includes(color)) return "bonne_conduite";
  if (["red", "rouge"].includes(color)) return "contrainte";
  return "unknown";
}

function isEco(card) {
  if (card?.eco === true) return true;
  if (String(card?.tag || "").toLowerCase() === "eco") return true;
  if (Array.isArray(card?.tags)) {
    const t = card.tags.map(String).map((x) => x.toLowerCase());
    if (t.includes("eco")) return true;
  }
  return false;
}

function buildCycleDeck(activeCards) {
  const byType = (type) =>
    activeCards
      .filter((c) => getCardType(c) === type)
      .map((c) => cleanId(c.id))
      .filter(Boolean);

  const pickUnique = (ids, n) => shuffle(Array.from(new Set(ids))).slice(0, n);

  const challenge = pickUnique(byType("challenge"), 5);
  const bonne = pickUnique(byType("bonne_conduite"), 5);
  const contrainte = pickUnique(byType("contrainte"), 5);

  if (challenge.length < 5 || bonne.length < 5 || contrainte.length < 5) {
    throw new Error(
      `Pas assez de cartes actives pour un cycle (besoin de 5 par type). ` +
        `challenge:${challenge.length}/5, bonne:${bonne.length}/5, contrainte:${contrainte.length}/5`
    );
  }

  return { challenge, bonne_conduite: bonne, contrainte };
}

function normalizeInviteCode(s) {
  const raw = String(s || "").trim();
  if (!raw) return "";

  try {
    const u = new URL(raw);
    const code =
      u.searchParams.get("group") ||
      u.searchParams.get("g") ||
      u.searchParams.get("invite");
    if (code) return String(code).trim();

    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length) return parts[parts.length - 1].trim();
  } catch {
    // not a URL
  }

  return raw
    .replace(/^https?:\/\/[^/]+\//i, "")
    .replace(/^group=/i, "")
    .trim();
}

function inviteLinkFromGroupId(groupId) {
  if (!groupId) return "";
  return `${window.location.origin}${
    window.location.pathname
  }?invite=${encodeURIComponent(groupId)}`;
}

function StoriesBar({ members = [], onPick }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 10,
        borderRadius: 14,
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.10)",
        display: "flex",
        gap: 10,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {members.map((m) => {
        const hasAvatar = !!(m?.avatarUrl && String(m.avatarUrl).trim());
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick?.(m)}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              minWidth: 70,
            }}
            title={m?.pseudo || "Membre"}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                border: "3px solid rgba(11,94,215,0.35)",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                background: "rgba(11,94,215,0.10)",
                margin: "0 auto",
              }}
            >
              {hasAvatar ? (
                <img
                  src={m.avatarUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div style={{ fontWeight: 950, color: "#08304d" }}>⛷️</div>
              )}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                fontWeight: 900,
                color: "#08304d",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {m?.pseudo || "Skieur"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

async function shareText({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }
  const payload = [text, url].filter(Boolean).join("\n");
  try {
    await navigator.clipboard.writeText(payload);
    return true;
  } catch {
    window.prompt("Copie ce texte :", payload);
    return true;
  }
}

/* =========================
   Storage: upload avatar
========================= */
async function uploadAvatar({ file, uid }) {
  if (!file) throw new Error("Aucun fichier");
  if (!uid) throw new Error("uid manquant");

  const ext = file.type?.includes("png") ? "png" : "jpg";
  const path = `avatars/${uid}.${ext}`;
  const r = ref(storage, path);

  await uploadBytes(r, file, { contentType: file.type || "image/jpeg" });
  return await getDownloadURL(r);
}

/* =========================
   App
========================= */
export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  // refs (scroll + focus)
  const groupNameRef = useRef(null);
  const inviteCodeRef = useRef(null);
  const pseudoRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  

  const [authBusy, setAuthBusy] = useState(false);

// Group (single)
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [activeGroupId, setActiveGroupId] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);

  // Avatar (local)
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Data
  const [cards, setCards] = useState([]);
  const [members, setMembers] = useState([]);
  const [me, setMe] = useState(null);
  const [incoming, setIncoming] = useState([]);

  // UI
  const [displayName, setDisplayName] = useState("");
  const [toUid, setToUid] = useState("");
  const [cardId, setCardId] = useState("");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState(null);
  const [prevIncomingCount, setPrevIncomingCount] = useState(0);
  const [scanOpen, setScanOpen] = useState(false);

  // Profil user (doc /users/{uid})
  const [userProfile, setUserProfile] = useState(null);
  const [pseudoDraft, setPseudoDraft] = useState("");
  const [needsPseudo, setNeedsPseudo] = useState(false);

  // Invite flow (auto-join)
  const [pendingInviteGroupId, setPendingInviteGroupId] = useState("");
  const [autoJoining, setAutoJoining] = useState(false);

  /* =========================
     Load userProfile & restore group on page load
  ========================= */
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setActiveGroupId("");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUserProfile(data);
          
          // Restore group if user has one
          if (data.groupId) {
            setActiveGroupId(data.groupId);
          }
          
          // Check if user needs to set pseudo
          if (!data.pseudo || data.pseudo.trim() === "") {
            setNeedsPseudo(true);
          } else {
            setNeedsPseudo(false);
            setDisplayName(data.pseudo);
          }
        } else {
          // User doc doesn't exist yet (first login)
          setUserProfile(null);
          setNeedsPseudo(true);
        }
      },
      (error) => {
        console.error("Error loading user profile:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const inviteCodeClean = useMemo(
    () => normalizeInviteCode(inviteCode),
    [inviteCode]
  );

  const activeCards = useMemo(
    () => (cards || []).filter((c) => c?.active !== false),
    [cards]
  );
  const [tab, setTab] = useState("leaderboard");
  const [sendOpen, setSendOpen] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [memberOpen, setMemberOpen] = useState(null); // contiendra l'objet membre cliqué

  /* =========================
     Auth init
  ========================= */
  useEffect(() => {
  const onErr = (e) => {
    try {
      console.error("GLOBAL ERROR EVENT:", e);
    } catch (_) {}
  };

  const handleWindowError = (e) => {
    const info = {
      type: e?.type,
      message: e?.message,
      filename: e?.filename,
      lineno: e?.lineno,
      colno: e?.colno,
      errorName: e?.error?.name,
      errorMessage: e?.error?.message,
      stack: e?.error?.stack,
    };
    console.error("WINDOW ERROR:", info);
    try { console.error("WINDOW ERROR RAW:", e); } catch (_) {}
  };

  const handleUnhandledRejection = (e) => {
    const r = e?.reason;
    const info = {
      type: e?.type,
      reasonType: typeof r,
      reason: r,
      reasonName: r?.name,
      reasonMessage: r?.message,
      stack: r?.stack,
    };
    console.error("UNHANDLED PROMISE REJECTION:", info);
    try { console.error("UNHANDLED RAW:", e); } catch (_) {}
  };

  window.addEventListener("error", handleWindowError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  return () => {
    window.removeEventListener("error", handleWindowError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  };
}, []);


/* =========================
   Toast on new incoming
========================= */
useEffect(() => {
  if (!user) return;
  if (incoming.length > prevIncomingCount) {
    setToast({
      text: `❄️ Nouveau défi reçu (${incoming.length})`,
      kind: "info",
    });
    setTimeout(() => setToast(null), 2500);
  }
  setPrevIncomingCount(incoming.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [incoming.length, user?.uid]);
  
/* =========================
   Realtime: Active Group
========================= */
useEffect(() => {
  if (!activeGroupId) {
    setActiveGroup(null);
    return;
  }

  const groupRef = doc(db, `groups/${activeGroupId}`);

  return onSnapshot(
    groupRef,
    (snap) => {
      if (snap.exists()) {
        setActiveGroup({ id: snap.id, ...snap.data() });
        console.log("[DEBUG] Groupe chargé:", snap.data());
      } else {
        setActiveGroup(null);
        console.log("[DEBUG] Groupe introuvable");
      }
    },
    (e) => handleAuthError(e, setErr)
  );
}, [activeGroupId]);


useEffect(() => {
  if (!user?.uid) return;

  const cardsRef = collection(db, "cards");
  
  return onSnapshot(
    cardsRef,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCards(list);
    },
    (e) => handleAuthError(e, setErr)
  );
}, [user?.uid]);


  /* =========================
     Realtime: Me (doc membre)
  ========================= */
  useEffect(() => {
    if (!user || !activeGroupId) {
      setMe(null);
      return;
    }

    const myRef = doc(db, `groups/${activeGroupId}/members/${user.uid}`);

    return onSnapshot(
      myRef,
      (snap) => {
        setMe(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      },
      (e) => handleAuthError(e, setErr)
    );
  }, [user?.uid, activeGroupId]);

  /* =========================
     Realtime: Members (APRÈS me)
  ========================= */
  useEffect(() => {
    if (!user || !activeGroupId || !me) {
      setMembers([]);
      return;
    }

    const refM = collection(db, `groups/${activeGroupId}/members`);
    return onSnapshot(
      refM,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMembers(arr);
      },
      (e) => handleAuthError(e, setErr)
    );
  }, [user?.uid, activeGroupId, me?.id]);

  /* =========================
     Realtime: Incoming (APRÈS me)
  ========================= */
  useEffect(() => {
    if (!user || !activeGroupId || !me) {
      setIncoming([]);
      return;
    }

    const ref = collection(db, `groups/${activeGroupId}/challenges`);
    const qy = query(
      ref,
      where("toUid", "==", user.uid),
      where("status", "==", "pending")
    );

    return onSnapshot(
      qy,
      (snap) => setIncoming(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => handleAuthError(e, setErr)
    );
  }, [user?.uid, activeGroupId, me?.id]);


  




  /* =========================
     Avatar picker (local) + autosave
  ========================= */
  async function pickAvatar(file) {
    setErr("");
    setAvatarBroken(false);

    setAvatarFile(file || null);

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);

// autosave direct si on a déjà un membre (donc dans un groupe)
if (!file) return;
if (!activeGroupId) return; // ✅ FIX: Pas d'autosave si pas de groupe

try {
  if (!user) throw new Error("Non connecté.");
  // activeGroupId existe forcément ici maintenant

      const url = await uploadAvatar({ file, uid: user.uid });

      const meRef = doc(db, `groups/${activeGroupId}/members/${user.uid}`);

      await setDoc(
        meRef,
        { avatarUrl: url, updatedAt: serverTimestamp() },
        { merge: true }
      );

      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        { avatarUrl: url, updatedAt: serverTimestamp() },
        { merge: true }
      );

      console.log("Avatar saved:", url);

      setToast({ text: "✅ Avatar mis à jour", kind: "success" });
      setTimeout(() => setToast(null), 1500);
    } catch (e) {
      handleAuthError(e, setErr);
    }
  }

  /* =========================
     Invite from URL + localStorage
  ========================= */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const invite = sp.get("invite") || sp.get("group") || sp.get("g") || "";
    const clean = normalizeInviteCode(invite);
    if (clean) {
      setPendingInviteGroupId(clean);
      localStorage.setItem("skills_ski_pendingInvite", clean);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("skills_ski_pendingInvite");
    if (saved && !pendingInviteGroupId) setPendingInviteGroupId(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

/* =========================
   Auth actions (Email)
========================= */
async function signInEmail(email, password) {
  if (authBusy) return;
  setAuthBusy(true);
  setErr("");

  try {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);
    setToast({ text: "✅ Connexion réussie", kind: "success" });
    setTimeout(() => setToast(null), 2000);
  } catch (e) {
    handleAuthError(e, setErr);
  } finally {
    setAuthBusy(false);
  }
}

async function signUpEmail(email, password) {
  if (authBusy) return;
  setAuthBusy(true);
  setErr("");

  try {
    const auth = getAuth();
    await createUserWithEmailAndPassword(auth, email, password);
    
    // ✅ AJOUTEZ CETTE LIGNE
    setNeedsPseudo(true);
    
    setToast({ text: "✅ Compte créé", kind: "success" });
    setTimeout(() => setToast(null), 2000);
  } catch (e) {
    handleAuthError(e, setErr);
  } finally {
    setAuthBusy(false);
  }
}

async function logout() {
  setErr("");
  try {
    await firebaseSignOut(getAuth());
    setUser(null);
    // ... ton reset localStorage etc
  } catch (e) {
    setErr(e?.message || String(e));
  }
}







  function pointsForCard(card) {
    const t = String(getCardType(card) || "").toLowerCase();
    if (t === "challenge") return 200;
    if (t === "bonne_conduite") return 250;
    if (t === "contrainte") return 350;
    return 0;
  }


  /* =========================
     Pseudo save (user profile) + optional sync to member
  ========================= */
  async function savePseudoAtEntry() {
  setErr("");
  try {
    if (!user) throw new Error("Non connecté.");

    const pseudo = (pseudoDraft || "").trim();
    if (!pseudo) throw new Error("Entre un pseudo.");
    if (pseudo.length < 2) throw new Error("Pseudo trop court.");
    if (pseudo.length > 18) throw new Error("Pseudo trop long (max 18).");

    const userRef = doc(db, "users", user.uid);

    await runTransaction(db, async (tx) => {
      // ✅ TOUTES LES LECTURES D'ABORD
      let meSnap = null;
      if (activeGroupId) {
        const meRef = doc(db, `groups/${activeGroupId}/members/${user.uid}`);
        meSnap = await tx.get(meRef);
      }

      // ✅ TOUTES LES ÉCRITURES ENSUITE
      tx.set(
        userRef,
        { pseudo, updatedAt: serverTimestamp() },
        { merge: true }
      );

      if (activeGroupId && meSnap && meSnap.exists()) {
        const meRef = doc(db, `groups/${activeGroupId}/members/${user.uid}`);
        tx.set(
          meRef,
          { pseudo, updatedAt: serverTimestamp() },
          { merge: true }
        );
      }
    });

    setDisplayName(pseudo);
    
    // ✅ NOUVEAU : Désactiver l'écran de pseudo après validation
    setNeedsPseudo(false);
    
    setToast({ text: "✅ Pseudo enregistré", kind: "success" });
    setTimeout(() => setToast(null), 1500);
  } catch (e) {
    handleAuthError(e, setErr);
  }
}

  async function savePseudo(newPseudo) {
    setErr("");
    try {
      if (!user) throw new Error("Non connecté.");

      const pseudo = String(newPseudo || "").trim();
      if (!pseudo) throw new Error("Entre un pseudo.");
      if (pseudo.length < 2) throw new Error("Pseudo trop court.");
      if (pseudo.length > 18) throw new Error("Pseudo trop long (max 18).");

      const userRef = doc(db, "users", user.uid);

      await runTransaction(db, async (tx) => {
        // ✅ TOUTES LES LECTURES D'ABORD
        let meSnap = null;
        if (activeGroupId) {
          const meRef = doc(db, `groups/${activeGroupId}/members/${user.uid}`);
          meSnap = await tx.get(meRef);
        }

        // ✅ TOUTES LES ÉCRITURES ENSUITE
        tx.set(
          userRef,
          { pseudo, updatedAt: serverTimestamp() },
          { merge: true }
        );

        if (activeGroupId && meSnap && meSnap.exists()) {
          const meRef = doc(db, `groups/${activeGroupId}/members/${user.uid}`);
          tx.set(
            meRef,
            { pseudo, updatedAt: serverTimestamp() },
            { merge: true }
          );
        }
      });

      setDisplayName(pseudo);
      setNeedsPseudo(false);
      setToast({ text: "✅ Pseudo mis à jour", kind: "success" });
      setTimeout(() => setToast(null), 1200);
    } catch (e) {
      handleAuthError(e, setErr);
    }
  }

  /* =========================
     Daily hand (5 jours, 15 cartes)
  ========================= */
  async function ensureDailyHandAndAccumulate() {
    if (!user) return;
    if (!activeGroupId) return;
    if (!me) return;
    if (!activeCards.length) return;

    const today = dayKeyParis();
    const meRef = doc(db, `groups/${activeGroupId}/members/${user.uid}`);

    await runTransaction(db, async (tx) => {
      const meSnap = await tx.get(meRef);
      if (!meSnap.exists()) return;

      const meData = meSnap.data();

      const handDayKey = meData.handDayKey || null;
      const cycleStartDayKey = meData.cycleStartDayKey || null;
      const cycleDeck = meData.cycleDeck || null;
      const existingHand = Array.isArray(meData.hand) ? meData.hand : [];

      // 1) Première fois -> init cycle
      if (!cycleStartDayKey || !cycleDeck) {
        const deck = buildCycleDeck(activeCards);
        const idx = 0;
        const todayHand = handForCycleIndex(deck, idx);

        tx.update(meRef, {
          cycleStartDayKey: today,
          cycleDeck: deck,
          cycleIndex: idx,
          hand: mergeUniqueIds(existingHand, todayHand),
          handDayKey: today,
        });
        return;
      }

      // 2) Même jour -> rien
      if (handDayKey === today) return;

      // 3) Nouveau jour -> calc index (0..4)
      let idx = daysBetween(cycleStartDayKey, today);

      // cycle terminé -> nouveau cycle
      if (idx < 0 || idx >= 5) {
        const deck = buildCycleDeck(activeCards);
        idx = 0;
        const todayHand = handForCycleIndex(deck, idx);

        tx.update(meRef, {
          cycleStartDayKey: today,
          cycleDeck: deck,
          cycleIndex: idx,
          hand: mergeUniqueIds(existingHand, todayHand),
          handDayKey: today,
        });
        return;
      }

      // 4) Cycle en cours -> ajoute les 3 nouvelles cartes
      const todayHand = handForCycleIndex(cycleDeck, idx);

      tx.update(meRef, {
        cycleIndex: idx,
        hand: mergeUniqueIds(existingHand, todayHand),
        handDayKey: today,
      });
    });
  }



useEffect(() => {
  const auth = getAuth();

  const unsub = onAuthStateChanged(auth, (u) => {
    if (u) {
      setUser(u);
      setErr("");
    } else {
      setUser(null);
    }
  });

  return () => unsub();
}, []);

  useEffect(() => {
    if (!user || !me || !activeCards.length) return;
    ensureDailyHandAndAccumulate().catch((e) =>
      setErr(e?.message || String(e))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, me?.id, activeCards.length, activeGroupId]);

  // refresh à minuit Paris si l'app reste ouverte
  useEffect(() => {
    if (!user || !me || !activeGroupId || !activeCards.length) return;

    function msUntilNextParisMidnight() {
      const now = new Date();
      const parisStr = new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now); // "25/12/2025 14:03:01"

      const [datePart, timePart] = parisStr.split(" ");
      const [dd, mm, yyyy] = datePart.split("/").map(Number);
      const [hh, mi, ss] = timePart.split(":").map(Number);

      const parisNow = new Date(Date.UTC(yyyy, mm - 1, dd, hh, mi, ss));
      const next = new Date(parisNow);
      next.setUTCDate(next.getUTCDate() + 1);
      next.setUTCHours(0, 0, 5, 0); // 00:00:05

      return Math.max(1000, next.getTime() - parisNow.getTime());
    }

    const t = setTimeout(() => {
      ensureDailyHandAndAccumulate().catch((e) => handleAuthError(e, setErr));
    }, msUntilNextParisMidnight());

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, me?.id, activeGroupId, activeCards.length]);

  /* =========================
     Group actions (single group)
  ========================= */
  function scrollFocus(ref) {
    setTimeout(() => {
      ref?.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      ref?.current?.focus?.();
    }, 50);
  }

async function createGroup() {
  // Empêcher le double-clic
  if (isCreating) {
    console.log("[DEBUG] Création déjà en cours, ignoré");
    return;
  }
  
  setIsCreating(true);
  console.log("[DEBUG] === DEBUT createGroup() ===");
  setErr("");

  try {
    // Validations
    if (!user) throw new Error("Non connecté");
    if (activeGroupId) throw new Error("Tu es déjà dans un groupe");

    const pseudo = (displayName || userProfile?.pseudo || "").trim();
    if (!pseudo) throw new Error("Entre un pseudo");

    const name = (groupName || "").trim();
    if (!name) throw new Error("Entre un nom de groupe");

    if (!activeCards.length) {
      throw new Error("Cartes non chargées");
    }

    // Upload avatar si besoin
    let avatarUrl = "";
    if (avatarFile) {
      avatarUrl = await uploadAvatar({ file: avatarFile, uid: user.uid });
    }

    // Générer un ID aléatoire pour le groupe
    const newGroupId = generateRandomId();
    
    const deck = buildCycleDeck(activeCards);
    const today = dayKeyParis();
    const todayHand = handForCycleIndex(deck, 0);

    console.log("[DEBUG] Création groupe...");
    console.log("[DEBUG] Nom du groupe:", name);
    console.log("[DEBUG] ID du groupe:", newGroupId);

    // 1. Créer le groupe
    const groupRef = doc(db, "groups", newGroupId);
    await setDoc(groupRef, {
      name: name,
      createdAt: serverTimestamp(),
      ownerUid: user.uid,
      status: "active",
    });
    console.log("[DEBUG] ✅ Groupe créé");

    // 2. Créer le membre
    const memberRef = doc(db, "groups", newGroupId, "members", user.uid);
    await setDoc(memberRef, {
      pseudo,
      avatarUrl: avatarUrl || "",
      points: 0,
      stats: { success: 0, fail: 0, eco: 0 },
      cycleStartDayKey: today,
      cycleDeck: deck,
      cycleIndex: 0,
      hand: todayHand,
      handDayKey: today,
      createdAt: serverTimestamp(),
    });
    console.log("[DEBUG] ✅ Membre créé");

    // 3. Mettre à jour l'utilisateur
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      pseudo,
      groupId: newGroupId,
      avatarUrl: avatarUrl || "",
      email: user.email || "",
      updatedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    });
    console.log("[DEBUG] ✅ User mis à jour");

    // 4. Mettre à jour l'état local
    setActiveGroupId(newGroupId);
    setToast({ text: "✅ Groupe créé : " + name, kind: "success" });
    setTimeout(() => setToast(null), 2000);
    
    console.log("[DEBUG] === FIN createGroup() SUCCESS ===");

  } catch (e) {
    console.error("[ERROR]", e);
    handleAuthError(e, setErr);
  } finally {
    setIsCreating(false);
  }
}

// Helper pour générer un ID aléatoire (comme Firestore)
function generateRandomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}



  async function joinGroup(groupIdFromParam) {
    setErr("");

    try {
      if (!user) throw new Error("Non connecté. Connecte-toi d’abord.");

      const pseudo = (displayName || userProfile?.pseudo || "").trim();
      if (!pseudo) throw new Error("Entre un pseudo.");

      const code = normalizeInviteCode(groupIdFromParam || inviteCodeClean);
      if (!code) throw new Error("Colle ou scanne le code d’invitation.");
      if (activeGroupId && activeGroupId !== code) {
        throw new Error(
          "Tu es déjà dans un groupe. Déconnecte-toi pour en rejoindre un autre."
        );
      }

      if (!activeCards.length) {
        throw new Error(
          "Cartes non chargées (attends 1 seconde puis réessaie)."
        );
      }

      const groupRef = doc(db, "groups", code);
      const meRef = doc(db, `groups/${code}/members/${user.uid}`);
      const userRef = doc(db, "users", user.uid);

      let avatarUrl = "";
      if (avatarFile) {
        avatarUrl = await uploadAvatar({ file: avatarFile, uid: user.uid });
      }

      await runTransaction(db, async (tx) => {
        const gSnap = await tx.get(groupRef);
        if (!gSnap.exists()) {
          throw new Error("Groupe introuvable (code invalide ou expiré).");
        }

        const meSnap = await tx.get(meRef);
        const today = dayKeyParis();

        if (meSnap.exists()) {
          tx.set(
            meRef,
            {
              pseudo,
              ...(avatarUrl ? { avatarUrl } : {}),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } else {
          const deck = buildCycleDeck(activeCards);
          const todayHand = handForCycleIndex(deck, 0);

          tx.set(meRef, {
            pseudo,
            avatarUrl: avatarUrl || "",
            points: 0,
            stats: { success: 0, fail: 0, eco: 0 },

            cycleStartDayKey: today,
            cycleDeck: deck,
            cycleIndex: 0,

            hand: todayHand,
            handDayKey: today,

            createdAt: serverTimestamp(),
          });
        }

        // ✅ 1 seul groupe: on overwrite groupId
        tx.set(
          userRef,
          {
            pseudo,
            groupId: code,
            ...(avatarUrl ? { avatarUrl } : {}),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      });

      setActiveGroupId(code);
      setToast({ text: "✅ Groupe rejoint", kind: "success" });
      setTimeout(() => setToast(null), 1800);
    } catch (e) {
      console.log("JOIN ERROR CODE:", e?.code, e?.message);

      handleAuthError(e, setErr);
      throw e;
    }
  }

  /* =========================
     Auto-join (invite URL)
  ========================= */
/* =========================
   Auto-join (invite URL)
========================= */
/* =========================
   Auto-join (invite URL)
========================= */
useEffect(() => {
  // ✅ NOUVEAU : Lire l'URL à chaque fois
  const sp = new URLSearchParams(window.location.search);
  const inviteFromUrl = sp.get("invite") || sp.get("group") || sp.get("g") || "";
  const cleanInvite = normalizeInviteCode(inviteFromUrl);
  
  console.log("[AUTO-JOIN DEBUG] URL invite:", cleanInvite);
  console.log("[AUTO-JOIN DEBUG] pendingInviteGroupId:", pendingInviteGroupId);
  console.log("[AUTO-JOIN DEBUG] user:", !!user);
  console.log("[AUTO-JOIN DEBUG] needsPseudo:", needsPseudo);
  console.log("[AUTO-JOIN DEBUG] autoJoining:", autoJoining);
  console.log("[AUTO-JOIN DEBUG] activeCards.length:", activeCards.length);
  console.log("[AUTO-JOIN DEBUG] displayName:", displayName);
  console.log("[AUTO-JOIN DEBUG] activeGroupId:", activeGroupId);

  // ✅ Utiliser cleanInvite au lieu de pendingInviteGroupId
  if (!cleanInvite) {
    console.log("[AUTO-JOIN] ❌ Pas d'invitation dans l'URL");
    return;
  }
  if (!user) {
    console.log("[AUTO-JOIN] ❌ Pas connecté");
    return;
  }
  if (needsPseudo) {
    console.log("[AUTO-JOIN] ❌ Besoin d'un pseudo");
    return;
  }
  if (autoJoining) {
    console.log("[AUTO-JOIN] ❌ Déjà en cours");
    return;
  }
  if (!activeCards.length) {
    console.log("[AUTO-JOIN] ❌ Cartes pas chargées");
    return;
  }

  // si déjà dans ce groupe -> clean URL
  if (activeGroupId === cleanInvite) {
    console.log("[AUTO-JOIN] ✅ Déjà dans ce groupe, nettoyage...");
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("invite");
      url.searchParams.delete("group");
      url.searchParams.delete("g");
      window.history.replaceState({}, "", url.toString());
    } catch {}
    localStorage.removeItem("skills_ski_pendingInvite");
    return;
  }

  // besoin d'un pseudo
  const pseudo = (displayName || "").trim();
  console.log("[AUTO-JOIN] Pseudo trouvé:", pseudo);
  
  if (!pseudo) {
    console.log("[AUTO-JOIN] ❌ Pas de pseudo");
    return;
  }

  console.log("[AUTO-JOIN] 🚀 Lancement de l'auto-join...");
  setAutoJoining(true);

  (async () => {
    try {
      console.log("[AUTO-JOIN] Appel de joinGroup avec:", cleanInvite);
      await joinGroup(cleanInvite);
      console.log("[AUTO-JOIN] ✅ Groupe rejoint avec succès !");

      // clean URL après succès
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("invite");
        url.searchParams.delete("group");
        url.searchParams.delete("g");
        window.history.replaceState({}, "", url.toString());
      } catch {}

      localStorage.removeItem("skills_ski_pendingInvite");
    } catch (error) {
      console.error("[AUTO-JOIN] ❌ Erreur:", error);
    } finally {
      setAutoJoining(false);
    }
  })();
}, [
  user?.uid,
  needsPseudo,
  autoJoining,
  activeCards.length,
  activeGroupId,
  displayName,
]);

  /* =========================
     Send / Resolve
  ========================= */
  async function onSend() {
    setErr("");
    try {
      if (!activeGroupId) throw new Error("Rejoins un groupe d’abord.");
      if (!me) throw new Error("Rejoins le groupe d’abord.");
      if (!toUid) throw new Error("Choisis un destinataire.");
      if (!cardId) throw new Error("Choisis une carte.");
      if (toUid === user.uid)
        throw new Error("Tu ne peux pas t’envoyer à toi-même.");

      const cleanCardId = cleanId(cardId);
      const card = activeCards.find((c) => cleanId(c.id) === cleanCardId);
      if (!card) throw new Error("Carte introuvable.");

      const typeKey = String(getCardType(card) || "unknown")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

      const today = dayKeyParis();
      const chId = `${today}_${user.uid}_${toUid}_${typeKey}`;

      const chRef = doc(db, `groups/${activeGroupId}/challenges/${chId}`);
      const meRef = doc(db, `groups/${activeGroupId}/members/${user.uid}`);

      await runTransaction(db, async (tx) => {
        // ✅ TOUTES LES LECTURES EN PREMIER
        const meSnap = await tx.get(meRef);
        if (!meSnap.exists()) throw new Error("Pas dans le groupe.");

        const meData = meSnap.data() || {};
        const handRaw = Array.isArray(meData.hand) ? meData.hand : [];
        const hand = handRaw.map(cleanId);

        if (!hand.includes(cleanCardId))
          throw new Error("Cette carte n'est pas dans ta main.");

        const chSnap = await tx.get(chRef);
        if (chSnap.exists())
          throw new Error(
            "Déjà envoyé aujourd'hui pour ce thème à cette personne."
          );

        // Lire les données du destinataire AVANT d'écrire
        const toRef = doc(db, `groups/${activeGroupId}/members/${toUid}`);
        const toSnap = await tx.get(toRef);
        
        // ✅ TOUTES LES ÉCRITURES APRÈS
        tx.update(meRef, { hand: hand.filter((id) => id !== cleanCardId) });

        tx.set(chRef, {
          fromUid: user.uid,
          fromName: meData.pseudo || meData.displayName || "Skieur",
          toUid,
          cardId: cleanCardId,
          type: typeKey,
          status: "pending",
          createdAt: serverTimestamp(),
        });

        // Ajouter la carte dans "incoming" du destinataire
        if (toSnap.exists()) {
          const toData = toSnap.data() || {};
          const incomingRaw = Array.isArray(toData.incoming) ? toData.incoming : [];
          const incoming = incomingRaw.map(cleanId);
          
          // Ajouter la carte si elle n'est pas déjà présente
          if (!incoming.includes(cleanCardId)) {
            tx.update(toRef, {
              incoming: [...incoming, cleanCardId]
            });
          }
        }
      });

      setCardId("");
      setToUid("");
      await ensureDailyHandAndAccumulate();

      setToast({ text: "✅ Défi envoyé", kind: "success" });
      setTimeout(() => setToast(null), 1800);

      // ✅ en “longue page”, on scroll vers la section défis reçus
      document
        .getElementById("incoming")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      handleAuthError(e, setErr);
    }
  }

  async function onResolve(challengeId, result) {
    setErr("");
    try {
      if (!activeGroupId) throw new Error("Groupe manquant.");

      const chRef = doc(
        db,
        `groups/${activeGroupId}/challenges/${challengeId}`
      );
      const meRef = doc(db, `groups/${activeGroupId}/members/${user.uid}`);

      await runTransaction(db, async (tx) => {
        const chSnap = await tx.get(chRef);
        if (!chSnap.exists()) throw new Error("Défi introuvable.");

        const ch = chSnap.data();
        if (ch.toUid !== user.uid) throw new Error("Pas ton défi.");
        if (ch.status !== "pending") throw new Error("Défi déjà résolu.");
        if (result !== "success" && result !== "fail")
          throw new Error("Résultat invalide.");

        const meSnap = await tx.get(meRef);
        if (!meSnap.exists()) throw new Error("Pas dans le groupe.");

        const meData = meSnap.data() || {};

        const card = activeCards.find(
          (c) => cleanId(c.id) === cleanId(ch.cardId)
        );
        const gained = result === "success" ? pointsForCard(card) : 0;
        const ecoAdd = result === "success" && card && isEco(card) ? 1 : 0;

        const prevStats = meData.stats || { success: 0, fail: 0, eco: 0 };
        const nextStats = {
          success: (prevStats.success || 0) + (result === "success" ? 1 : 0),
          fail: (prevStats.fail || 0) + (result === "fail" ? 1 : 0),
          eco: (prevStats.eco || 0) + ecoAdd,
        };

        tx.update(chRef, {
          status: result,
          resolvedAt: serverTimestamp(),
          gainedPoints: gained,
          eco: ecoAdd === 1,
        });

        tx.update(meRef, {
          points: (meData.points || 0) + gained,
          stats: nextStats,
        });
      });

      await ensureDailyHandAndAccumulate();

      setToast({
        text:
          result === "success" ? "🏆 Défi validé + points !" : "😅 Défi échoué",
        kind: "info",
      });
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      handleAuthError(e, setErr);
    }
  }

  /* =========================
     Components in App
  ========================= */
  function Header({ right }) {
  return (
    <div style={{ ...ui.header, padding: "8px 14px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <img
          src={Logo}
          alt="Skills Game"
          style={{
            width: "clamp(120px, 40vw, 160px)",
            height: "auto",
            display: "block",
            marginBottom: window.innerWidth < 480 ? 2 : 6,
          }}
        />

        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ ...ui.title, margin: "0" }}>SKILLS GAME</h1>

          <p style={{ ...ui.subtitle, margin: "6px 0 0" }}>
            {t("app.subtitle")}
          </p>

          {activeGroupId ? (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
                color: "rgba(255,255,255,0.92)",
                fontWeight: 950,
                fontSize: "clamp(13px, 3.5vw, 15px)",
              }}
            >
              {/* Nom du groupe */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ opacity: 0.8 }}>{t('group.title')} :</span>
                <span style={{ opacity: 0.95 }}>
                  {activeGroup?.name || "Mon groupe"}
                </span>
              </div>

              {/* Séparateur */}
              {members.length > 0 && (
                <span style={{ opacity: 0.5 }}>•</span>
              )}

              {/* Nombre de membres (dynamique) */}
              {members.length > 0 && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ opacity: 0.95 }}>
                    {members.length} {t('group.member')}{members.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Boutons */}
              <button
                onClick={async () => {
                  const link = inviteLinkFromGroupId(activeGroupId);
                  try {
                    await navigator.clipboard.writeText(link);
                    setToast({ text: "✅ Lien copié", kind: "success" });
                    setTimeout(() => setToast(null), 1500);
                  } catch {
                    window.prompt("Copie ce lien :", link);
                  }
                }}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.14)",
                  color: "#fff",
                  padding: "6px 10px",
                  fontWeight: 950,
                  cursor: "pointer",
                  fontSize: "clamp(12px, 3vw, 14px)",
                }}
              >
                📋 {t('group.copyLink')}
              </button>

              <button
                onClick={async () => {
                  const ok = await shareText({
                    title: "SKILLS GAME",
                    text: "Rejoins mon groupe SKILLS GAME :",
                    url: inviteLinkFromGroupId(activeGroupId),
                  });
                  if (ok) {
                    setToast({ text: "✅ Partage prêt", kind: "success" });
                    setTimeout(() => setToast(null), 1500);
                  }
                }}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.14)",
                  color: "#fff",
                  padding: "6px 10px",
                  fontWeight: 950,
                  cursor: "pointer",
                  fontSize: "clamp(12px, 3vw, 14px)",
                }}
              >
                📤 {t('group.share')}
              </button>
            </div>
          ) : null}
        </div>

        {right ? (
          <div style={{ alignSelf: "flex-start" }}>{right}</div>
        ) : null}
      </div>
    </div>
  );
}
const myStats = me?.stats || { success: 0, fail: 0, eco: 0 };

  const ErrorBox = () =>
    err ? (
      <div style={ui.error}>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
        >
          <b>Erreur</b>
          <button
            onClick={() => setErr("")}
            style={{
              border: "none",
              background: "rgba(0,0,0,0.08)",
              borderRadius: 999,
              padding: "6px 10px",
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            ✖
          </button>
        </div>
        <div style={{ marginTop: 8 }}>{err}</div>
      </div>
    ) : null;

  /* =========================
     PSEUDO REQUIRED (after login)
  ========================= */
  if (user && needsPseudo) {
    return (
      <div style={ui.page}>
        <div style={ui.container}>
          {toast && <Toast text={toast.text} kind={toast.kind} />}
            {/* Header simplifié */}
<div style={{
  background: "linear-gradient(135deg, #2e77d0 0%, #1a5fb4 100%)",
  padding: "12px 16px",
  color: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10
}}>
  {/* Logo + Info */}
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <img 
      src={Logo} 
      alt="Skills Game" 
      style={{ height: 40 }}
    />
    {activeGroupId && (
      <div style={{ fontSize: 14, fontWeight: 600 }}>
        {activeGroup?.name || t('group.title')} • {members.length} {t('group.member')}{members.length > 1 ? 's' : ''}
      </div>
    )}
  </div>

  {/* Boutons */}
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {activeGroupId && (
      <>
        <button
          onClick={async () => {
            const link = inviteLinkFromGroupId(activeGroupId);
            try {
              await navigator.clipboard.writeText(link);
              setToast({ text: "✅ Lien copié", kind: "success" });
              setTimeout(() => setToast(null), 1500);
            } catch {
              window.prompt("Copie ce lien :", link);
            }
          }}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600
          }}
        >
          📋 {t('group.copyLink')}
        </button>

        <button
          onClick={async () => {
            const ok = await shareText({
              title: "SKILLS GAME",
              text: "Rejoins mon groupe SKILLS GAME :",
              url: inviteLinkFromGroupId(activeGroupId),
            });
            if (ok) {
              setToast({ text: "✅ Partage prêt", kind: "success" });
              setTimeout(() => setToast(null), 1500);
            }
          }}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600
          }}
        >
          📤 {t('group.share')}
        </button>
      </>
    )}
    <LanguageSwitcher />
    <button
      onClick={logout}
      style={{
        background: "rgba(255,255,255,0.2)",
        border: "1px solid rgba(255,255,255,0.3)",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600
      }}
    >
      {t('auth.logout')}
    </button>
  </div>
</div>
          <div style={{ ...ui.panel, marginTop: 16 }}>
            <h2 style={{ marginTop: 0, color: "#08304d" }}>
              ⛷️ Choisis ton pseudo
            </h2>

            <p style={{ marginTop: 6, color: "#08304d", opacity: 0.9 }}>
              Tu dois créer un pseudo pour entrer dans l’app.
            </p>

            {pendingInviteGroupId ? (
              <div style={{ marginTop: 10, fontWeight: 900, color: "#08304d" }}>
                🔗 Invitation détectée : après validation, tu rejoindras
                automatiquement le groupe ✅
              </div>
            ) : null}

            <div style={{ ...ui.stackCenter, marginTop: 12 }}>
              <input
                style={ui.input}
                placeholder="Ton pseudo (2–18 caractères)"
                value={pseudoDraft}
                onChange={(e) => setPseudoDraft(e.target.value)}
                autoFocus
              />

              <button style={ui.button} onClick={savePseudoAtEntry}>
                ✅ Valider mon pseudo
              </button>

              <button style={ui.buttonGhost} onClick={logout}>
                {t('auth.logout')}
              </button>
            </div>

            {err ? (
              <div style={ui.error}>
                <b>Erreur</b>
                <div style={{ marginTop: 8 }}>{err}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }


/* =========================
   NOT CONNECTED (Login/Signup)
========================= */


 if (!user) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2e77d0 0%, #1a5fb4 100%)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}>
        <div style={{ width: "min(520px, 96vw)", display: "grid", gap: 16 }}>

          {/* Sélecteur de langue */}
          <LanguageSwitcher variant="pills" />

          {/* Card login */}
          <div style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 14px 34px rgba(0,0,0,0.15)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 4 }}>
                <img src={Logo} alt="Skills Game" style={{ height: 48 }} />
                <div style={{ fontSize: 26, fontWeight: 950, color: "#08304d", letterSpacing: 0.5 }}>SKILLS GAME</div>
              </div>
            </div>

            <h2 style={{ marginTop: 0, color: "#08304d" }}>
              {isSignup ? t("auth.signup") : t("auth.login")}
            </h2>

            <p style={{ color: "#08304d", opacity: 0.7, marginTop: -8, marginBottom: 16, fontWeight: 700 }}>
              {isSignup ? t("auth.createAccount") : t("auth.connectToContinue")}
            </p>

            {err ? (
              <div style={ui.error}>
                <b>{t("common.error")}</b>
                <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{err}</div>
              </div>
            ) : null}

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <input
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={ui.input}
                autoComplete="email"
              />

              <input
                type="password"
                placeholder={t("auth.passwordMin")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={ui.input}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />

              <button
                type="button"
                disabled={authBusy}
                style={ui.button}
                onClick={() =>
                  isSignup
                    ? signUpEmail(email, password)
                    : signInEmail(email, password)
                }
              >
                {authBusy
                  ? t("auth.loading")
                  : isSignup
                  ? "✅ " + t("auth.createAccount")
                  : "🔒 " + t("auth.login")}
              </button>

              <button
                type="button"
                style={ui.buttonGhost}
                onClick={() => {
                  setIsSignup(!isSignup);
                  setErr("");
                }}
              >
                {isSignup
                  ? "← " + t("auth.alreadyHaveAccount")
                  : "➕ " + t("auth.signup")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

/* =========================
   CONNECTED (Main app)
========================= */
  return (
    <div style={ui.page}>
      <div style={ui.container}>
        {toast && <Toast text={toast.text} kind={toast.kind} />}

        {/* ✅ HEADER + STATS + GROUPE seulement sur Classement */}
        {/* ✅ HEADER + STATS + GROUPE seulement sur Classement */}

        {/* ✅ HEADER TOUJOURS VISIBLE */}
        <Header
  right={
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <LanguageSwitcher />
      <button style={ui.buttonGhost} onClick={logout}>
        {t('auth.logout')}
      </button>
    </div>
  }
/>
        {tab === "leaderboard" ? (
          <>
            

            <div style={ui.statsBar}>
              <div></div>
              <div>
                {t("group.members")}: <b>{members.length}</b>
              </div>
              <div style={ui.pill}>✅ {myStats.success || 0}</div>
              <div style={ui.pill}>🏆 {me?.points || 0} pts</div>
            </div>

            {/* <ErrorBox /> */}

            {/* ✅ FORMULAIRE GROUPE (uniquement sur Classement) */}
            <div style={{ ...ui.panel, marginTop: 16 }}>
              <div
                style={{ fontWeight: 950, marginBottom: 10, color: "#08304d" }}
              >
                {t("group.title")}
              </div>

              <div style={ui.stackCenter}>
                {/* PSEUDO */}
                <input
                  ref={pseudoRef}
                  style={ui.input}
                  placeholder={t("profile.pseudo")}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />

                {/* Ligne boutons + avatar */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    style={ui.buttonGhost}
                    onClick={() => savePseudo(displayName)}
                    disabled={!displayName.trim()}
                    title={
                      !displayName.trim() ? "Entre un pseudo" : "Mettre à jour"
                    }
                  >
                    {"✍️ " + t("profile.changePseudo")}
                  </button>

                  <label
                    style={{
                      display: "inline-block",
                      padding: "10px 14px",
                      borderRadius: 999,
                      background: "rgba(11,94,215,0.12)",
                      border: "1px solid rgba(11,94,215,0.25)",
                      fontWeight: 950,
                      cursor: "pointer",
                    }}
                    title="Choisir une photo depuis ton appareil"
                  >
                    {"🧑‍🎿 " + t("profile.changeAvatar")}
                    <input
                      type="file"
                      accept="image/*"
                      onClick={(e) => (e.currentTarget.value = null)}
                      onChange={(e) => pickAvatar(e.target.files?.[0] || null)}
                      style={{ display: "none" }}
                    />
                  </label>

                  {/* ✅ AVATAR */}
                  {(() => {
                    const baseUrl =
                      avatarPreview ||
                      me?.avatarUrl ||
                      userProfile?.avatarUrl ||
                      "";

                    const version =
                      me?.avatarUpdatedAt?.toMillis?.() ||
                      userProfile?.avatarUpdatedAt?.toMillis?.() ||
                      "";

                    const src =
                      baseUrl && version
                        ? `${baseUrl}${
                            baseUrl.includes("?") ? "&" : "?"
                          }v=${version}`
                        : baseUrl;

                    return src && !avatarBroken ? (
                      <img
                        src={src}
                        alt=""
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid rgba(0,0,0,0.10)",
                        }}
                        onError={() => setAvatarBroken(true)}
                      />
                    ) : (
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: "50%",
                          background: "rgba(11,94,215,0.12)",
                          border: "2px solid rgba(0,0,0,0.10)",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 950,
                          color: "#08304d",
                        }}
                        title="Avatar indisponible"
                      >
                        ⛷️
                      </div>
                    );
                  })()}
                </div>

                {/* ================= CREATE / JOIN (si pas de profil "me") ================= */}
                {!me ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    {/* ================= CREATE GROUP ================= */}
                    {!activeGroupId ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        <input
                          ref={groupNameRef}
                          style={ui.input}
                          placeholder={t("group.name")}
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                        />

                        <button
  style={{ 
    ...ui.button, 
    minWidth: "min(220px, 100%)",
    opacity: isCreating ? 0.6 : 1,
    cursor: isCreating ? "not-allowed" : "pointer"
  }}
  disabled={isCreating}
  onClick={() => {
    console.log("[DEBUG] Bouton Créer groupe cliqué!");
    console.log("[DEBUG] displayName:", displayName);
    console.log("[DEBUG] groupName:", groupName);
    console.log("[DEBUG] userProfile?.pseudo:", userProfile?.pseudo);
    console.log("[DEBUG] isCreating:", isCreating);
    
    setErr("");

    const pseudoOk =
      displayName.trim() ||
      (userProfile?.pseudo || "").trim();

    console.log("[DEBUG] pseudoOk:", pseudoOk);

    if (!pseudoOk) {
      console.log("[DEBUG] ERREUR: Pseudo manquant");
      setErr(t("errors.enterPseudoToCreate"));
      scrollFocus(pseudoRef);
      return;
    }

    if (!groupName.trim()) {
      console.log("[DEBUG] ERREUR: Nom de groupe manquant");
      setErr(t("errors.enterGroupName"));
      scrollFocus(groupNameRef);
      return;
    }

    console.log("[DEBUG] Validation OK, appel createGroup()");
    createGroup();
  }}
>
  {isCreating ? t("group.creating") : t("group.create")}
</button>
                      </div>
                    ) : (
                      <div
                        style={{
                          color: "#08304d",
                          fontWeight: 900,
                          opacity: 0.9,
                        }}
                      >
                        ✅ Tu es déjà dans un groupe. (1 seul groupe possible)
                      </div>
                    )}

                    {/* ================= JOIN GROUP ================= */}
                    <input
                      ref={inviteCodeRef}
                      style={ui.input}
                      placeholder="Code d’invitation (colle ou scanne le QR)"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        style={{
                          ...ui.buttonGhost,
                          minWidth: "min(220px, 100%)",
                        }}
                        onClick={() => {
                          setErr("");

                          const pseudoOk =
                            displayName.trim() ||
                            (userProfile?.pseudo || "").trim();

                          if (!pseudoOk) {
                            setErr(t("errors.enterPseudoToJoin"));
                            scrollFocus(pseudoRef);
                            return;
                          }

                          if (!inviteCodeClean) {
                            setErr("Colle ou scanne le code d’invitation.");
                            scrollFocus(inviteCodeRef);
                            return;
                          }

                          joinGroup();
                        }}
                      >
                        {"🔗 " + t("group.join")}
                      </button>

                      <button
                        style={{
                          ...ui.buttonGhost,
                          minWidth: "min(220px, 100%)",
                        }}
                        onClick={() => setScanOpen(true)}
                      >
                        {"📷 " + t("group.scan")}
                      </button>

                      {inviteCode ? (
                        <button
                          style={{
                            ...ui.buttonGhost,
                            minWidth: "min(220px, 100%)",
                          }}
                          onClick={() => setInviteCode("")}
                        >
                          🧹 Effacer
                        </button>
                      ) : null}
                    </div>

                    {/* ================= QR INVITATION ================= */}
                    {inviteCodeClean ? (
                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{
                            fontWeight: 950,
                            marginBottom: 8,
                            color: "#08304d",
                          }}
                        >
                          QR (code d’invitation)
                        </div>

                        <div
                          style={{
                            background: "#fff",
                            display: "inline-block",
                            padding: 10,
                            borderRadius: 16,
                            border: "1px solid rgba(0,0,0,0.12)",
                          }}
                        >
                          <QRCodeCanvas
                            value={inviteLinkFromGroupId(inviteCodeClean)}
                            size={180}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ✅ sur les autres tabs : barre d'avatars + bouton logout + erreurs */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={ui.buttonGhost} onClick={logout}>
                {t('auth.logout')}
              </button>
            </div>

            {/* ✅ BARRE D’AVATARS (Instagram-like) sur Défis/Main/Feed/Plus */}
            {me ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.92)",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Logo à gauche */}
                <img
                  src={Logo}
                  alt="Skills Game"
                  style={{
                    width: 72,
                    height: "auto",
                    flex: "0 0 auto",
                    display: "block",
                  }}
                />

                {/* Avatars scrollables */}
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    overflowX: "auto",
                    flex: 1,
                  }}
                >
                  {[...(members || [])]
                    .sort((a, b) => (b.points || 0) - (a.points || 0))
                    .map((m) => {
                      const url = m?.avatarUrl || "";
                      const label = (m?.pseudo || "Skieur").slice(0, 12);
                      const pts = m?.points || 0;

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMemberOpen(m)}
                          style={{
                            minWidth: 72,
                            textAlign: "center",
                            color: "#08304d",
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            cursor: "pointer",
                          }}
                          title={`Voir ${label}`}
                        >
                          {url ? (
                            <img
                              src={url}
                              alt=""
                              style={{
                                width: 54,
                                height: 54,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "3px solid rgba(11,94,215,0.35)",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 54,
                                height: 54,
                                borderRadius: "50%",
                                background: "rgba(11,94,215,0.12)",
                                border: "3px solid rgba(11,94,215,0.35)",
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 950,
                              }}
                            >
                              🎿
                            </div>
                          )}

                          <div
                            style={{
                              marginTop: 6,
                              fontWeight: 900,
                              fontSize: 13,
                            }}
                          >
                            {label}
                          </div>

                          <div
                            style={{
                              marginTop: 2,
                              fontWeight: 950,
                              fontSize: 12,
                              opacity: 0.85,
                            }}
                          >
                            🏆 {pts}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : null}

            {/* <ErrorBox /> */}
          </>
        )}

        {/* ✅ CONTENU PRINCIPAL (1 onglet affiché à la fois) */}
        {me ? (
          <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            {tab === "leaderboard" ? (
              <div style={{ display: "grid", gap: 16 }}>
                <HomeScreen me={me} members={members} />
                <div style={ui.panel}>
                  <Leaderboard members={members} />
                </div>
              </div>
            ) : null}

            {tab === "challenges" ? (
              <div style={ui.panel}>
                <Incoming
                  incoming={incoming}
                  cards={cards}
                  onResolve={onResolve}
                  groupCode={activeGroupId}
                />

                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    onClick={() => setSendOpen(true)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderRadius: 999,
                      padding: "12px 16px",
                      fontWeight: 950,
                      background: "#0b5ed7",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    ➕ {t('challenge.send')}
                  </button>
                </div>
              </div>
            ) : null}

            {tab === "hand" ? (
              <div style={ui.panel}>
                <Hand hand={me.hand || []} cards={cards} />
              </div>
            ) : null}

            {tab === "feed" ? (
              <div style={ui.panel}>
                <GroupFeed groupId={activeGroupId} user={user} me={me} />
              </div>
            ) : null}

            {tab === "more" ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div style={ui.panel}>
                  <HomeScreen me={me} members={members} cards={cards} />
                </div>

                <div style={ui.panel}>
                  <History
                    user={user}
                    groupCode={activeGroupId}
                    cards={cards}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ ...ui.panel, marginTop: 16, color: "#08304d" }}>
            <b>{t("group.notInGroupYet")}</b>
            <div style={{ marginTop: 8, opacity: 0.9 }}>
              {t("group.joinWithCode")}
            </div>
          </div>
        )}

        {/* ✅ QR Scanner modal */}
        {scanOpen ? (
          <QrScanner
            onResult={(text) => {
              const code = normalizeInviteCode(String(text || ""));
              setInviteCode(code);
              setScanOpen(false);
              setToast({ text: "✅ Code récupéré", kind: "success" });
              setTimeout(() => setToast(null), 1500);
            }}
            onClose={() => setScanOpen(false)}
          />
        ) : null}

        {/* ✅ Modal Envoyer */}
        {sendOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 9999,
              display: "grid",
              placeItems: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                width: "min(720px, 96vw)",
                maxHeight: "88vh",
                overflow: "auto",
                background: "#fff",
                borderRadius: 18,
                padding: 14,
                boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 950 }}>📮 {t('challenge.send')}</div>

                <button
                  type="button"
                  onClick={() => setSendOpen(false)}
                  style={{
                    border: "none",
                    background: "rgba(0,0,0,0.08)",
                    borderRadius: 999,
                    padding: "6px 10px",
                    fontWeight: 950,
                    cursor: "pointer",
                  }}
                >
                  ✖
                </button>
              </div>

              <div style={{ marginTop: 12 }}>
                <SendCard
                  hand={me?.hand || []}
                  cards={cards}
                  members={members}
                  user={user}
                  cardId={cardId}
                  setCardId={setCardId}
                  toUid={toUid}
                  setToUid={setToUid}
                  onSend={async () => {
                    await onSend();
                    setSendOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* ✅ Modal Profil membre */}
        {memberOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setMemberOpen(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 9999,
              display: "grid",
              placeItems: "center",
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(420px, 92vw)",
                background: "#fff",
                borderRadius: 18,
                padding: 14,
                boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 950, color: "#08304d" }}>Profil</div>
                <button
                  type="button"
                  onClick={() => setMemberOpen(null)}
                  style={{
                    border: "none",
                    background: "rgba(0,0,0,0.08)",
                    borderRadius: 999,
                    padding: "6px 10px",
                    fontWeight: 950,
                    cursor: "pointer",
                  }}
                >
                  ✖
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                {memberOpen?.avatarUrl ? (
                  <img
                    src={memberOpen.avatarUrl}
                    alt=""
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid rgba(11,94,215,0.35)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "rgba(11,94,215,0.12)",
                      border: "3px solid rgba(11,94,215,0.35)",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 950,
                    }}
                  >
                    🎿
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontWeight: 950, fontSize: 18, color: "#08304d" }}
                  >
                    {memberOpen?.pseudo || "Skieur"}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontWeight: 950,
                      color: "#08304d",
                      opacity: 0.9,
                    }}
                  >
                    🏆 {memberOpen?.points || 0} pts
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 900, color: "#08304d" }}>Stats</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={ui.pill}>
                    ✅ {memberOpen?.stats?.success || 0}
                  </div>
                  <div style={ui.pill}>❌ {memberOpen?.stats?.fail || 0}</div>
                  <div style={ui.pill}>🌱 {memberOpen?.stats?.eco || 0}</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ✅ Bottom nav (toujours visible) */}
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}