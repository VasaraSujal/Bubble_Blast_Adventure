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
   * Animate a freed baby dragon swooping up towards top HUD with golden trail sparkles
   */
  spawnFreedDragon(startX, startY, targetX = 145, targetY = 15) {
    this.rescuedDragons.push({
      startX,
      startY,
      x: startX,
      y: startY,
      targetX,
      targetY,
      progress: 0,
      speed: 0.016, // Arrives at HUD in ~60 frames
      wingFlap: 0,
      scale: 1.0,
      alpha: 1,
      controlX: startX + (Math.random() - 0.5) * 110,
      controlY: Math.min(startY - 80, 90)
    });

    // Initial liberation burst with expanding shockwave
    this.shockwaves.push({
      x: startX,
      y: startY,
      radius: 12,
      maxRadius: 48,
      color: '#22c55e',
      lineWidth: 3.5,
      alpha: 1
    });

    // Spawn golden & emerald celebration sparkles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4.5;
      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        radius: 2 + Math.random() * 3,
        color: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#4ade80' : '#38bdf8',
        alpha: 1,
        decay: 0.022,
        gravity: 0.06
      });
    }
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

    // 5. Update flying freed baby dragons along Bezier arc toward HUD
    for (let i = this.rescuedDragons.length - 1; i >= 0; i--) {
      const rd = this.rescuedDragons[i];
      rd.progress += rd.speed;
      rd.wingFlap += 0.45; // Fast energetic flutter

      // Quadratic Bezier interpolation
      const t = Math.min(1, rd.progress);
      const invT = 1 - t;
      rd.x = invT * invT * rd.startX + 2 * invT * t * rd.controlX + t * t * rd.targetX;
      rd.y = invT * invT * rd.startY + 2 * invT * t * rd.controlY + t * t * rd.targetY;
      
      rd.scale = 1 + Math.sin(rd.wingFlap * 0.5) * 0.12;

      // Drop fairy dust sparkles along flight trajectory
      if (Math.random() > 0.3) {
        this.particles.push({
          x: rd.x + (Math.random() - 0.5) * 10,
          y: rd.y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.2,
          vy: 0.6 + Math.random() * 1.5,
          radius: 1.5 + Math.random() * 2.2,
          color: Math.random() > 0.5 ? '#fde047' : '#86efac',
          alpha: 0.9,
          decay: 0.035,
          gravity: 0.02
        });
      }

      // Reached Top HUD Counter Badge!
      if (rd.progress >= 1.0) {
        this.shockwaves.push({
          x: rd.targetX,
          y: rd.targetY,
          radius: 8,
          maxRadius: 36,
          color: '#fbbf24',
          lineWidth: 3,
          alpha: 1
        });
        for (let k = 0; k < 16; k++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 2 + Math.random() * 3.5;
          this.particles.push({
            x: rd.targetX,
            y: rd.targetY,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            radius: 2 + Math.random() * 2.5,
            color: '#fbbf24',
            alpha: 1,
            decay: 0.03,
            gravity: 0.04
          });
        }

        // Pulse the HTML rescue badge in the top HUD
        if (typeof document !== 'undefined') {
          const badge = document.getElementById('arcade-hud-rescue-badge');
          if (badge) {
            badge.classList.remove('rescue-badge-pop');
            void badge.offsetWidth; // trigger reflow
            badge.classList.add('rescue-badge-pop');
          }
        }

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

    // 3. Draw freed baby dragons flapping upwards to safety
    for (const rd of this.rescuedDragons) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, rd.alpha);
      ctx.translate(rd.x, rd.y);
      const s = rd.scale || 1.2;
      ctx.scale(s, s);

      const wingY = Math.sin(rd.wingFlap) * 6;
      const wingAngle = Math.sin(rd.wingFlap) * 0.45;

      // Glowing Translucent Fairy Wings
      ctx.save();
      ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 10;

      // Left Wing
      ctx.save();
      ctx.translate(-10, -2);
      ctx.rotate(-0.3 + wingAngle);
      ctx.beginPath();
      ctx.ellipse(0, wingY * 0.5, 9, 15, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right Wing
      ctx.save();
      ctx.translate(10, -2);
      ctx.rotate(0.3 - wingAngle);
      ctx.beginPath();
      ctx.ellipse(0, wingY * 0.5, 9, 15, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();

      // Chubby Green Baby Body & Head
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();

      // Soft Yellow Tummy
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(2, 3, 7, 9, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Crest Spines
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-6, -11);
      ctx.lineTo(0, -18);
      ctx.lineTo(6, -11);
      ctx.closePath();
      ctx.fill();

      // Rosy Cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.65)';
      ctx.beginPath();
      ctx.arc(-7, 2, 3, 0, Math.PI * 2);
      ctx.arc(7, 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Big Happy Cartoon Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -3, 3.8, 0, Math.PI * 2);
      ctx.arc(4, -3, 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-3.5, -3, 2.2, 0, Math.PI * 2);
      ctx.arc(4.5, -3, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Specular eye catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4.5, -4.5, 1.2, 0, Math.PI * 2);
      ctx.arc(3.5, -4.5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Golden Halo Glow
      ctx.beginPath();
      ctx.ellipse(0, -20, 11, 3.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.stroke();

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
