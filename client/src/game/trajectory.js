import { checkBubbleCollision, checkCeilingCollision, handleWallBounce } from './collision.js';
import { findNearestValidSlot } from './grid.js';

/**
 * Simulates projectile flight path to produce laser trajectory line,
 * wall bounces, impact point, and target landing slot.
 *
 * @param {number} startX - Launcher X position
 * @param {number} startY - Launcher Y position
 * @param {number} angle - Aim angle in radians (pointing upwards)
 * @param {Array} grid - Current board bubble grid
 * @param {number} boardWidth - Canvas board width
 * @param {number} radius - Bubble radius
 * @param {number} maxBounces - Maximum wall reflections (default 1, 3 with Aim Guide)
 */
export const calculateTrajectory = (
  startX,
  startY,
  angle,
  grid,
  boardWidth,
  radius,
  maxBounces = 1
) => {
  const points = [{ x: startX, y: startY }];
  let currentX = startX;
  let currentY = startY;

  // Normalized direction vector
  let dx = Math.cos(angle);
  let dy = Math.sin(angle);

  // If aiming downwards, clamp to horizontal upwards
  if (dy > -0.1) {
    dy = -0.1;
    dx = dx >= 0 ? 0.99 : -0.99;
  }

  const stepSize = 4; // Step resolution in pixels
  const maxSteps = 400; // Limit raycast iterations for performance
  let bouncesLeft = maxBounces;
  let collisionPoint = null;
  let predictedSlot = null;

  for (let step = 0; step < maxSteps; step++) {
    currentX += dx * stepSize;
    currentY += dy * stepSize;

    // 1. Check Ceiling Collision
    if (checkCeilingCollision(currentY, radius)) {
      currentY = radius;
      collisionPoint = { x: currentX, y: currentY };
      points.push(collisionPoint);
      predictedSlot = findNearestValidSlot(currentX, currentY, grid, boardWidth, radius);
      break;
    }

    // 2. Check Bubble Collision
    const bubbleHit = checkBubbleCollision(currentX, currentY, radius, grid, boardWidth);
    if (bubbleHit.collided) {
      collisionPoint = { x: currentX, y: currentY };
      points.push(collisionPoint);
      predictedSlot = findNearestValidSlot(currentX, currentY, grid, boardWidth, radius);
      break;
    }

    // 3. Check Wall Bounce
    const bounce = handleWallBounce(currentX, dx, radius, boardWidth);
    if (bounce.bounced) {
      currentX = bounce.x;
      dx = bounce.vx;
      points.push({ x: currentX, y: currentY });

      bouncesLeft--;
      if (bouncesLeft < 0) {
        break; // Max bounces reached
      }
    }
  }

  // If no direct collision found within max steps, push current end point
  if (!collisionPoint && points.length > 0) {
    points.push({ x: currentX, y: currentY });
  }

  return {
    points,
    collisionPoint,
    predictedSlot
  };
};

export default {
  calculateTrajectory
};
