// src/components/History.jsx
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";

export default function History({ user, groupCode, cards }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [localErr, setLocalErr] = useState("");

  useEffect(() => {
    if (!user || !groupCode) return;

    const ref = collection(db, `groups/${groupCode}/challenges`);
    const qy = query(ref, orderBy("createdAt", "desc"), limit(120));

    return onSnapshot(
      qy,
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const done = all.filter((x) => x.status && x.status !== "pending");
        setItems(done);
        setLocalErr("");
      },
      (e) => setLocalErr(e.message || String(e))
    );
  }, [user, groupCode]);

  function prettyFromId(id) {
    return String(id || "")
      .replace(/\.png$/i, "")
      .replace(/_/g, " ")
      .trim()
      .toUpperCase();
  }

  const safeCards = Array.isArray(cards) ? cards : [];

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>🧾 {t('history.title')}</h3>

      {localErr && (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: "#fdecea",
            fontWeight: 800,
          }}
        >
          {localErr}
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ opacity: 0.75 }}>
          🎿 {t('history.noChallenges')}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {items.map((ch) => {
            const c = safeCards.find((x) => x.id === ch.cardId);
            const success = ch.status === "success";

            const title =
              c?.title || c?.text || c?.name || prettyFromId(ch.cardId);
            const type =
              c?.type || c?.theme || c?.category || c?.categorie || t('sendCard.card').toLowerCase();

            return (
              <div
                key={ch.id}
                style={{
                  borderRadius: 18,
                  padding: 14,
                  background: success ? "#eaf8f0" : "#fdecea",
                  border: `2px solid ${success ? "#2fbf71" : "#e5533d"}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
                    {success ? `✅ ${t('history.success')}` : `❌ ${t('history.failed')}`}
                  </div>
                  <div style={{ opacity: 0.75, fontWeight: 800 }}>
                    {ch.fromName || t('common.skier')} → {ch.toName || t('common.skier')}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  {c?.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={title}
                      loading="lazy"
                      style={{
                        width: "100%",
                        maxWidth: 360,
                        borderRadius: 18,
                        boxShadow: "0 14px 35px rgba(0,0,0,0.18)",
                      }}
                    />
                  ) : (
                    <div style={{ marginTop: 8, fontWeight: 900 }}>
                      {type} — {title}
                    </div>
                  )}
                </div>

                {ch.photoUrl && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 900, opacity: 0.85 }}>
                      {t('history.proof')} :
                    </div>
                    <img
                      src={ch.photoUrl}
                      alt="preuve"
                      loading="lazy"
                      style={{
                        marginTop: 8,
                        width: "100%",
                        borderRadius: 14,
                        boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}