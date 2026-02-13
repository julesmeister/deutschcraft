/**
 * Weighted random selection that prioritizes items with fewer correct answers
 * and boosts items that were answered incorrectly in the current session.
 *
 * Weight formula: (1 + mistakeCount) / (1 + correctCount)
 * - New items (0 correct, 0 mistakes): weight 1.0
 * - Well-practiced (3 correct, 0 mistakes): weight 0.25
 * - Struggled (0 correct, 2 mistakes): weight 3.0
 */
export function weightedRandomPick<T>(
  pool: T[],
  getKey: (item: T) => string,
  correctCounts: Record<string, number>,
  mistakeCounts: Record<string, number> = {},
): T {
  if (pool.length === 0) throw new Error("weightedRandomPick: empty pool");
  if (pool.length === 1) return pool[0];

  const weights = pool.map((item) => {
    const key = getKey(item);
    const correct = correctCounts[key] || 0;
    const mistakes = mistakeCounts[key] || 0;
    return (1 + mistakes) / (1 + correct);
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}
