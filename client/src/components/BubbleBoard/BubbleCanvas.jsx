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

export default function BubbleCanvas({
  initialBoard,
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

  // Launcher coordinates
  const LAUNCHER_X = BOARD_WIDTH / 2;
  const LAUNCHER_Y = BOARD_HEIGHT - 52;

  // Next bubble preview coordinates
  const PREVIEW_X = LAUNCHER_X - 66;
  const PREVIEW_Y = LAUNCHER_Y + 10;
  const PREVIEW_RADIUS = BUBBLE_RADIUS * 0.9;

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

    // Check if player clicked directly on the NEXT preview bubble to swap
    const distToPreview = Math.hypot(pointerX - PREVIEW_X, pointerY - PREVIEW_Y);
    if (distToPreview <= PREVIEW_RADIUS) {
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
    if (onShotFired) onShotFired();
  }, [projectile, shotsRemaining, aimAngle, LAUNCHER_X, LAUNCHER_Y, currentBubble, onShotFired]);

  // Pointer events
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = BOARD_WIDTH / rect.width;
      const scaleY = BOARD_HEIGHT / rect.height;
      const pointerX = (e.clientX - rect.left) * scaleX;
      const pointerY = (e.clientY - rect.top) * scaleY;

      // Allow tapping the NEXT preview directly to swap bubbles!
      const distToPreview = Math.hypot(pointerX - PREVIEW_X, pointerY - PREVIEW_Y);
      if (distToPreview <= PREVIEW_RADIUS && !projectile) {
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

      // 1. Atmosphere Background with Enchanted Sky Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, BOARD_HEIGHT);
      bgGrad.addColorStop(0, '#060f22');
      bgGrad.addColorStop(0.35, '#0b1c36');
      bgGrad.addColorStop(0.7, '#112646');
      bgGrad.addColorStop(1, '#071224');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

      // Magical glowing side pillars with reflection diamonds
      const pillarGradLeft = ctx.createLinearGradient(0, 0, 18, 0);
      pillarGradLeft.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      pillarGradLeft.addColorStop(1, 'transparent');
      ctx.fillStyle = pillarGradLeft;
      ctx.fillRect(0, 0, 18, BOARD_HEIGHT);

      const pillarGradRight = ctx.createLinearGradient(BOARD_WIDTH, 0, BOARD_WIDTH - 18, 0);
      pillarGradRight.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      pillarGradRight.addColorStop(1, 'transparent');
      ctx.fillStyle = pillarGradRight;
      ctx.fillRect(BOARD_WIDTH - 18, 0, 18, BOARD_HEIGHT);

      // Bank Shot Wall Reflection Guides (Section 14)
      [140, 260, 380, 500].forEach(yPos => {
        // Left diamond
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(6, yPos - 6);
        ctx.lineTo(12, yPos);
        ctx.lineTo(6, yPos + 6);
        ctx.closePath();
        ctx.fill();

        // Right diamond
        ctx.beginPath();
        ctx.moveTo(BOARD_WIDTH, yPos);
        ctx.lineTo(BOARD_WIDTH - 6, yPos - 6);
        ctx.lineTo(BOARD_WIDTH - 12, yPos);
        ctx.lineTo(BOARD_WIDTH - 6, yPos + 6);
        ctx.closePath();
        ctx.fill();
      });

      // Ceiling Temple Lintel (Anchor row)
      const ceilingGrad = ctx.createLinearGradient(0, 0, 0, 12);
      ceilingGrad.addColorStop(0, '#f59e0b');
      ceilingGrad.addColorStop(0.5, '#fcd34d');
      ceilingGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = ceilingGrad;
      ctx.fillRect(0, 0, BOARD_WIDTH, 7);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.fillRect(0, 7, BOARD_WIDTH, 3);

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

            if (onScoreAdded && totalPointsEarned > 0) onScoreAdded(totalPointsEarned);
            if (onRescueFree && rescuedCount > 0) {
              const rescueScore = calculateRescueScore(rescuedCount);
              if (onScoreAdded) onScoreAdded(rescueScore);
              onRescueFree(rescuedCount);
            }
            if (onBoardStateChange) onBoardStateChange(newGrid);
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

      // 6. Draw Fantasy Dragon Cannon Launcher (Section 11)
      ctx.save();
      ctx.translate(LAUNCHER_X, LAUNCHER_Y + recoil);

      // Pedestal Base Plate
      ctx.beginPath();
      ctx.arc(0, 12, 46, 0, Math.PI);
      ctx.fillStyle = '#090d16';
      ctx.fill();

      // Carved Dragon Gold Crest Rim
      const rimGrad = ctx.createLinearGradient(-45, 0, 45, 0);
      rimGrad.addColorStop(0, '#78350f');
      rimGrad.addColorStop(0.25, '#f59e0b');
      rimGrad.addColorStop(0.5, '#fef08a');
      rimGrad.addColorStop(0.75, '#f59e0b');
      rimGrad.addColorStop(1, '#78350f');
      ctx.beginPath();
      ctx.arc(0, 8, 42, 0, Math.PI);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Dragon Scale Claws on Pedestal
      [-28, 0, 28].forEach(clawX => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(clawX, 16, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Rotating Dragon Cannon Barrel
      ctx.rotate(aimAngle + Math.PI / 2);

      const barrelGrad = ctx.createLinearGradient(-12, 0, 12, 0);
      barrelGrad.addColorStop(0, '#1e293b');
      barrelGrad.addColorStop(0.3, '#475569');
      barrelGrad.addColorStop(0.5, '#94a3b8');
      barrelGrad.addColorStop(0.7, '#475569');
      barrelGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = barrelGrad;
      ctx.fillRect(-10, -50, 20, 36);

      // Golden Rune Rings on Cannon
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-11, -46, 22, 5);
      ctx.fillRect(-11, -26, 22, 5);

      // Muzzle Arrow Sight
      ctx.beginPath();
      ctx.moveTo(0, -62);
      ctx.lineTo(-12, -48);
      ctx.lineTo(12, -48);
      ctx.closePath();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.restore();

      // 7. Draw Loaded Bubble in Cannon Chamber with Glow
      if (!projectile) {
        ctx.save();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 10;
        drawBubble(ctx, LAUNCHER_X, LAUNCHER_Y + recoil, BUBBLE_RADIUS, currentBubble);
        ctx.restore();
      }

      // 8. Next Bubble Nest Preview with Tap-to-Swap hint
      ctx.beginPath();
      ctx.arc(PREVIEW_X, PREVIEW_Y, PREVIEW_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();

      drawBubble(ctx, PREVIEW_X, PREVIEW_Y, BUBBLE_RADIUS * 0.72, nextBubble);

      // Curved swap icon badge next to preview
      ctx.font = 'bold 10px Fredoka, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText('SWAP 🔄', PREVIEW_X, PREVIEW_Y + 26);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [grid, aimAngle, projectile, recoil, aimGuideActive, currentBubble, nextBubble, combo, shotsRemaining, onShotFired, onScoreAdded, onComboChanged, onRescueFree, onBoardStateChange, BUBBLE_RADIUS, LAUNCHER_X, LAUNCHER_Y, PREVIEW_X, PREVIEW_Y, PREVIEW_RADIUS]);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        className="bubble-board-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          width: 'auto',
          maxWidth: '100%',
          maxHeight: 'min(58vh, calc(100dvh - 120px))',
          aspectRatio: `${BOARD_WIDTH}/${BOARD_HEIGHT}`,
          borderRadius: '1.25rem',
          border: '3.5px solid #f59e0b',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 158, 11, 0.25), inset 0 0 15px rgba(0, 0, 0, 0.6)',
          cursor: projectile ? 'not-allowed' : 'crosshair',
          touchAction: 'none'
        }}
      />
    </div>
  );
}
