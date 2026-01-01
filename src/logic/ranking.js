// src/Logic/ranking.js

export function tierFromPoints(points = 0) {
  const p = Number(points) || 0;

  if (p >= 3200) return { key: "or", label: "Skieur OR", emoji: "🥇" };
  if (p >= 2400) return { key: "argent", label: "Skieur ARGENT", emoji: "🥈" };
  if (p >= 1500) return { key: "bronze", label: "Skieur BRONZE", emoji: "🥉" };
  return { key: "carton", label: "Skieur CARTON", emoji: "📦" };
}

/**
 * Badge final affiché sur le leaderboard.
 * Si isEcoWinner => Skieur VERT.
 * Sinon tier selon points.
 */
export function badgeForMember({ points = 0, isEcoWinner = false } = {}) {
  if (isEcoWinner) return "🌱 Skieur VERT";
  const tier = tierFromPoints(points);
  return `${tier.emoji} ${tier.label}`;
}
