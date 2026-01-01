// src/components/Members.jsx
export default function Members({ members = [] }) {
  return (
    <div>
      <div style={{ fontWeight: 950, marginBottom: 10, color: "#08304d" }}>
        👥 Membres ({members.length})
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {members.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(255,255,255,0.95)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {m.avatarUrl ? (
                <img
                  src={m.avatarUrl}
                  alt="avatar"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(11,94,215,0.12)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 950,
                    color: "#08304d",
                  }}
                >
                  {String(m.pseudo || "S")
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
              )}

              <div>
                <div style={{ fontWeight: 950, color: "#08304d" }}>
                  {m.pseudo || "Skieur"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  {m.points || 0} pts
                </div>
              </div>
            </div>

            <div style={{ fontWeight: 950, color: "#08304d" }}>
              ✅ {m?.stats?.success || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
