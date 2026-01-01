// src/logic/cards.js
export function pickRandomCard(cards, exclude = new Set()) {
  const pool = cards.filter((c) => !exclude.has(c.id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function starterHand(cards) {
  const exclude = new Set();
  const result = [];

  ["challenge", "bonne_conduite", "contrainte"].forEach((type) => {
    const pool = cards.filter((c) => c.type === type && !exclude.has(c.id));
    if (pool.length) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      exclude.add(c.id);
      result.push(c.id);
    }
  });

  return result;
}
