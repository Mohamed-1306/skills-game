import { tierFromPoints, badgeForMember } from "../logic/ranking";

export default function Leaderboard({ members }) {
  const sorted = [...(members || [])].sort(
    (a, b) => (b.points || 0) - (a.points || 0)
  );

  const topEco = Math.max(0, ...sorted.map((m) => m.stats?.eco || 0));
  const topSuccess = Math.max(0, ...sorted.map((m) => m.stats?.success || 0));

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>🏆 Classement</h3>

      <ol style={{ margin: 0, paddingLeft: 18 }}>
        {sorted.map((m, idx) => {
          const pts = m.points || 0;
          const success = m.stats?.success || 0;
          const eco = m.stats?.eco || 0;

          const isEcoWinner = topEco > 0 && eco === topEco;
          const badge = badgeForMember({ points: pts, isEcoWinner });

          const tier = tierFromPoints(pts); // utile si tu veux afficher la catégorie aussi

          return (
            <li key={m.id} style={{ margin: "10px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontWeight: 900 }}>
                  {idx === 0 ? "👑 " : ""}
                  {m.pseudo || m.displayName || "Skieur"}
                </div>

                <div style={{ fontWeight: 900 }}>
                  {badge} • 🏆 {pts} pts • ✅ {success} • 🌱 {eco}
                </div>
              </div>

              {topSuccess > 0 && success === topSuccess && (
                <div style={{ opacity: 0.75, fontWeight: 800, marginTop: 4 }}>
                  🔥 Meilleur nombre de défis validés
                </div>
              )}

              {/* Optionnel : si tu veux afficher le tier même quand vert */}
              {isEcoWinner ? (
                <div style={{ opacity: 0.7, fontWeight: 800, marginTop: 4 }}>
                  (niveau points : {tier.emoji} {tier.label})
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
