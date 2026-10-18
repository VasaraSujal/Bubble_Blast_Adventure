/**
 * Production Visual Effects & Particle Engine
 * Features:
 * - Radial shockwave rings on matches and bomb blasts
 * - Multi-colored star sparkles and confetti pops
 * - Comic-book styled floating achievement stickers ("GREAT!", "AWESOME!", "DRAGON SAVED!")
 * - Trapped baby dragons flapping wings down to safety
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.textPopups = [];
    this.shockwaves = [];
    this.fallingBubbles = [];
    this.rescuedDragons = [];
  }

  /**
   * Spawn a burst of sparkling circular particles for a popped bubble
   */
  spawnPopBurst(x, y, color = '#38bdf8', count = 14) {
    // Add expanding shockwave ring
    this.shockwaves.push({
      x,
      y,
      radius: 8,
      maxRadius: 36,
      color,
      alpha: 0.9,
      lineWidth: 3
    });

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const speed = 2.5 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 3.5,
        color,
        alpha: 1,
        decay: 0.025 + Math.random() * 0.02,
        gravity: 0.16
      });
    }
  }

  /**
   * Spawn explosive bomb shockwave
   */
  spawnBombShockwave(x, y) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 90,
      color: '#f97316',
      alpha: 1,
      lineWidth: 5
    });

    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color: i % 2 === 0 ? '#ef4444' : '#fbbf24',
        alpha: 1,
        decay: 0.02,
        gravity: 0.18
      });
    }
  }

  /**
   * Spawn floating comic text popup (e.g. "GREAT!", "COMBO x2!", "DRAGON SAVED!")
   */
  spawnTextPopup(x, y, text, color = '#fbbf24', fontSize = 20) {
    this.textPopups.push({
      x,
      y,
      vy: -2,
      text,
      color,
      fontSize,
      alpha: 1,
      scale: 1.4,
      decay: 0.018
    });
  }

  /**
   * Add a floating bubble to the gravity drop simulator
   */
  addFallingBubble(x, y, radius, bubbleData) {
    this.fallingBubbles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: -1.5 + Math.random() * 2,
      rotation: 0,
      vRot: (Math.random() - 0.5) * 0.18,
      radius,
      bubbleData,
      alpha: 1,
      decay: 0.015,
      gravity: 0.45
    });
  }

  /**
   * Animate a freed baby dragon swooping towards safety
   */
  spawnFreedDragon(startX, startY) {
    this.rescuedDragons.push({
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 2,
      vy: -4, // Flaps up first, then curves
      alpha: 1,
      scale: 1.3,
      decay: 0.015
    });
  }

  /**
   * Update physics tick
   */
  update(boardHeight) {
    // 1. Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 2.5;
      sw.alpha -= 0.045;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 2. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 3. Update comic text popups
    for (let i = this.textPopups.length - 1; i >= 0; i--) {
      const t = this.textPopups[i];
      t.y += t.vy;
      t.alpha -= t.decay;
      if (t.scale > 1) {
        t.scale -= 0.025;
      }

      if (t.alpha <= 0) {
        this.textPopups.splice(i, 1);
      }
    }

    // 4. Update falling bubbles
    for (let i = this.fallingBubbles.length - 1; i >= 0; i--) {
      const fb = this.fallingBubbles[i];
      fb.x += fb.vx;
      fb.y += fb.vy;
      fb.vy += fb.gravity;
      fb.rotation += fb.vRot;
      fb.alpha -= fb.decay;

      if (fb.y > boardHeight + 50 || fb.alpha <= 0) {
        this.spawnPopBurst(fb.x, Math.min(boardHeight - 10, fb.y), '#38bdf8', 6);
        this.fallingBubbles.splice(i, 1);
      }
    }

    // 5. Update freed dragons
    for (let i = this.rescuedDragons.length - 1; i >= 0; i--) {
      const rd = this.rescuedDragons[i];
      rd.x += rd.vx;
      rd.y += rd.vy;
      rd.vy += 0.15; // Arc downward
      rd.alpha -= rd.decay;

      if (rd.alpha <= 0) {
        this.rescuedDragons.splice(i, 1);
      }
    }
  }

  /**
   * Render all effects
   */
  draw(ctx, drawBubbleFn) {
    // 1. Draw shockwaves
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.lineWidth;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw falling bubbles
    for (const fb of this.fallingBubbles) {
      ctx.save();
      ctx.translate(fb.x, fb.y);
      ctx.rotate(fb.rotation);
      drawBubbleFn(ctx, 0, 0, fb.radius, fb.bubbleData, fb.alpha);
      ctx.restore();
    }

    // 3. Draw freed baby dragons flapping
    for (const rd of this.rescuedDragons) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, rd.alpha);
      ctx.font = `${Math.floor(28 * rd.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.fillText('🦕', rd.x, rd.y);
      ctx.restore();
    }

    // 4. Draw spark particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Draw comic text popups
    for (const t of this.textPopups) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.font = `900 ${Math.floor(t.fontSize * t.scale)}px 'Fredoka', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = t.color;
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#050b14';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 10;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
    this.textPopups = [];
    this.shockwaves = [];
    this.fallingBubbles = [];
    this.rescuedDragons = [];
  }
}

export default ParticleSystem;
