import React, { useMemo } from "react";

function cleanId(id) {
  return String(id || "")
    .trim()
    .replace(/\.png$/i, "");
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

function pointsForType(type) {
  const t = String(type || "").toLowerCase();
  if (t === "challenge") return 200;
  if (t === "bonne_conduite") return 250;
  if (t === "contrainte") return 350;
  return 0;
}

const ui = {
  wrap: { display: "grid", gap: 14 },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 10,
  },
  h2: { margin: 0, color: "#08304d" },
  sub: { margin: "6px 0 0", color: "#08304d", opacity: 0.85, fontWeight: 700 },

  card: {
    border: "1px solid rgba(0,0,0,0.10)",
    borderRadius: 16,
    padding: 14,
    background: "#fff",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
    display: "grid",
    gap: 10,
  },

  fromRow: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(0,0,0,0.08)",
    background: "rgba(11,94,215,0.10)",
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    color: "#08304d",
    background: "rgba(11,94,215,0.12)",
    border: "2px solid rgba(0,0,0,0.06)",
  },
  fromName: { fontWeight: 950, color: "#08304d" },

  badgeRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 950,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(0,0,0,0.03)",
    color: "#08304d",
  },

  cardTitle: { margin: 0, fontWeight: 950, color: "#08304d" },
  cardText: {
    margin: "6px 0 0",
    color: "#08304d",
    opacity: 0.9,
    lineHeight: 1.35,
  },

  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 },
  btn: {
    border: "none",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 950,
    cursor: "pointer",
  },
  btnSuccess: { background: "#0b5ed7", color: "#fff" },
  btnFail: { background: "rgba(0,0,0,0.08)", color: "#08304d" },

  empty: {
    borderRadius: 14,
    padding: 14,
    background: "rgba(11,94,215,0.06)",
    border: "1px dashed rgba(11,94,215,0.35)",
    color: "#08304d",
    fontWeight: 850,
  },
};

export default function Incoming({
  incoming = [],
  cards = [],
  members = [],
  onResolve,
  groupCode,
}) {
  const cardsById = useMemo(() => {
    const m = new Map();
    (cards || []).forEach((c) => m.set(cleanId(c.id), c));
    return m;
  }, [cards]);

  const memberById = useMemo(() => {
    const m = new Map();
    (members || []).forEach((x) => m.set(String(x.id), x));
    return m;
  }, [members]);

  const list = Array.isArray(incoming) ? incoming : [];

  return (
    <div style={ui.wrap} id="incoming">
      <div style={ui.titleRow}>
        <div>
          <h2 style={ui.h2}>✅ Mes défis</h2>
          <p style={ui.sub}>
            Tu reçois ici les défis que les autres t’envoient.
          </p>
        </div>
        {groupCode ? (
          <div style={{ ...ui.badge, opacity: 0.9 }}>👥 {list.length}</div>
        ) : null}
      </div>

      {list.length === 0 ? (
        <div style={ui.empty}>Aucun défi en attente pour le moment ❄️</div>
      ) : (
        list.map((ch) => {
          const card = cardsById.get(cleanId(ch.cardId)) || null;
          const type = (
            ch.type ||
            getCardType(card) ||
            "unknown"
          ).toLowerCase();
          const pts = pointsForType(type);

          const from = memberById.get(String(ch.fromUid)) || null;
          const fromPseudo = from?.pseudo || ch.fromName || "Skieur";
          const fromAvatar = from?.avatarUrl || "";

          return (
            <div key={ch.id} style={ui.card}>
              {/* Expéditeur */}
              <div style={ui.fromRow}>
                {fromAvatar ? (
                  <img src={fromAvatar} alt="" style={ui.avatar} />
                ) : (
                  <div style={ui.avatarFallback}>
                    {String(fromPseudo || "?")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                )}
                <div style={ui.fromName}>{fromPseudo}</div>
              </div>

              {/* Badges */}
              <div style={ui.badgeRow}>
                <div style={ui.badge}>
                  {type === "challenge"
                    ? "🟩 Challenge"
                    : type === "bonne_conduite"
                    ? "🟦 Bonne conduite"
                    : type === "contrainte"
                    ? "🟥 Contrainte"
                    : "🃏 Carte"}
                </div>
                <div style={ui.badge}>🏆 {pts} pts</div>
              </div>

              {/* Contenu carte */}
              <div>
                <h3 style={ui.cardTitle}>
                  {card?.title || card?.name || "Défi"}
                </h3>
                <p style={ui.cardText}>
                  {card?.text ||
                    card?.description ||
                    card?.desc ||
                    "Ouvre la carte pour lire le défi."}
                </p>
              </div>

              {/* Actions */}
              <div style={ui.actions}>
                <button
                  type="button"
                  style={{ ...ui.btn, ...ui.btnSuccess }}
                  onClick={() => onResolve?.(ch.id, "success")}
                >
                  ✅ Défi validé
                </button>

                <button
                  type="button"
                  style={{ ...ui.btn, ...ui.btnFail }}
                  onClick={() => onResolve?.(ch.id, "fail")}
                >
                  😅 Défi échoué
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
