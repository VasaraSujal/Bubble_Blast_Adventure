import { getHexNeighbors } from './grid.js';

/**
 * Connected Component Matching Engine (Section 18 & 19)
 * Uses Breadth-First Search (BFS) to identify all contiguous bubbles
 * of matching color or connected through Rainbow wildcard bubbles.
 *
 * @param {number} startRow - Row of the newly attached bubble
 * @param {number} startCol - Col of the newly attached bubble
 * @param {Array} grid - Current 2D bubble grid
 * @returns {Array<{row: number, col: number, bubble: any}>} Array of matching connected cells
 */
export const findConnectedMatches = (startRow, startCol, grid) => {
  const startBubble = grid[startRow] && grid[startRow][startCol];
  if (!startBubble) return [];

  const startColor = typeof startBubble === 'string' ? startBubble : startBubble.color;

  // Handle Special Bomb Bubble: explodes all adjacent cells immediately
  if (startColor === 'bomb' || (typeof startBubble === 'object' && startBubble.isBomb)) {
    return findBombBlastRadius(startRow, startCol, grid, 1);
  }

  const queue = [{ row: startRow, col: startCol }];
  const visited = new Set([`${startRow},${startCol}`]);
  const matchedCluster = [{ row: startRow, col: startCol, bubble: startBubble }];

  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = getHexNeighbors(current.row, current.col, grid.length + 5);

    for (const neighbor of neighbors) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (visited.has(key)) continue;

      const neighborBubble = grid[neighbor.row] && grid[neighbor.row][neighbor.col];
      if (!neighborBubble) continue;

      const neighborColor = typeof neighborBubble === 'string'
        ? neighborBubble
        : neighborBubble.color;

      // Match condition: same color, or either bubble is a Rainbow wildcard
      const isMatch =
        neighborColor === startColor ||
        startColor === 'rainbow' ||
        neighborColor === 'rainbow' ||
        (typeof neighborBubble === 'object' && neighborBubble.isRainbow);

      if (isMatch) {
        visited.add(key);
        queue.push({ row: neighbor.row, col: neighbor.col });
        matchedCluster.push({
          row: neighbor.row,
          col: neighbor.col,
          bubble: neighborBubble
        });
      }
    }
  }

  // A match is only valid if cluster size is 3 or more (Section 18: count >= 3)
  // Rainbow bubble can also trigger if count >= 3 with adjacent cluster
  return matchedCluster.length >= 3 ? matchedCluster : [];
};

/**
 * Computes Bomb Bubble blast radius: pops target and all surrounding adjacent bubbles
 */
export const findBombBlastRadius = (centerRow, centerCol, grid, radius = 1) => {
  const blastCluster = [];
  const visited = new Set();

  const centerBubble = grid[centerRow] && grid[centerRow][centerCol];
  if (centerBubble) {
    blastCluster.push({ row: centerRow, col: centerCol, bubble: centerBubble });
    visited.add(`${centerRow},${centerCol}`);
  }

  // Radius 1: immediate hex neighbors
  const neighbors = getHexNeighbors(centerRow, centerCol, grid.length + 5);
  for (const n of neighbors) {
    const key = `${n.row},${n.col}`;
    if (!visited.has(key) && grid[n.row] && grid[n.row][n.col]) {
      visited.add(key);
      blastCluster.push({ row: n.row, col: n.col, bubble: grid[n.row][n.col] });
    }
  }

  return blastCluster;
};

export default {
  findConnectedMatches,
  findBombBlastRadius
};
