import React, { useRef, useEffect, useState, useCallback } from 'react';
import { COLS_EVEN, COLS_ODD, getBubbleCenter, findNearestValidSlot } from '../../game/grid.js';
import { handleWallBounce, checkBubbleCollision, checkCeilingCollision } from '../../game/collision.js';
import { calculateTrajectory } from '../../game/trajectory.js';
import { drawBubble } from '../../game/bubbleRenderer.js';
import { findConnectedMatches } from '../../game/matchDetector.js';
import { findFloatingBubbles } from '../../game/floatingDetector.js';
import { ParticleSystem } from '../../game/particleSystem.js';
import { calculatePopScore, calculateFloatingScore, calculateRescueScore } from '../../game/scoreManager.js';
import { audioManager } from '../../utils/audioManager.js';
import { drawDinoCompanion } from '../../game/dinoCompanionRenderer.js';

export default function BubbleCanvas({
  initialBoard,
  restoreGrid = null,
  shotsRemaining = 25,
  currentBubble = 'red',
  nextBubble = 'blue',
  aimGuideActive = false,
  combo = 0,
  onShotFired,
  onScoreAdded,
  onComboChanged,
  onRescueFree,
  onBoardStateChange,
  onSwapBubbles
}) {
  const canvasRef = useRef(null);
  const particleSystemRef = useRef(new ParticleSystem());

  // Board dimensions
  const BOARD_WIDTH = 480;
  const BOARD_HEIGHT = 640;
  const cellWidth = BOARD_WIDTH / COLS_EVEN;
  const BUBBLE_RADIUS = cellWidth / 2;

  // Launcher & Portal Ring coordinates (Reference Game Layout)
  const LAUNCHER_X = BOARD_WIDTH / 2;
  const RING_Y = BOARD_HEIGHT - 52;
  const RING_X = LAUNCHER_X;
  const RING_RADIUS = 32;

  // Active loaded bubble rests atop the glowing portal ring
  const LAUNCHER_Y = RING_Y - RING_RADIUS - 10;

  // Next bubble preview coordinates (docked on lower-right rim of ring)
  const PREVIEW_X = LAUNCHER_X + 36;
  const PREVIEW_Y = RING_Y + 12;
  const PREVIEW_RADIUS = BUBBLE_RADIUS * 0.76;

  // Local game states
  const [grid, setGrid] = useState(initialBoard || []);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const [isAiming, setIsAiming] = useState(false);
  const [projectile, setProjectile] = useState(null);
  const [recoil, setRecoil] = useState(0);

  // Sync grid when initialBoard changes
  useEffect(() => {
    if (initialBoard && initialBoard.length > 0) {
      setGrid(initialBoard);
    }
  }, [initialBoard]);

  // Sync grid when restoreGrid triggers (Section 46: Real Undo Board Restoration)
  useEffect(() => {
    if (restoreGrid && restoreGrid.grid) {
      setGrid(restoreGrid.grid.map(r => r ? [...r] : []));
    }
  }, [restoreGrid]);

  // Compute aiming angle from pointer coordinates
  const updateAimFromPointer = useCallback((clientX, clientY) => {
    if (projectile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = BOARD_WIDTH / rect.width;
    const scaleY = BOARD_HEIGHT / rect.height;

    const pointerX = (clientX - rect.left) * scaleX;
    const pointerY = (clientY - rect.top) * scaleY;

    // Check if player clicked directly on the NEXT preview bubble or moves ring to swap
    const distToPreview = Math.hypot(pointerX - PREVIEW_X, pointerY - PREVIEW_Y);
    const distToRing = Math.hypot(pointerX - RING_X, pointerY - RING_Y);
    if (distToPreview <= PREVIEW_RADIUS + 6 || distToRing <= RING_RADIUS * 0.85) {
      return; // Handled in pointer down
    }

    const dx = pointerX - LAUNCHER_X;
    const dy = pointerY - LAUNCHER_Y;

    let angle = Math.atan2(dy, dx);
    const MIN_ANGLE = -Math.PI * 0.93;
    const MAX_ANGLE = -Math.PI * 0.07;
    angle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle));

    setAimAngle(angle);
  }, [projectile, LAUNCHER_X, LAUNCHER_Y, PREVIEW_X, PREVIEW_Y, PREVIEW_RADIUS]);

  // Shoot current bubble
  const shootCurrentBubble = useCallback(() => {
    if (projectile || shotsRemaining <= 0) return;

    audioManager.playLaunchSound();

    const speed = 21;
    const vx = Math.cos(aimAngle) * speed;
    const vy = Math.sin(aimAngle) * speed;

    setProjectile({
      x: LAUNCHER_X,
      y: LAUNCHER_Y,
      vx,
      vy,
      color: currentBubble,
      bounces: 0
    });

    setRecoil(14);
    if (onShotFired) onShotFired(grid);
  }, [projectile, shotsRemaining, aimAngle, LAUNCHER_X, LAUNCHER_Y, currentBubble, onShotFired, grid]);

  // Pointer events
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = BOARD_WIDTH / rect.width;
      const scaleY = BOARD_HEIGHT / rect.height;
      const pointerX = (e.clientX - rect.left) * scaleX;
      const pointerY = (e.clientY - rect.top) * scaleY;

      // Allow tapping the NEXT preview or Ring directly to swap bubbles!
      const distToPreview = Math.hypot(pointerX - PREVIEW_X, pointerY - PREVIEW_Y);
      const distToRing = Math.hypot(pointerX - RING_X, pointerY - RING_Y);
      if ((distToPreview <= PREVIEW_RADIUS + 8 || distToRing <= RING_RADIUS * 0.85) && !projectile) {
        audioManager.playButtonClick();
        if (onSwapBubbles) onSwapBubbles();
        return;
      }
    }

    setIsAiming(true);
    updateAimFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (isAiming || !('ontouchstart' in window)) {
      updateAimFromPointer(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e) => {
    if (isAiming && !projectile) {
      updateAimFromPointer(e.clientX, e.clientY);
      shootCurrentBubble();
    }
    setIsAiming(false);
  };

  // Keyboard shortcut: Space to shoot
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        shootCurrentBubble();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shootCurrentBubble]);

  // Recoil spring recovery
  useEffect(() => {
    if (recoil > 0) {
      const timer = requestAnimationFrame(() => {
        setRecoil(prev => Math.max(0, prev - 1.6));
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [recoil]);

  // Main Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pSystem = particleSystemRef.current;
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

      // 1. Full-Screen Atmosphere: Deep Twilight Night Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
      skyGrad.addColorStop(0, '#020713');
      skyGrad.addColorStop(0.35, '#04162e');
      skyGrad.addColorStop(0.65, '#072b4c');
      skyGrad.addColorStop(0.85, '#04192f');
      skyGrad.addColorStop(1, '#020914');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

      // Twinkling stars in the upper cosmos
      const stars = [
        [42, 65, 1.2, 0.7], [95, 110, 1.5, 0.9], [160, 45, 1.0, 0.6], [230, 85, 1.8, 0.95],
        [310, 50, 1.2, 0.75], [390, 95, 1.5, 0.85], [440, 40, 1.0, 0.6], [70, 220, 1.4, 0.8],
        [415, 230, 1.3, 0.75], [25, 340, 1.1, 0.5], [460, 320, 1.5, 0.85], [210, 280, 1.2, 0.6]
      ];
      stars.forEach(([sx, sy, sr, sAlpha]) => {
        ctx.fillStyle = `rgba(224, 242, 254, ${sAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Distant mystical mountain silhouettes (midground)
      ctx.save();
      ctx.fillStyle = 'rgba(6, 26, 48, 0.75)';
      ctx.beginPath();
      ctx.moveTo(0, BOARD_HEIGHT - 90);
      ctx.lineTo(80, BOARD_HEIGHT - 160);
      ctx.lineTo(190, BOARD_HEIGHT - 120);
      ctx.lineTo(310, BOARD_HEIGHT - 180);
      ctx.lineTo(410, BOARD_HEIGHT - 130);
      ctx.lineTo(BOARD_WIDTH, BOARD_HEIGHT - 150);
      ctx.lineTo(BOARD_WIDTH, BOARD_HEIGHT);
      ctx.lineTo(0, BOARD_HEIGHT);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Atmospheric twilight haze / ground glow
      const hazeGrad = ctx.createLinearGradient(0, BOARD_HEIGHT - 220, 0, BOARD_HEIGHT - 40);
      hazeGrad.addColorStop(0, 'rgba(14, 165, 233, 0)');
      hazeGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.08)');
      hazeGrad.addColorStop(1, 'rgba(6, 78, 119, 0.22)');
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, BOARD_HEIGHT - 220, BOARD_WIDTH, 180);

      // Prehistoric Jungle Silhouette Layer (Bottom ground flora & giant mushrooms)
      ctx.save();
      ctx.fillStyle = '#020b16';
      // Left jungle bank & giant mushroom
      ctx.beginPath();
      ctx.moveTo(0, BOARD_HEIGHT);
      ctx.lineTo(0, BOARD_HEIGHT - 140);
      ctx.bezierCurveTo(40, BOARD_HEIGHT - 135, 70, BOARD_HEIGHT - 120, 95, BOARD_HEIGHT - 95);
      ctx.bezierCurveTo(120, BOARD_HEIGHT - 70, 140, BOARD_HEIGHT - 55, 175, BOARD_HEIGHT - 45);
      ctx.lineTo(210, BOARD_HEIGHT - 40);
      ctx.lineTo(280, BOARD_HEIGHT - 40);
      ctx.bezierCurveTo(340, BOARD_HEIGHT - 50, 390, BOARD_HEIGHT - 80, 480, BOARD_HEIGHT - 125);
      ctx.lineTo(BOARD_WIDTH, BOARD_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Giant Mushroom Caps on left (Reference game inspired)
      ctx.fillStyle = '#031422';
      // Mushroom 1 cap
      ctx.beginPath();
      ctx.ellipse(55, BOARD_HEIGHT - 135, 42, 22, -0.1, 0, Math.PI * 2);
      ctx.fill();
      // Mushroom 1 stem
      ctx.fillRect(48, BOARD_HEIGHT - 120, 14, 45);

      // Mushroom 2 cap (smaller)
      ctx.beginPath();
      ctx.ellipse(108, BOARD_HEIGHT - 110, 26, 14, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(104, BOARD_HEIGHT - 100, 9, 32);

      // Right Ancient Stone Arch / Ruin Silhouette
      ctx.beginPath();
      ctx.arc(BOARD_WIDTH - 60, BOARD_HEIGHT - 100, 32, Math.PI * 0.8, Math.PI * 2);
      ctx.lineTo(BOARD_WIDTH, BOARD_HEIGHT - 70);
      ctx.lineTo(BOARD_WIDTH, BOARD_HEIGHT - 115);
      ctx.closePath();
      ctx.fill();

      // Bioluminescent glowing spore specks
      const spores = [[55, BOARD_HEIGHT - 145], [75, BOARD_HEIGHT - 130], [115, BOARD_HEIGHT - 118], [420, BOARD_HEIGHT - 95]];
      spores.forEach(([spx, spy]) => {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(spx, spy, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.restore();

      // Side Bank Shot Wall Reflection Guides (Sleek minimalist diamonds)
      [140, 250, 360, 470].forEach(yPos => {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
        // Left guide diamond
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(5, yPos - 5);
        ctx.lineTo(10, yPos);
        ctx.lineTo(5, yPos + 5);
        ctx.closePath();
        ctx.fill();

        // Right guide diamond
        ctx.beginPath();
        ctx.moveTo(BOARD_WIDTH, yPos);
        ctx.lineTo(BOARD_WIDTH - 5, yPos - 5);
        ctx.lineTo(BOARD_WIDTH - 10, yPos);
        ctx.lineTo(BOARD_WIDTH - 5, yPos + 5);
        ctx.closePath();
        ctx.fill();
      });

      // Ceiling Temple Lintel Bar (Sleek golden stone bar anchoring bubbles)
      const lintelGrad = ctx.createLinearGradient(0, 0, 0, 10);
      lintelGrad.addColorStop(0, '#fef08a');
      lintelGrad.addColorStop(0.4, '#f59e0b');
      lintelGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = lintelGrad;
      ctx.fillRect(0, 0, BOARD_WIDTH, 6);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.fillRect(0, 6, BOARD_WIDTH, 2);

      // 2. Active Bubble Grid
      for (let r = 0; r < grid.length; r++) {
        const row = grid[r];
        if (!row) continue;
        for (let c = 0; c < row.length; c++) {
          const bubble = row[c];
          if (bubble) {
            const { x, y, radius } = getBubbleCenter(r, c, BUBBLE_RADIUS, BOARD_WIDTH);
            drawBubble(ctx, x, y, radius, bubble);
          }
        }
      }

      // 3. Trajectory Guide & Aiming Feedback
      if (!projectile) {
        const trajectory = calculateTrajectory(
          LAUNCHER_X,
          LAUNCHER_Y,
          aimAngle,
          grid,
          BOARD_WIDTH,
          BUBBLE_RADIUS,
          aimGuideActive ? 3 : 1
        );

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = aimGuideActive ? '#fbbf24' : 'rgba(255, 255, 255, 0.75)';
        ctx.shadowColor = aimGuideActive ? '#fbbf24' : '#38bdf8';
        ctx.shadowBlur = 10;

        trajectory.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();

        // Ghost target landing bubble
        if (trajectory.predictedSlot) {
          const slot = trajectory.predictedSlot;
          ctx.save();
          ctx.beginPath();
          ctx.arc(slot.x, slot.y, BUBBLE_RADIUS, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(slot.x, slot.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.restore();
        }
      }

      // 4. Moving Projectile & Collision / Popping / Floating Resolution
      if (projectile) {
        let nextX = projectile.x + projectile.vx;
        let nextY = projectile.y + projectile.vy;
        let nextVx = projectile.vx;

        const bounce = handleWallBounce(nextX, nextVx, BUBBLE_RADIUS, BOARD_WIDTH);
        if (bounce.bounced) {
          nextX = bounce.x;
          nextVx = bounce.vx;
          audioManager.playBounceSound();
        }

        const hitCeiling = checkCeilingCollision(nextY, BUBBLE_RADIUS);
        const hitBubble = checkBubbleCollision(nextX, nextY, BUBBLE_RADIUS, grid, BOARD_WIDTH);

        if (hitCeiling || hitBubble.collided) {
          const targetSlot = findNearestValidSlot(nextX, nextY, grid, BOARD_WIDTH, BUBBLE_RADIUS);

          if (targetSlot) {
            const newGrid = grid.map(r => [...r]);
            while (newGrid.length <= targetSlot.row) {
              const rowLen = newGrid.length % 2 === 0 ? COLS_EVEN : COLS_ODD;
              newGrid.push(new Array(rowLen).fill(null));
            }
            newGrid[targetSlot.row][targetSlot.col] = projectile.color;

            const matches = findConnectedMatches(targetSlot.row, targetSlot.col, newGrid);

            let totalPointsEarned = 0;
            let rescuedCount = 0;

            if (matches.length >= 3 || (matches.length > 0 && projectile.color === 'bomb')) {
              if (projectile.color === 'bomb') {
                audioManager.playBombSound();
                pSystem.spawnBombShockwave(nextX, nextY);
              } else {
                audioManager.playPopSound();
              }

              const nextCombo = combo + 1;
              if (onComboChanged) onComboChanged(nextCombo);

              if (nextCombo >= 2) {
                audioManager.playComboSound(nextCombo);
              }

              const popScore = calculatePopScore(matches.length, nextCombo);
              totalPointsEarned += popScore;

              matches.forEach(m => {
                newGrid[m.row][m.col] = null;
                const { x, y } = getBubbleCenter(m.row, m.col, BUBBLE_RADIUS, BOARD_WIDTH);
                pSystem.spawnPopBurst(x, y, '#38bdf8', 16);

                if (typeof m.bubble === 'object' && m.bubble.hasRescueTarget) {
                  rescuedCount++;
                  audioManager.playRescueSound();
                  pSystem.spawnFreedDragon(x, y);
                  pSystem.spawnTextPopup(x, y - 25, '🎉 DRAGON SAVED!', '#10b981', 22);
                }
              });

              const { x: hitX, y: hitY } = getBubbleCenter(targetSlot.row, targetSlot.col, BUBBLE_RADIUS, BOARD_WIDTH);
              pSystem.spawnTextPopup(hitX, hitY, `+${popScore}`, '#fbbf24', 20);

              if (nextCombo === 2) {
                pSystem.spawnTextPopup(hitX, hitY - 32, '🔥 GREAT!', '#f59e0b', 24);
              } else if (nextCombo === 3) {
                pSystem.spawnTextPopup(hitX, hitY - 32, '⚡ AWESOME!', '#ec4899', 26);
              } else if (nextCombo >= 4) {
                pSystem.spawnTextPopup(hitX, hitY - 32, '👑 UNSTOPPABLE!', '#a855f7', 28);
              }

              const floating = findFloatingBubbles(newGrid);
              if (floating.length > 0) {
                const floatScore = calculateFloatingScore(floating.length, nextCombo);
                totalPointsEarned += floatScore;

                floating.forEach(fb => {
                  newGrid[fb.row][fb.col] = null;
                  const { x, y } = getBubbleCenter(fb.row, fb.col, BUBBLE_RADIUS, BOARD_WIDTH);
                  pSystem.addFallingBubble(x, y, BUBBLE_RADIUS, fb.bubble);

                  // Free trapped dragon if dropped via cascade
                  if (typeof fb.bubble === 'object' && fb.bubble.hasRescueTarget) {
                    rescuedCount++;
                    audioManager.playRescueSound();
                    pSystem.spawnFreedDragon(x, y);
                    pSystem.spawnTextPopup(x, y - 25, '🎉 DRAGON SAVED!', '#10b981', 22);
                  }
                });

                pSystem.spawnTextPopup(BOARD_WIDTH / 2, hitY - 15, `+${floatScore} CASCADE!`, '#38bdf8', 22);
              }
            } else {
              audioManager.playBounceSound();
              if (onComboChanged) onComboChanged(0);
            }

            while (newGrid.length > 0 && newGrid[newGrid.length - 1].every(cell => cell === null)) {
              newGrid.pop();
            }

            setGrid(newGrid);

            const extraRescueScore = rescuedCount > 0 ? calculateRescueScore(rescuedCount) : 0;
            const overallPointsEarned = totalPointsEarned + extraRescueScore;

            if (onScoreAdded && overallPointsEarned > 0) onScoreAdded(overallPointsEarned);
            if (onRescueFree && rescuedCount > 0) {
              onRescueFree(rescuedCount);
            }
            if (onBoardStateChange) {
              onBoardStateChange(newGrid, { pointsEarned: overallPointsEarned, newlyRescued: rescuedCount });
            }
          }

          setProjectile(null);
        } else {
          setProjectile(prev => ({
            ...prev,
            x: nextX,
            y: nextY,
            vx: nextVx
          }));

          drawBubble(ctx, nextX, nextY, BUBBLE_RADIUS, projectile.color);
        }
      }

      // 5. Update & Draw Particles, Floating Bubbles, Popups
      pSystem.update(BOARD_HEIGHT);
      pSystem.draw(ctx, drawBubble);

      // 6. Draw Living Mascot Dinosaur Companion on Bottom-Left
      drawDinoCompanion(ctx, 100, BOARD_HEIGHT - 12, {
        aimAngle,
        isAiming,
        combo,
        reaction: combo >= 2 ? 'combo' : shotsRemaining <= 3 ? 'sad' : 'idle',
        time: Date.now()
      });

      // 7. Draw Reference-Style Glowing Ring Portal Shooter
      ctx.save();
      ctx.translate(RING_X, RING_Y);

      // Outer Portal Atmosphere Glow Pulse
      const ringPulse = Math.sin(Date.now() * 0.004) * 2;
      ctx.beginPath();
      ctx.arc(0, 0, RING_RADIUS + 3 + ringPulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Dark Portal Depth Chamber
      ctx.beginPath();
      ctx.arc(0, 0, RING_RADIUS, 0, Math.PI * 2);
      const portalGrad = ctx.createRadialGradient(0, -4, 2, 0, 0, RING_RADIUS);
      portalGrad.addColorStop(0, '#0f274a');
      portalGrad.addColorStop(0.7, '#08172c');
      portalGrad.addColorStop(1, '#030a14');
      ctx.fillStyle = portalGrad;
      ctx.fill();

      // Glowing Neon Ring Outer Bevel
      ctx.beginPath();
      ctx.arc(0, 0, RING_RADIUS, 0, Math.PI * 2);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner Rune Accent Arc
      ctx.beginPath();
      ctx.arc(0, 0, RING_RADIUS - 4, Math.PI * 0.2, Math.PI * 0.8);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Remaining Shots Counter in Center of Ring
      ctx.font = 'bold 24px Fredoka, sans-serif';
      ctx.fillStyle = shotsRemaining <= 5 ? '#f87171' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 5;
      ctx.fillText(shotsRemaining.toString(), 0, 0);
      ctx.shadowBlur = 0;

      ctx.restore();

      // 8. Draw Loaded Bubble seated on top of the Portal Ring
      if (!projectile) {
        ctx.save();
        // Aim Laser Sight Arrow pointing towards aim direction
        if (isAiming) {
          ctx.save();
          ctx.translate(LAUNCHER_X, LAUNCHER_Y + recoil);
          ctx.rotate(aimAngle + Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, -BUBBLE_RADIUS - 12);
          ctx.lineTo(-7, -BUBBLE_RADIUS - 2);
          ctx.lineTo(7, -BUBBLE_RADIUS - 2);
          ctx.closePath();
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
        }

        ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
        ctx.shadowBlur = 12;
        drawBubble(ctx, LAUNCHER_X, LAUNCHER_Y + recoil, BUBBLE_RADIUS, currentBubble);
        ctx.restore();
      }

      // 9. Next Bubble Docked Preview with Tap-to-Swap Socket
      ctx.save();
      // Socket Base with Golden Ring
      ctx.beginPath();
      ctx.arc(PREVIEW_X, PREVIEW_Y, PREVIEW_RADIUS + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Secondary Bubble
      drawBubble(ctx, PREVIEW_X, PREVIEW_Y, PREVIEW_RADIUS, nextBubble);

      // Curved Tap-to-Swap Badge
      ctx.font = 'bold 9px Fredoka, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 4;
      ctx.fillText('SWAP 🔄', PREVIEW_X, PREVIEW_Y + PREVIEW_RADIUS + 3);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [grid, aimAngle, projectile, recoil, aimGuideActive, currentBubble, nextBubble, combo, shotsRemaining, onShotFired, onScoreAdded, onComboChanged, onRescueFree, onBoardStateChange, BUBBLE_RADIUS, LAUNCHER_X, LAUNCHER_Y, PREVIEW_X, PREVIEW_Y, PREVIEW_RADIUS]);

  return (
    <div
      className="bubble-canvas-wrapper"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        className="bubble-board-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          width: '100%',
          maxWidth: 'min(100vw, 540px)',
          height: '100%',
          maxHeight: '100%',
          aspectRatio: `${BOARD_WIDTH}/${BOARD_HEIGHT}`,
          objectFit: 'contain',
          cursor: projectile ? 'not-allowed' : 'crosshair',
          touchAction: 'none'
        }}
      />
    </div>
  );
}
