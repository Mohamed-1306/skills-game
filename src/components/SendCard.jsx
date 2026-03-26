// src/components/SendCard.jsx

import { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';

const BASE = "https://raw.githubusercontent.com/Mohamed-1306/skills-game/master/public/cards";

// ---------- helpers (local)
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
  return "";
}
function typeColor(typeKey) {
  const t = String(typeKey || "").toLowerCase();
  if (t.includes("challenge")) return "#22c55e";
  if (t.includes("bonne") || t.includes("conduite")) return "#3b82f6";
  if (t.includes("contrainte")) return "#ef4444";
  return "#64748b";
}
function prettyFromId(id) {
  return String(id || "")
    .replace(/\.png$/i, "")
    .replace(/_/g, " ")
    .trim()
    .toUpperCase();
}
function getCardLabel(card, idFallback, lang) {
  if (lang === "en" && card?.title_en) return card.title_en;
  return (
    card?.title ||
    card?.text ||
    card?.name ||
    card?.label ||
    prettyFromId(idFallback)
  );
}
function translateType(type, t) {
  const t_lower = String(type || "").toLowerCase();
  if (t_lower.includes("challenge")) return t("cardType.challenge");
  if (t_lower.includes("bonne") || t_lower.includes("conduite")) return t("cardType.goodConduct");
  if (t_lower.includes("contrainte")) return t("cardType.constraint");
  return t("cardType.card");
}

// ---------- UI: CardPicker
function CardPicker({ hand = [], cards = [], cardId, setCardId, disabled }) {
  const { t, i18n } = useTranslation();
  const lang = ["fr", "en", "it", "de"].includes(i18n.language) ? i18n.language : "fr";

  const handIds = useMemo(
    () => (Array.isArray(hand) ? hand : []).map(cleanId).filter(Boolean),
    [hand]
  );

  const handCards = useMemo(() => {
    const map = new Map((cards || []).map((c) => [cleanId(c.id), c]));
    return handIds.map((id) => ({ id, card: map.get(id) })).filter((x) => x.id);
  }, [handIds, cards]);

  const selected = useMemo(() => {
    const id = cleanId(cardId);
    const c = (cards || []).find((x) => cleanId(x.id) === id);
    return { id, card: c || null };
  }, [cardId, cards]);

  const [open, setOpen] = useState(false);

  const selectedLabel = selected.card
    ? getCardLabel(selected.card, selected.id, lang)
    : "";

  const selectedType = selected.card ? getCardType(selected.card) : "";
  const accent = typeColor(selectedType);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "12px 12px",
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,0.18)",
          background: disabled ? "rgba(0,0,0,0.04)" : "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
        }}
        title={disabled ? t('sendCard.noCards') : t('sendCard.chooseCard')}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: selected.id ? accent : "rgba(0,0,0,0.25)",
              boxShadow: "0 0 0 3px rgba(0,0,0,0.04)",
            }}
          />
          <div style={{ display: "grid", lineHeight: 1.2 }}>
            <div style={{ fontWeight: 900 }}>
              {selected.id ? selectedLabel : t('sendCard.chooseCardPlaceholder')}
            </div>
            {selected.id ? (
              <div style={{ opacity: 0.75, fontWeight: 800, fontSize: 13 }}>
                {selectedType ? translateType(selectedType, t) : t('sendCard.card')}
              </div>
            ) : (
              <div style={{ opacity: 0.6, fontWeight: 700, fontSize: 13 }}>
                {t('sendCard.tapToOpen')}
              </div>
            )}
          </div>
        </div>

        <div style={{ opacity: 0.75, fontWeight: 900 }}>▾</div>
      </button>

      {open && !disabled ? (
        <div
          style={{
            borderRadius: 18,
            border: "1px solid rgba(0,0,0,0.10)",
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
            padding: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {handCards.map(({ id, card }) => {
              const type = getCardType(card);
              const color = typeColor(type);
              const label = getCardLabel(card, id, lang);
              const img = `${BASE}/${lang}/${id}.jpg`;
              const isSelected = cleanId(cardId) === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setCardId(id);
                    setOpen(false);
                  }}
                  style={{
                    textAlign: "left",
                    borderRadius: 18,
                    border: isSelected
                      ? `2px solid ${color}`
                      : "1px solid rgba(0,0,0,0.10)",
                    background: "#fff",
                    cursor: "pointer",
                    padding: 10,
                    display: "grid",
                    gap: 10,
                    boxShadow: isSelected ? "0 10px 22px rgba(0,0,0,0.10)" : "",
                  }}
                >
                  <div
                    style={{
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.08)",
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.06))",
                      aspectRatio: "16 / 10",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={img}
                      alt={label}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: `1px solid ${color}55`,
                          background: `${color}14`,
                          color: "#08304d",
                          fontWeight: 900,
                          fontSize: 12,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: color,
                          }}
                        />
                        {type ? translateType(type, t) : t('sendCard.card')}
                      </span>
                      {isSelected ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: "rgba(34,197,94,0.12)",
                            border: "1px solid rgba(34,197,94,0.25)",
                            fontWeight: 900,
                            fontSize: 12,
                          }}
                        >
                          ✓ {t('sendCard.selected')}
                        </span>
                      ) : null}
                    </div>

                    <div style={{ fontWeight: 950, lineHeight: 1.2 }}>
                      {label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 10,
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "rgba(255,255,255,0.90)",
                padding: "8px 12px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------- main component
export default function SendCard({
  hand,
  cards,
  members,
  user,
  cardId,
  setCardId,
  toUid,
  setToUid,
  onSend,
}) {
  const { t } = useTranslation();

  const rawIds = Array.isArray(hand) ? hand : [];
  const ids = rawIds.map(cleanId).filter(Boolean);
  const handEmpty = ids.length === 0;
  const [openTo, setOpenTo] = useState(false);
  const selectedTo = (members || []).find((m) => m.id === toUid) || null;

  const cleanCardId = cleanId(cardId);
  const selectedCard = (cards || []).find((c) => cleanId(c.id) === cleanCardId);

  const canSend = !handEmpty && !!cleanCardId && !!toUid;

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>📮 {t('challenge.send')}</h3>

      {handEmpty && (
        <div style={{ marginBottom: 10, fontWeight: 800, opacity: 0.8 }}>
          ❄️ {t('sendCard.noCardsInHand')}
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        <CardPicker
          hand={hand}
          cards={cards}
          cardId={cleanCardId}
          setCardId={setCardId}
          disabled={handEmpty}
        />

        <div style={{ display: "grid", gap: 10 }}>
          <button
            type="button"
            onClick={() => setOpenTo((v) => !v)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "12px 12px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.18)",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {selectedTo?.avatarUrl ? (
                <img
                  src={selectedTo.avatarUrl}
                  alt={selectedTo.pseudo || t('common.skier')}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid rgba(0,0,0,0.10)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    background: "rgba(11,94,215,0.10)",
                    border: "1px solid rgba(11,94,215,0.22)",
                    color: "#08304d",
                  }}
                >
                  👤
                </div>
              )}

              <div style={{ display: "grid", lineHeight: 1.2 }}>
                <div style={{ fontWeight: 900 }}>
                  {selectedTo
                    ? selectedTo.pseudo || t('common.skier')
                    : t('sendCard.chooseRecipient')}
                </div>
                <div style={{ opacity: 0.6, fontWeight: 700, fontSize: 13 }}>
                  {selectedTo
                    ? t('sendCard.tapToChange')
                    : t('sendCard.tapToOpenList')}
                </div>
              </div>
            </div>

            <div style={{ opacity: 0.75, fontWeight: 900 }}>▾</div>
          </button>

          {openTo ? (
            <div
              style={{
                borderRadius: 18,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "rgba(255,255,255,0.96)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.14)",
                padding: 12,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 10,
                }}
              >
                {(members || [])
                  .filter((m) => m.id !== user?.uid)
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setToUid(m.id);
                        setOpenTo(false);
                      }}
                      style={{
                        textAlign: "left",
                        borderRadius: 16,
                        border:
                          m.id === toUid
                            ? "2px solid rgba(11,94,215,0.35)"
                            : "1px solid rgba(0,0,0,0.10)",
                        background: "#fff",
                        cursor: "pointer",
                        padding: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {m.avatarUrl ? (
                        <img
                          src={m.avatarUrl}
                          alt={m.pseudo || m.displayName || t('common.skier')}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid rgba(0,0,0,0.10)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 900,
                            background: "rgba(11,94,215,0.10)",
                            border: "1px solid rgba(11,94,215,0.22)",
                            color: "#08304d",
                          }}
                        >
                          👤
                        </div>
                      )}

                      <div style={{ fontWeight: 950 }}>
                        {m.pseudo || m.displayName || t('common.skier')}
                        {m.id === toUid ? (
                          <span style={{ marginLeft: 8, opacity: 0.7 }}>
                            {" "}✓
                          </span>
                        ) : null}
                      </div>
                    </button>
                  ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setToUid("");
                    setOpenTo(false);
                  }}
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "rgba(255,255,255,0.90)",
                    padding: "8px 12px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {t('group.clear')}
                </button>

                <button
                  type="button"
                  onClick={() => setOpenTo(false)}
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "rgba(255,255,255,0.90)",
                    padding: "8px 12px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <button
          onClick={onSend}
          disabled={!canSend}
          style={{
            background: "#0b5ed7",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "12px 16px",
            fontWeight: 900,
            cursor: canSend ? "pointer" : "not-allowed",
            opacity: canSend ? 1 : 0.6,
          }}
        >
          🛷 {t('sendCard.sendButton')}
        </button>
      </div>
    </div>
  );
}