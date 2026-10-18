import { getHexNeighbors } from './grid.js';

/**
 * Floating / Orphaned Bubble Detection Engine (Section 20 & 21)
 *
 * Uses Multi-Source Breadth-First Search (BFS) starting from all bubbles
 * attached to Row 0 (the ceiling). Any active bubble in the grid that cannot
 * be reached via continuous neighbor adjacency from the ceiling has become
 * unsupported and must fall with gravity physics.
 *
 * @param {Array} grid - 2D bubble grid
 * @returns {Array<{row: number, col: number, bubble: any}>} Array of floating bubbles to detach
 */
export const findFloatingBubbles = (grid) => {
  if (!grid || grid.length === 0) return [];

  const connectedToCeiling = new Set();
  const queue = [];

  // Step 1: Enqueue all active bubbles in Row 0 (the ceiling anchors)
  const ceilingRow = grid[0] || [];
  for (let c = 0; c < ceilingRow.length; c++) {
    if (ceilingRow[c]) {
      const key = `0,${c}`;
      connectedToCeiling.add(key);
      queue.push({ row: 0, col: c });
    }
  }

  // Step 2: Multi-source BFS to discover all ceiling-supported bubbles
  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = getHexNeighbors(current.row, current.col, grid.length + 5);

    for (const neighbor of neighbors) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (connectedToCeiling.has(key)) continue;

      const neighborBubble = grid[neighbor.row] && grid[neighbor.row][neighbor.col];
      if (neighborBubble) {
        connectedToCeiling.add(key);
        queue.push({ row: neighbor.row, col: neighbor.col });
      }
    }
  }

  // Step 3: Identify all bubbles that were NOT reached by ceiling traversal
  const floatingBubbles = [];
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    if (!row) continue;

    for (let c = 0; c < row.length; c++) {
      if (row[c] && !connectedToCeiling.has(`${r},${c}`)) {
        floatingBubbles.push({
          row: r,
          col: c,
          bubble: row[c]
        });
      }
    }
  }

  return floatingBubbles;
};

export default {
  findFloatingBubbles
};
