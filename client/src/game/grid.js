/**
 * Hexagonal / Offset Bubble Grid System (Section 16)
 *
 * Implements hexagonal point-topped / staggered row packing:
 * - Even rows (0, 2, 4...) have COLS_EVEN bubbles (e.g. 8)
 * - Odd rows (1, 3, 5...) have COLS_ODD bubbles (e.g. 7), shifted right by radius
 * - Vertical spacing between rows = 2 * radius * sin(60°) = radius * sqrt(3)
 */

export const COLS_EVEN = 8;
export const COLS_ODD = 7;
export const ROW_HEIGHT_RATIO = Math.sqrt(3) / 2; // ~0.8660254

/**
 * Calculates bubble center (x, y) on the canvas for given row and col.
 */
export const getBubbleCenter = (row, col, radius, boardWidth) => {
  const isOdd = row % 2 !== 0;
  const colCount = isOdd ? COLS_ODD : COLS_EVEN;
  
  // Calculate horizontal cell width to fill the board evenly
  const cellWidth = boardWidth / COLS_EVEN;
  const actualRadius = cellWidth / 2;
  const rowHeight = cellWidth * ROW_HEIGHT_RATIO;

  const xOffset = isOdd ? actualRadius : 0;
  const x = xOffset + col * cellWidth + actualRadius;
  const y = row * rowHeight + actualRadius;

  return { x, y, radius: actualRadius, rowHeight, cellWidth };
};

/**
 * Returns the 6 hexagonal neighbor coordinates for a given slot.
 * Accounts for differing neighbors between even and odd staggered rows.
 */
export const getHexNeighbors = (row, col, maxRows = 20) => {
  const isOdd = row % 2 !== 0;
  const neighbors = [];

  // Relative neighbor offsets: [dRow, dCol]
  // Even row (no offset):
  //   Top-Left: (-1, -1), Top-Right: (-1, 0)
  //   Left: (0, -1),      Right: (0, 1)
  //   Bottom-Left: (1, -1), Bottom-Right: (1, 0)
  // Odd row (shifted right by +0.5 cell):
  //   Top-Left: (-1, 0),  Top-Right: (-1, 1)
  //   Left: (0, -1),      Right: (0, 1)
  //   Bottom-Left: (1, 0), Bottom-Right: (1, 1)
  const offsets = isOdd
    ? [
        [-1, 0],  // Top-Left
        [-1, 1],  // Top-Right
        [0, -1],  // Left
        [0, 1],   // Right
        [1, 0],   // Bottom-Left
        [1, 1]    // Bottom-Right
      ]
    : [
        [-1, -1], // Top-Left
        [-1, 0],  // Top-Right
        [0, -1],  // Left
        [0, 1],   // Right
        [1, -1],  // Bottom-Left
        [1, 0]    // Bottom-Right
      ];

  for (const [dr, dc] of offsets) {
    const nr = row + dr;
    const nc = col + dc;
    const maxCols = nr % 2 !== 0 ? COLS_ODD : COLS_EVEN;

    if (nr >= 0 && nr < maxRows && nc >= 0 && nc < maxCols) {
      neighbors.push({ row: nr, col: nc });
    }
  }

  return neighbors;
};

/**
 * Finds the nearest empty hexagonal slot for an impact position (x, y)
 * that is adjacent to at least one existing bubble or in the ceiling row (row 0).
 */
export const findNearestValidSlot = (x, y, grid, boardWidth, radius) => {
  const cellWidth = boardWidth / COLS_EVEN;
  const rowHeight = cellWidth * ROW_HEIGHT_RATIO;
  const maxRows = Math.max(grid.length + 3, 14);

  let bestSlot = null;
  let minDistanceSq = Infinity;

  // Search through all possible grid slots within range
  for (let r = 0; r < maxRows; r++) {
    const colCount = (r % 2 !== 0) ? COLS_ODD : COLS_EVEN;
    for (let c = 0; c < colCount; c++) {
      // Slot must be currently empty
      if (grid[r] && grid[r][c]) {
        continue;
      }

      // Candidate slot must either be in ceiling row OR adjacent to an existing bubble
      let isValidCandidate = (r === 0);
      if (!isValidCandidate) {
        const neighbors = getHexNeighbors(r, c, maxRows);
        isValidCandidate = neighbors.some(n => grid[n.row] && grid[n.row][n.col]);
      }

      if (!isValidCandidate) continue;

      const center = getBubbleCenter(r, c, radius, boardWidth);
      const dx = center.x - x;
      const dy = center.y - y;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        bestSlot = { row: r, col: c, x: center.x, y: center.y };
      }
    }
  }

  return bestSlot;
};

export default {
  COLS_EVEN,
  COLS_ODD,
  ROW_HEIGHT_RATIO,
  getBubbleCenter,
  getHexNeighbors,
  findNearestValidSlot
};
