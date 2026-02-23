// src/components/BottomNav.jsx
export default function BottomNav({ tab, setTab }) {
  const items = [
    { key: "leaderboard", label: "Accueil", icon: "🏠" },
    { key: "challenges", label: "Mes défis", icon: "✅" },
    { key: "hand", label: "Ma main", icon: "🃏" },
    { key: "feed", label: "Feed", icon: "📰" },
    { key: "more", label: "Plus", icon: "⋯" },
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
