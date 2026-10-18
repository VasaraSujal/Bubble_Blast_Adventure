/**
 * Score & Combo Calculation Engine (Sections 35, 36, 37)
 */

export const calculatePopScore = (matchCount, comboMultiplier = 1) => {
  // Base matching scores (Section 35)
  let baseScore = 30; // 3-match default
  if (matchCount === 4) baseScore = 50;
  else if (matchCount === 5) baseScore = 80;
  else if (matchCount > 5) baseScore = 80 + (matchCount - 5) * 30;

  // Apply combo multiplier
  const multiplier = Math.max(1, comboMultiplier);
  return Math.floor(baseScore * multiplier);
};

export const calculateFloatingScore = (floatingCount, comboMultiplier = 1) => {
  // +20 per floating bubble dropped (Section 35)
  const baseScore = floatingCount * 20;
  const multiplier = Math.max(1, comboMultiplier);
  return Math.floor(baseScore * multiplier);
};

export const calculateRescueScore = (rescueCount) => {
  // +100 per rescued creature (Section 35)
  return rescueCount * 100;
};

export default {
  calculatePopScore,
  calculateFloatingScore,
  calculateRescueScore
};
