import { useTranslation } from 'react-i18next';

export default function BottomNav({ tab, setTab }) {
  const { t } = useTranslation();
  
  const items = [
    { key: "leaderboard", label: t('nav.home'), icon: "🏠" },
    { key: "challenges", label: t('nav.challenges'), icon: "✅" },
    { key: "hand", label: t('nav.hand'), icon: "🃏" },
    { key: "feed", label: t('nav.feed'), icon: "📰" },
    { key: "more", label: t('nav.more'), icon: "⋯" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        padding: 10,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(0,0,0,0.10)",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: `repeat(${items.length}, 1fr)`,
          gap: 8,
        }}
      >
        {items.map((it) => {
          const active = tab === it.key;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => setTab(it.key)}
              style={{
                border: "none",
                background: active ? "rgba(11,94,215,0.12)" : "transparent",
                borderRadius: 14,
                padding: "10px 6px",
                cursor: "pointer",
                fontWeight: 950,
                color: "#08304d",
              }}
            >
              <div style={{ fontSize: 18, lineHeight: 1 }}>{it.icon}</div>
              <div style={{ fontSize: 12, opacity: active ? 1 : 0.75 }}>
                {it.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}