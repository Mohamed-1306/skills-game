import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const BASE = "https://raw.githubusercontent.com/Mohamed-1306/skills-game/master/public/cards";

export default function Hand({ hand, cards, onGiveMeCards }) {
  const { t, i18n } = useTranslation();
  const ids = useMemo(() => (Array.isArray(hand) ? hand : []), [hand]);
  const safeCards = useMemo(() => (Array.isArray(cards) ? cards : []), [cards]);

  const [broken, setBroken] = useState({});

  useEffect(() => {
    setBroken({});
  }, [ids.join("|")]);

  const lang = ["fr", "en", "it", "de"].includes(i18n.language) ? i18n.language : "fr";
  function prettyFromId(id) {
    return String(id || "")
      .replace(/\.png$/i, "")
      .replace(/_/g, " ")
      .trim()
      .toUpperCase();
  }

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
    return "carte";
  }

function translateType(type) {
  const t_lower = String(type || "").toLowerCase();
  if (t_lower.includes("challenge")) return t("cardType.challenge");
  if (t_lower.includes("bonne") || t_lower.includes("conduite")) return t("cardType.goodConduct");
  if (t_lower.includes("contrainte")) return t("cardType.constraint");
  return t("cardType.card");
}
  function pointsForCard(card) {
    const type = String(getCardType(card) || "").toLowerCase().replace(/\s+/g, "_");
    if (type.includes("challenge")) return 200;
    if (type.includes("bonne") || type.includes("conduite")) return 250;
    if (type.includes("contrainte")) return 350;
    return null;
  }

  function typeBadgeStyle(type) {
    const t_lower = String(type || "").toLowerCase();
    if (t_lower.includes("challenge")) {
      return { bg: "rgba(34,197,94,0.12)", bd: "rgba(34,197,94,0.35)", dot: "#22c55e" };
    }
    if (t_lower.includes("bonne") || t_lower.includes("conduite")) {
      return { bg: "rgba(59,130,246,0.12)", bd: "rgba(59,130,246,0.35)", dot: "#3b82f6" };
    }
    if (t_lower.includes("contrainte")) {
      return { bg: "rgba(239,68,68,0.12)", bd: "rgba(239,68,68,0.35)", dot: "#ef4444" };
    }
    return { bg: "rgba(100,116,139,0.12)", bd: "rgba(100,116,139,0.35)", dot: "#64748b" };
  }

  if (ids.length === 0) {
    return (
      <div>
        <div style={{ fontWeight: 900, opacity: 0.85 }}>{t("sendCard.noCards")}</div>
        {onGiveMeCards ? (
          <button
            type="button"
            onClick={onGiveMeCards}
            style={{
              marginTop: 10,
              borderRadius: 999,
              padding: "10px 14px",
              border: "1px solid rgba(0,0,0,0.15)",
              background: "white",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            🎁 {t("sendCard.noCards")}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
          alignItems: "start",
        }}
      >
        {ids.map((rawId) => {
          const id = cleanId(rawId);
          const c = safeCards.find((x) => cleanId(x.id) === id);

          const title = (lang === "en" && c?.title_en)
  ? c.title_en
  : c?.title || c?.text || c?.name || prettyFromId(id) || "CARTE";
          const type = getCardType(c);
          const typeLabel = translateType(type);
          const pts = c ? pointsForCard(c) : null;
          const img = c?.id ? `${BASE}/${lang}/${c.id}.jpg` : c?.imageUrl || "";
          console.log("CARD DEBUG:", { id, cardId: c?.id, img: `${BASE}/${lang}/${c?.id}.jpg` });
          const hasImage = !!img && !broken[id];
          const badge = typeBadgeStyle(type);

          const badgeSpan = (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: 999,
                background: badge.bg,
                border: `1px solid ${badge.bd}`,
                fontWeight: 950,
                fontSize: 12,
                color: "#08304d",
              }}
            >
              <span
                aria-hidden
                style={{ width: 8, height: 8, borderRadius: 999, background: badge.dot }}
              />
              {typeLabel}
            </span>
          );

          const ptsSpan = pts != null ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(11,94,215,0.10)",
                border: "1px solid rgba(11,94,215,0.18)",
                fontWeight: 950,
                fontSize: 12,
                color: "#08304d",
              }}
            >
              🏆 {pts} {t("stats.points")}
            </span>
          ) : null;

          return (
            <div key={id} style={{ display: "grid", gap: 8 }}>
              {hasImage ? (
                <div
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.06))",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
                  }}
                >
                  <img
                    src={img}
                    alt={title}
                    loading="lazy"
                    onError={() => {
                      console.warn("IMAGE FAIL:", { id, url: img });
                      setBroken((p) => ({ ...p, [id]: true }));
                    }}
                    style={{ width: "100%", height: 170, objectFit: "cover", display: "block" }}
                  />
                </div>
              ) : null}

              {!hasImage ? (
                <div
                  style={{
                    borderRadius: 16,
                    padding: 12,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "rgba(255,255,255,0.95)",
                    fontWeight: 900,
                    boxShadow: "0 10px 22px rgba(0,0,0,0.10)",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {badgeSpan}
                    {ptsSpan}
                  </div>
                  <div style={{ marginTop: 8, lineHeight: 1.2 }}>{title}</div>
                  {!c ? (
                    <div style={{ marginTop: 8, opacity: 0.9, fontWeight: 950, color: "#c63b28" }}>
                      ⚠️ {t("sendCard.noImage")}
                    </div>
                  ) : null}
                  {img && broken[id] ? (
                    <div style={{ marginTop: 8, opacity: 0.9, fontWeight: 950, color: "#c63b28" }}>
                      ⚠️ {t("hand.imageBroken")}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {hasImage ? (
                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {badgeSpan}
                    {ptsSpan}
                  </div>
                  <div style={{ fontWeight: 950, lineHeight: 1.2 }}>{title}</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}