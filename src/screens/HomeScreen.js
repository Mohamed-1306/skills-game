// src/screens/HomeScreen.js
import { useState } from "react";
import Members from "../components/Members";

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          border: "none",
          background: "rgba(11,94,215,0.06)",
          padding: "12px 14px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 950,
          color: "#08304d",
        }}
      >
        <span>{title}</span>
        <span style={{ opacity: 0.75 }}>{open ? "▴" : "▾"}</span>
      </button>

      {open ? (
        <div style={{ padding: 14, color: "#08304d", fontWeight: 750 }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default function HomeScreen({ me, members }) {
  const membersCount = Array.isArray(members) ? members.length : 0;

  const cardStyle = {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.10)",
  };

  const headerRow = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  };

  const titleStyle = {
    margin: 0,
    color: "#08304d",
    fontWeight: 950,
    fontSize: 22,
    letterSpacing: 0.2,
  };

  const badge = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(11,94,215,0.10)",
    border: "1px solid rgba(11,94,215,0.18)",
    color: "#08304d",
    fontWeight: 950,
    whiteSpace: "nowrap",
  };

  const sub = {
    marginTop: 10,
    color: "rgba(8,48,77,0.82)",
    fontWeight: 850,
    fontSize: 13,
    lineHeight: 1.35,
  };

  const pill = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 12px",
    borderRadius: 999,
    fontWeight: 950,
    color: "#08304d",
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.95)",
  };

  const myPts = me?.points || 0;
  const myStats = me?.stats || { success: 0, fail: 0, eco: 0 };

  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      {/* 🧭 RÈGLES DU JEU */}
      <div style={cardStyle}>
        <div style={headerRow}>
          <h2 style={titleStyle}>🏠 Accueil</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={pill}>🏆 {myPts} pts</span>
            <span style={pill}>✅ {myStats.success || 0}</span>
            <span style={pill}>🌱 {myStats.eco || 0}</span>
          </div>
        </div>

        <div style={sub}>
          Le but : se lancer des défis sur les pistes, gagner des points, et
          finir le séjour avec le meilleur score 🏔️
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <Section title="🎴 Les cartes" defaultOpen>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>
              <li>
                Il y a <b>15 cartes</b> : 5 🟩 Challenge, 5 🟦 Bonne conduite, 5
                🟥 Contrainte.
              </li>
              <li>
                Chaque jour, tu reçois <b>3 nouvelles cartes</b> (1 de chaque
                couleur), différentes.
              </li>
              <li>
                Tu gardes tes cartes tant que tu ne les utilises pas : tu peux
                donc en avoir plus que 3 si tu joues bien.
              </li>
            </ul>
          </Section>

          <Section title="📮 Envoyer un défi">
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>
              <li>
                Tu choisis une carte dans <b>Ma main</b>, puis tu l’envoies à un
                membre.
              </li>
              <li>
                Le destinataire voit <b>qui</b> lui a envoyé le défi.
              </li>
              <li>
                Règle anti-spam : tu ne peux pas envoyer{" "}
                <b>2 défis du même type</b> à la même personne le même jour (ex
                : 2 bonnes conduites).
              </li>
            </ul>
          </Section>

          <Section title="✅ Réussite / ❌ Échec">
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>
              <li>
                Si le défi est <b>validé</b>, tu gagnes des points :
                <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                  <li>
                    🟩 Challenge : <b>200</b> pts
                  </li>
                  <li>
                    🟦 Bonne conduite : <b>250</b> pts
                  </li>
                  <li>
                    🟥 Contrainte : <b>350</b> pts
                  </li>
                </ul>
              </li>
              <li>
                Si le défi est <b>échoué</b>, tu ne gagnes pas de points.
              </li>
              <li>
                Pour que tout le monde puisse jouer : tu as toujours au moins
                <b> 3 cartes par jour</b> pour en envoyer.
              </li>
            </ul>
          </Section>

          <Section title="🏆 Classement & badges">
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>
              <li>
                Les badges dépendent des <b>points</b> :
                <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                  <li>🥇 Skieur OR : 3200+ pts</li>
                  <li>🥈 Skieur ARGENT : 2400+ pts</li>
                  <li>🥉 Skieur BRONZE : 1500+ pts</li>
                  <li>📦 Skieur CARTON : moins de 1500 pts</li>
                </ul>
              </li>
              <li>
                Dans un groupe, plusieurs personnes peuvent être “OR” : c’est le
                <b> score</b> qui départage.
              </li>
              <li>
                Bonus : celui/celle qui a le plus de défis <b>éco</b> devient{" "}
                <b>🌱 Skieur VERT</b>.
              </li>
            </ul>
          </Section>
        </div>
      </div>

      {/* 👥 MEMBRES */}
      <div style={cardStyle}>
        <div style={headerRow}>
          <h2 style={titleStyle}>👥 Membres</h2>
          <div style={badge}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>⛷️</span>
            <span>{membersCount}</span>
          </div>
        </div>

        <div style={sub}>
          Retrouve tous les riders de ton groupe et vois qui est en tête.
        </div>

        <div style={{ marginTop: 14 }}>
          <Members members={members || []} me={me} />
        </div>
      </div>
    </div>
  );
}
