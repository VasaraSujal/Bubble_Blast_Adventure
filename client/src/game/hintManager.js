import { getBubbleCenter } from './grid.js';

/**
 * Hint System (Section 47)
 * Finds the highest-value target for the current loaded bubble:
 * 1. Matching clusters of >= 2 bubbles to complete a Match-3
 * 2. Rescue target bubbles
 * 3. Returns recommended aim angle in radians
 */
export const findRecommendedHint = ({
  currentBubble,
  grid,
  boardWidth,
  boardHeight,
  launcherX,
  launcherY,
  radius
}) => {
  if (!grid || grid.length === 0) return null;

  let bestTarget = null;
  let maxWeight = -1;

  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    if (!row) continue;

    for (let c = 0; c < row.length; c++) {
      const bubble = row[c];
      if (!bubble) continue;

      const color = typeof bubble === 'string' ? bubble : bubble.color;
      let weight = 0;

      // Bonus for matching loaded projectile color
      if (color === currentBubble) {
        weight += 10;
      }

      // Bonus for rescue target
      if (typeof bubble === 'object' && bubble.hasRescueTarget) {
        weight += 20;
      }

      // Prefer lower rows (easier straight shots)
      weight += r * 2;

      if (weight > maxWeight) {
        maxWeight = weight;
        const center = getBubbleCenter(r, c, radius, boardWidth);
        bestTarget = {
          row: r,
          col: c,
          x: center.x,
          y: center.y,
          color
        };
      }
    }
  }

  if (bestTarget) {
    const dx = bestTarget.x - launcherX;
    const dy = bestTarget.y - launcherY;
    const angle = Math.atan2(dy, dx);
    return {
      target: bestTarget,
      recommendedAngle: angle,
      description: `Target ${bestTarget.color.toUpperCase()} bubble at [Row ${bestTarget.row + 1}]`
    };
  }

  return null;
};

export default {
  findRecommendedHint
};
