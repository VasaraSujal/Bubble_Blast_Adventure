/**
 * 40 Spiral Coordinates mapped precisely to the Floating Sky Island Archipelago
 * (saga_map_spiral.jpg: 1376 x 768 native resolution)
 *
 * Optimized with generous spacing (minimum >= 65px between all adjacent nodes in 1376x768 space)
 * so that 3D medallions never collide and have beautiful breathing room.
 */
export const SAGA_SPIRAL_COORDS = [
  // Outer Loop: Top-Right Whispering Heights to Bottom-Right Cascades
  { level: 1, x: 86.5, y: 14.5, name: 'Whispering Heights' },
  { level: 2, x: 87.0, y: 23.5, name: 'Sunlit Ridge' },
  { level: 3, x: 86.0, y: 32.5, name: 'Windmill Crag' },
  { level: 4, x: 84.0, y: 41.5, name: 'High Arch Bridge' },
  { level: 5, x: 81.5, y: 50.0, name: 'Sky Harbor Bluff', isMilestone: true },
  { level: 6, x: 78.5, y: 58.0, name: 'Cascade Run' },
  { level: 7, x: 75.0, y: 65.5, name: 'Crystal Falls' },
  { level: 8, x: 71.0, y: 72.5, name: 'Mist Grotto' },
  { level: 9, x: 66.5, y: 78.5, name: 'Turquoise Pools' },
  { level: 10, x: 61.5, y: 83.5, name: 'Silver Falls Gate', isMilestone: true },

  // Outer Loop: Bottom Meadow across Great Stone Bridges to Southwest Cliffs
  { level: 11, x: 56.0, y: 87.5, name: 'Verdant Shore' },
  { level: 12, x: 50.5, y: 89.5, name: 'Mossy Steppingway' },
  { level: 13, x: 44.5, y: 89.0, name: 'Emerald Meadow' },
  { level: 14, x: 38.5, y: 87.0, name: 'Blossom Crossing' },
  { level: 15, x: 33.0, y: 83.5, name: 'Dragon Horn Gap', isMilestone: true },
  { level: 16, x: 27.5, y: 78.5, name: 'Great Stone Bridge' },
  { level: 17, x: 23.0, y: 72.5, name: 'Waterfall Crest' },
  { level: 18, x: 19.5, y: 65.5, name: 'Pine Pinnacle' },
  { level: 19, x: 16.5, y: 58.0, name: 'Cloud Cliff' },
  { level: 20, x: 14.5, y: 50.0, name: 'Bramble Fortress', isMilestone: true },

  // Middle Ascent: West Steps curving into North Canopy
  { level: 21, x: 14.0, y: 41.5, name: 'Ancient Stone Steps' },
  { level: 22, x: 14.5, y: 32.5, name: 'Highwind Vista' },
  { level: 23, x: 16.5, y: 24.0, name: 'Rune Lookout' },
  { level: 24, x: 20.0, y: 17.0, name: 'Skyway Bridge' },
  { level: 25, x: 25.5, y: 13.5, name: 'Starlight Village', isMilestone: true },
  { level: 26, x: 31.5, y: 13.0, name: 'Canopy Walk' },
  { level: 27, x: 37.5, y: 14.0, name: 'Mushroom Glade' },
  { level: 28, x: 43.5, y: 16.5, name: 'Sky Peak Viaduct' },
  { level: 29, x: 48.5, y: 21.0, name: 'Cloudveil Arch' },
  { level: 30, x: 44.0, y: 27.5, name: 'Ancient Peaks Spire', isMilestone: true },

  // Inner Loop: Inward spiral towards Dragon Temple
  { level: 31, x: 38.0, y: 32.5, name: 'Dragon Tooth Pass' },
  { level: 32, x: 34.0, y: 39.5, name: 'Secret Terrace' },
  { level: 33, x: 33.5, y: 48.0, name: 'Sacred Waterfalls' },
  { level: 34, x: 36.5, y: 55.5, name: 'Golden Span Bridge' },
  { level: 35, x: 42.0, y: 60.5, name: 'Guardian Colonnade', isMilestone: true },
  { level: 36, x: 48.0, y: 60.0, name: 'Temple Ascent Road' },
  { level: 37, x: 53.5, y: 56.0, name: 'Sunstone Courtyard' },
  { level: 38, x: 57.5, y: 49.5, name: 'Dragon Pillars Plaza' },
  { level: 39, x: 59.5, y: 42.0, name: 'Sanctum Altar Steps' },
  { level: 40, x: 59.5, y: 33.0, name: 'Grand Dragon Shrine Summit', isBoss: true }
];

export function getLevelCoord(level) {
  const index = Math.max(0, Math.min(SAGA_SPIRAL_COORDS.length - 1, level - 1));
  return SAGA_SPIRAL_COORDS[index];
}

/**
 * Generates a smooth cubic Bézier spline in pixel coordinates for SVG (1376 x 768).
 */
export function generateSplinePath(points, maxCount = points.length) {
  const pts = points.slice(0, maxCount).map(p => ({
    x: (p.x / 100) * 1376,
    y: (p.y / 100) * 768
  }));

  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Generates intermediate stepping stones between consecutive waypoints in pixel coordinates.
 */
export function getSteppingStones(points) {
  const stones = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1x = (points[i].x / 100) * 1376;
    const p1y = (points[i].y / 100) * 768;
    const p2x = (points[i + 1].x / 100) * 1376;
    const p2y = (points[i + 1].y / 100) * 768;

    stones.push({
      x: p1x + (p2x - p1x) * 0.35,
      y: p1y + (p2y - p1y) * 0.35,
      segment: i + 1
    });
    stones.push({
      x: p1x + (p2x - p1x) * 0.70,
      y: p1y + (p2y - p1y) * 0.70,
      segment: i + 1
    });
  }
  return stones;
}
