/**
 * Premium 3D Animated Baby Dinosaur Companion Renderer
 * Inspired by reference mobile game (Bubble Shooter: Dragon Pop) companion mascot.
 * Renders high-resolution 3D Pixar-grade baby dinosaur with squash & stretch,
 * breathing oscillation, celebratory hopping, and interactive reaction speech bubbles.
 */

let dinoImage = null;
let dinoImageLoaded = false;

// Preload companion image asset
function getDinoImage() {
  if (typeof window === 'undefined') return null;
  if (!dinoImage) {
    dinoImage = new Image();
    dinoImage.src = '/assets/dino_mascot.png';
    dinoImage.onload = () => {
      dinoImageLoaded = true;
    };
  }
  return dinoImage;
}

// Immediately trigger preload
if (typeof window !== 'undefined') {
  getDinoImage();
}

export function drawDinoCompanion(ctx, baseX, baseY, options = {}) {
  const {
    aimAngle = -Math.PI / 2,
    isAiming = false,
    combo = 0,
    reaction = 'idle',
    time = Date.now()
  } = options;

  const img = getDinoImage();

  ctx.save();

  // Animation dynamics
  const isExcited = combo >= 2 || reaction === 'victory' || reaction === 'combo';
  const isSad = reaction === 'sad';
  
  // Idle breathing oscillation
  const breath = Math.sin(time * 0.0035);
  // Celebratory hop when combo is active
  const hopY = isExcited ? Math.abs(Math.sin(time * 0.009)) * 12 : 0;
  
  // Squash & Stretch
  const scaleY = isExcited 
    ? 1 + Math.sin(time * 0.009) * 0.06 
    : 1 + breath * 0.02;
  const scaleX = isExcited 
    ? 1 - Math.sin(time * 0.009) * 0.04 
    : 1 - breath * 0.015;

  // Aiming lean (slight anticipation angle towards center)
  const leanAngle = isAiming ? 0.05 : isExcited ? Math.sin(time * 0.008) * 0.04 : 0;

  const targetWidth = 108;
  const targetHeight = 160;

  // 1. Soft Dynamic Contact Ground Shadow
  ctx.save();
  ctx.beginPath();
  const shadowScale = isExcited ? Math.max(0.65, 1 - hopY / 22) : 1 + breath * 0.03;
  ctx.ellipse(baseX + 2, baseY + 2, 42 * shadowScale, 11 * shadowScale, 0, 0, Math.PI * 2);
  const shadowGrad = ctx.createRadialGradient(baseX + 2, baseY + 2, 0, baseX + 2, baseY + 2, 42 * shadowScale);
  shadowGrad.addColorStop(0, 'rgba(2, 6, 23, 0.70)');
  shadowGrad.addColorStop(0.6, 'rgba(2, 6, 23, 0.35)');
  shadowGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.fill();
  ctx.restore();

  // 2. Render 3D Baby Dinosaur Mascot
  ctx.save();
  ctx.translate(baseX, baseY - hopY);
  ctx.rotate(leanAngle);
  ctx.scale(scaleX, scaleY);

  if (img && (img.complete || dinoImageLoaded) && img.naturalWidth > 0) {
    // Render crisp 3D mascot anchored at bottom center of feet
    ctx.drawImage(
      img,
      -targetWidth * 0.48,
      -targetHeight + 4,
      targetWidth,
      targetHeight
    );
  } else {
    // Fallback cute placeholder if image is still loading
    ctx.beginPath();
    ctx.ellipse(0, -60, 32, 48, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
  }
  ctx.restore();

  // 3. Reaction Speech Bubble / Juice Overlays
  const headTopY = baseY - hopY - targetHeight * scaleY + 20;
  const headCenterX = baseX + 18;

  if (isExcited) {
    // Floating star particles above head
    ctx.save();
    const starCycle = (time * 0.003) % (Math.PI * 2);
    for (let i = 0; i < 3; i++) {
      const angle = starCycle + (i * Math.PI * 2) / 3;
      const sx = headCenterX + Math.cos(angle) * 34;
      const sy = headTopY - 14 + Math.sin(angle) * 8;
      
      ctx.beginPath();
      ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#fbbf24' : '#f472b6';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 6;
      ctx.fill();
    }

    // Cheerful reaction speech bubble
    const bubbleX = headCenterX + 38;
    const bubbleY = headTopY - 10;
    const text = combo >= 4 ? '👑 UNREAL!' : combo >= 2 ? `🔥 x${combo}!` : '🎉 YAY!';

    ctx.beginPath();
    ctx.roundRect(bubbleX - 34, bubbleY - 14, 68, 28, 14);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.stroke();

    // Little speech triangle tail pointing to mascot head
    ctx.beginPath();
    ctx.moveTo(bubbleX - 16, bubbleY + 14);
    ctx.lineTo(bubbleX - 26, bubbleY + 22);
    ctx.lineTo(bubbleX - 8, bubbleY + 14);
    ctx.closePath();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fill();

    ctx.font = 'bold 12px Fredoka, Outfit, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bubbleX, bubbleY);
    ctx.restore();
  } else if (isSad) {
    // Nervous sweat droplet when low on shots
    ctx.save();
    const sweatY = headTopY + 15 + Math.sin(time * 0.006) * 3;
    const sweatX = headCenterX + 28;

    ctx.beginPath();
    ctx.moveTo(sweatX, sweatY - 6);
    ctx.quadraticCurveTo(sweatX + 4, sweatY, sweatX, sweatY + 5);
    ctx.quadraticCurveTo(sweatX - 4, sweatY, sweatX, sweatY - 6);
    ctx.closePath();
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}
