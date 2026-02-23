// src/components/GroupFeed.jsx
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getDoc } from "firebase/firestore";

import { uploadGroupPostPhoto } from "../logic/photos";

function niceTime(ts) {
  try {
    const d = ts?.toDate ? ts.toDate() : null;
    if (!d) return "";
    return d.toLocaleString();
  } catch {
    return "";
  }
}

function shortUid(uid) {
  const s = String(uid || "");
  return s ? `${s.slice(0, 6)}…${s.slice(-4)}` : "";
}

export default function GroupFeed({ groupId, user, me }) {
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState("");

  // map uid -> member data (avatarUrl/pseudo/points)
  const memberByUid = useMemo(() => {
    const m = new Map();
    (members || []).forEach((x) => m.set(x.id, x));
    return m;
  }, [members]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // 🔥 Listen posts
  useEffect(() => {
    if (!groupId || !user) return;

    const refP = collection(db, `groups/${groupId}/posts`);
    const qy = query(refP, orderBy("createdAt", "desc"));

    return onSnapshot(
      qy,
      (snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => {
        console.error("Feed posts onSnapshot error:", e);
        setErr(e?.message || String(e));
      }
    );
  }, [groupId, user?.uid]);

  // 🔥 Listen members (to display live avatars/pseudos)
  useEffect(() => {
    if (!groupId || !user) return;

    const refM = collection(db, `groups/${groupId}/members`);

    return onSnapshot(
      refM,
      (snap) => setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => {
        console.error("Feed members onSnapshot error:", e);
        setErr(e?.message || String(e));
      }
    );
  }, [groupId, user?.uid]);

  function pickFile(f) {
    setErr("");
    setFile(f || null);

    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function publishPhoto() {
    const checkRef = doc(db, `groups/${groupId}/members/${user.uid}`);
    const checkSnap = await getDoc(checkRef);
    console.log("MEMBER DOC EXISTS?", groupId, user.uid, checkSnap.exists());
    if (!checkSnap.exists()) {
      throw new Error(
        "Tu n'es pas membre de ce groupe (doc members manquant)."
      );
    }

    setErr("");
    if (!groupId) return;
    if (!user) return;
    if (!me) return setErr("Tu dois être dans le groupe");
    if (!file) return setErr("Choisis une photo");

    setBusy(true);

    try {
      console.log("[FEED] publishPhoto start", {
        groupId,
        uid: user.uid,
        file,
      });

      const postId = `${Date.now()}_${user.uid}`;
      const postRef = doc(db, `groups/${groupId}/posts/${postId}`);

      console.log("[FEED] uploading to Storage…", { postId });
      const mediaUrl = await uploadGroupPostPhoto({
        file,
        groupId,
        postId,
      });
      console.log("[FEED] upload OK", mediaUrl);

      console.log("[FEED] writing Firestore post…");
      await setDoc(postRef, {
        fromUid: user.uid,
        fromName: me.pseudo || me.displayName || "Skieur",
        type: "photo",
        mediaUrl,
        createdAt: serverTimestamp(),
      });
      console.log("[FEED] Firestore post OK");

      pickFile(null);
    } catch (e) {
      console.error("[FEED] publishPhoto error:", e);
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14, paddingBottom: 120 }}>
      <h3 style={{ marginTop: 0 }}>📸 Feed du groupe</h3>

      <div
        style={{
          borderRadius: 18,
          padding: 14,
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 10 }}>
          Publier une photo
        </div>

        <label
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(11,94,215,0.12)",
            border: "1px solid rgba(11,94,215,0.25)",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          📷 Ouvrir la caméra / choisir une photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
          />
        </label>

        {preview && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 800, opacity: 0.8, marginBottom: 6 }}>
              Aperçu :
            </div>
            <img
              src={preview}
              alt="aperçu"
              style={{
                width: "100%",
                maxHeight: 420,
                objectFit: "cover",
                borderRadius: 14,
                boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
              }}
            />
            {busy ? (
              <div style={{ fontWeight: 900, opacity: 0.8 }}>
                Upload en cours…
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={async () => {
                  console.log("CLICK PUBLISH"); // debug
                  await publishPhoto();
                }}
                disabled={busy}
                style={{
                  borderRadius: 999,
                  border: "none",
                  padding: "10px 14px",
                  fontWeight: 900,
                  background: "#2fbf71",
                  color: "white",
                  cursor: "pointer",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                ✅ {busy ? "Publication…" : "Publier"}
              </button>

              <button
                onClick={() => pickFile(null)}
                disabled={busy}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "#fff",
                  padding: "10px 14px",
                  fontWeight: 900,
                  cursor: "pointer",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                🗑️ Annuler
              </button>
            </div>
          </div>
        )}

        {err && (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 12,
              background: "#fdecea",
              fontWeight: 900,
              whiteSpace: "pre-wrap",
            }}
          >
            {err}
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <div style={{ opacity: 0.75 }}>
          Aucune photo publiée pour l’instant.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {posts.map((p) => {
            const m = memberByUid.get(p.fromUid);
            const avatarUrl = m?.avatarUrl || "";
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {p.fromAvatarUrl ? (
                  <img
                    src={p.fromAvatarUrl}
                    alt=""
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(11,94,215,0.12)",
                    }}
                  >
                    🎿
                  </div>
                )}
                <div style={{ fontWeight: 900 }}>{p.fromName || "Skieur"}</div>
              </div>

              <div style={{ opacity: 0.7, fontWeight: 800 }}>
                {niceTime(p.createdAt)}
              </div>
            </div>;

            const name = m?.pseudo || p.fromName || "Skieur";

            return (
              <div
                key={p.id}
                style={{
                  borderRadius: 18,
                  padding: 14,
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(0,0,0,0.10)",
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
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid rgba(11,94,215,0.25)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "rgba(11,94,215,0.12)",
                          border: "2px solid rgba(11,94,215,0.25)",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 950,
                          color: "#08304d",
                        }}
                        title="Pas d'avatar enregistré"
                      >
                        🎿
                      </div>
                    )}

                    <div>
                      <div style={{ fontWeight: 950, color: "#08304d" }}>
                        {name}
                      </div>
                    </div>
                  </div>

                  <div style={{ opacity: 0.7, fontWeight: 800 }}>
                    {niceTime(p.createdAt)}
                  </div>
                </div>

                {p.type === "photo" && p.mediaUrl && (
                  <img
                    src={p.mediaUrl}
                    alt="post"
                    loading="lazy"
                    style={{
                      marginTop: 10,
                      width: "100%",
                      borderRadius: 14,
                      boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
