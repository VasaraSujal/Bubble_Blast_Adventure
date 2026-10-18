import { getBubbleCenter } from './grid.js';

/**
 * Circle-to-Circle Collision Check
 */
export const checkBubbleCollision = (
  projectileX,
  projectileY,
  radius,
  grid,
  boardWidth
) => {
  const collisionThreshold = radius * 1.88; // Slightly responsive collision radius
  const thresholdSq = collisionThreshold * collisionThreshold;

  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    if (!row) continue;

    for (let c = 0; c < row.length; c++) {
      const bubble = row[c];
      if (!bubble) continue;

      const { x: bx, y: by } = getBubbleCenter(r, c, radius, boardWidth);
      const dx = projectileX - bx;
      const dy = projectileY - by;
      const distSq = dx * dx + dy * dy;

      if (distSq <= thresholdSq) {
        return {
          collided: true,
          hitBubble: { row: r, col: c, x: bx, y: by, data: bubble }
        };
      }
    }
  }

  return { collided: false };
};

/**
 * Checks if the projectile has hit the top ceiling
 */
export const checkCeilingCollision = (projectileY, radius) => {
  return projectileY - radius <= 0;
};

/**
 * Handles side wall bouncing
 * Returns new { x, vx, bounced: boolean }
 */
export const handleWallBounce = (x, vx, radius, boardWidth) => {
  let bounced = false;
  let newX = x;
  let newVx = vx;

  // Left wall
  if (x - radius <= 0) {
    newX = radius;
    newVx = Math.abs(vx);
    bounced = true;
  }
  // Right wall
  else if (x + radius >= boardWidth) {
    newX = boardWidth - radius;
    newVx = -Math.abs(vx);
    bounced = true;
  }

  return { x: newX, vx: newVx, bounced };
};

export default {
  checkBubbleCollision,
  checkCeilingCollision,
  handleWallBounce
};
