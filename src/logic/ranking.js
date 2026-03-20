// src/logic/ranking.js

export function tierFromPoints(points = 0) {
  const p = Number(points) || 0;

  if (p >= 3200) return { key: "or", emoji: "🥇" };
  if (p >= 2400) return { key: "argent", emoji: "🥈" };
  if (p >= 1500) return { key: "bronze", emoji: "🥉" };
  return { key: "carton", emoji: "📦" };
}

export function badgeForMember({ points = 0, isEcoWinner = false, t } = {}) {
  if (isEcoWinner) return t ? `🌱 ${t('ranking.vert')}` : "🌱 Skieur VERT";
  const tier = tierFromPoints(points);
  return t ? `${tier.emoji} ${t('ranking.' + tier.key)}` : `${tier.emoji}`;
}