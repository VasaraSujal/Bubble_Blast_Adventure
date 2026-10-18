/**
 * Production 3D Candy Marble Bubble Rendering Engine
 * Inspired by Bubble Shooter - Dragon Pop reference game aesthetics:
 * - Multi-layer radial shading with specular pill highlights & ambient bounce rim
 * - Animated Baby Dragon trapped eggs with blinking cute eyes
 * - High-voltage Lightning, Fire Bomb, and Prismatic Rainbow special bubbles
 */

export const COLOR_PALETTE = {
  red: {
    main: '#ef4444',
    dark: '#881337',
    light: '#fca5a5',
    specular: '#ffffff',
    glow: 'rgba(239, 68, 68, 0.5)'
  },
  blue: {
    main: '#3b82f6',
    dark: '#1e3a8a',
    light: '#93c5fd',
    specular: '#ffffff',
    glow: 'rgba(59, 130, 246, 0.5)'
  },
  green: {
    main: '#10b981',
    dark: '#064e3b',
    light: '#6ee7b7',
    specular: '#ffffff',
    glow: 'rgba(16, 185, 129, 0.5)'
  },
  yellow: {
    main: '#f59e0b',
    dark: '#78350f',
    light: '#fef08a',
    specular: '#ffffff',
    glow: 'rgba(245, 158, 11, 0.5)'
  },
  purple: {
    main: '#8b5cf6',
    dark: '#4c1d95',
    light: '#ddd6fe',
    specular: '#ffffff',
    glow: 'rgba(139, 92, 246, 0.5)'
  },
  orange: {
    main: '#f97316',
    dark: '#7c2d12',
    light: '#fed7aa',
    specular: '#ffffff',
    glow: 'rgba(249, 115, 22, 0.5)'
  },
  pink: {
    main: '#ec4899',
    dark: '#831843',
    light: '#fbcfe8',
    specular: '#ffffff',
    glow: 'rgba(236, 72, 153, 0.5)'
  },
  cyan: {
    main: '#06b6d4',
    dark: '#164e63',
    light: '#a5f3fc',
    specular: '#ffffff',
    glow: 'rgba(6, 182, 212, 0.5)'
  },
  bomb: {
    main: '#1e293b',
    dark: '#020617',
    light: '#64748b',
    specular: '#f87171',
    glow: 'rgba(239, 68, 68, 0.7)'
  },
  rainbow: {
    main: '#a855f7',
    dark: '#581c87',
    light: '#fbcfe8',
    specular: '#ffffff',
    glow: 'rgba(168, 85, 247, 0.7)'
  }
};

/**
 * Renders an ultra-glossy commercial game bubble onto Canvas 2D
 */
export const drawBubble = (
  ctx,
  x,
  y,
  radius,
  bubbleData,
  alpha = 1,
  scale = 1
) => {
  if (!bubbleData) return;

  const colorKey = typeof bubbleData === 'string' ? bubbleData : (bubbleData.color || 'blue');
  const palette = COLOR_PALETTE[colorKey] || COLOR_PALETTE.blue;
  const r = radius * scale;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.translate(x, y);

  // 1. Soft Ambient Depth Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 5;

  // 2. Base Sphere Spherical Gradient
  const baseGrad = ctx.createRadialGradient(
    -r * 0.35,
    -r * 0.35,
    r * 0.08,
    0,
    0,
    r
  );

  if (colorKey === 'rainbow') {
    // Prismatic rainbow gradient
    baseGrad.addColorStop(0, '#ffffff');
    baseGrad.addColorStop(0.25, '#38bdf8');
    baseGrad.addColorStop(0.5, '#ec4899');
    baseGrad.addColorStop(0.75, '#fbbf24');
    baseGrad.addColorStop(1, '#8b5cf6');
  } else {
    baseGrad.addColorStop(0, palette.light);
    baseGrad.addColorStop(0.45, palette.main);
    baseGrad.addColorStop(0.85, palette.dark);
    baseGrad.addColorStop(1, '#020617');
  }

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // Reset outer shadow
  ctx.shadowColor = 'transparent';

  // 3. Inner Translucent Glass Rim
  ctx.beginPath();
  ctx.arc(0, 0, r - 1, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 4. Primary Specular Pill Reflection (Cartoon Glint)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(
    -r * 0.35,
    -r * 0.35,
    r * 0.35,
    r * 0.22,
    -Math.PI / 4,
    0,
    Math.PI * 2
  );
  const pillGrad = ctx.createLinearGradient(
    -r * 0.35,
    -r * 0.5,
    -r * 0.35,
    -r * 0.2
  );
  pillGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  pillGrad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
  ctx.fillStyle = pillGrad;
  ctx.fill();
  ctx.restore();

  // 5. Secondary Bottom Bounce Reflection
  ctx.beginPath();
  ctx.ellipse(
    r * 0.3,
    r * 0.35,
    r * 0.3,
    r * 0.12,
    -Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fill();

  // 6. Special Bubble & Dragon Rescue Target Rendering
  const isRescueTarget = typeof bubbleData === 'object' && bubbleData.hasRescueTarget;
  const isBomb = colorKey === 'bomb' || (typeof bubbleData === 'object' && bubbleData.isBomb);
  const isRainbow = colorKey === 'rainbow' || (typeof bubbleData === 'object' && bubbleData.isRainbow);

  if (isRescueTarget) {
    // Golden egg rim glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Cute Baby Dragon Silhouette & Eyes
    ctx.font = `${Math.floor(r * 1.05)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦕', 0, 1);
    ctx.restore();
  } else if (isBomb) {
    // Bomb Hazard Icon
    ctx.save();
    ctx.font = `${Math.floor(r * 0.95)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💣', 0, 1);
    ctx.restore();
  } else if (isRainbow) {
    // Rainbow Star Icon
    ctx.save();
    ctx.font = `${Math.floor(r * 0.95)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌈', 0, 1);
    ctx.restore();
  }

  ctx.restore();
};

export default {
  COLOR_PALETTE,
  drawBubble
};
