import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Star, X, Compass, Maximize2, Minimize2 } from 'lucide-react';
import { TOTAL_PRIMARY_LEVELS, getLevelDefinition } from '../../data/levels/levelRegistry';
import { audioManager } from '../../utils/audioManager';
import StagePreviewModal from '../Modals/StagePreviewModal';
import { SAGA_SPIRAL_COORDS, generateSplinePath, getSteppingStones } from './sagaSpiralCoords';

/**
 * Floating Sky-Island Spiral Saga Map
 * Premium, realistic overworld adventure map inspired by top casual mobile games (Bubble Shooter: Dragon Pop).
 * Features:
 * - High-resolution floating sky-island archipelago (saga_map_spiral.jpg: 1376x768)
 * - 40 beautifully spaced levels in a natural spiral leading to the Golden Dragon Shrine
 * - Vector SVG rendering with zero-clipping guarantee across all screen resolutions
 * - 3D Gemstone Rune Medallions with metallic rims, milestone crowns, and star formations
 * - 3D Baby Dino mascot companion hopping along the spiral path on level advance
 * - Interactive StagePreviewModal on level click (Section 32)
 */
export default function LevelSelectModal({
  isOpen,
  unlockedLevel = 1,
  completedLevels = [],
  onSelectLevel,
  onUnlockAll,
  onClose
}) {
  const [previewLevel, setPreviewLevel] = useState(null);
  const [avatarLevel, setAvatarLevel] = useState(unlockedLevel);
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelProgress, setTravelProgress] = useState(1);
  const [isFitScreen, setIsFitScreen] = useState(true);
  const scrollContainerRef = useRef(null);

  // Star lookup map
  const starsMap = useMemo(() => {
    const map = {};
    completedLevels.forEach(lvl => {
      map[lvl.levelNumber] = lvl.stars || 0;
    });
    return map;
  }, [completedLevels]);

  const totalStarsEarned = useMemo(() => {
    return completedLevels.reduce((sum, lvl) => sum + (lvl.stars || 0), 0);
  }, [completedLevels]);

  // Gemstone Rune Themes matching vibrant fantasy aesthetic
  const RUNE_THEMES = [
    { name: 'Amber Gold', main: '#f59e0b', light: '#fef08a', dark: '#b45309', ring: '#fbbf24' },
    { name: 'Glacial Cyan', main: '#06b6d4', light: '#a5f3fc', dark: '#0e7490', ring: '#22d3ee' },
    { name: 'Sapphire Blue', main: '#3b82f6', light: '#bfdbfe', dark: '#1d4ed8', ring: '#60a5fa' },
    { name: 'Amethyst Purple', main: '#a855f7', light: '#f3e8ff', dark: '#7e22ce', ring: '#c084fc' },
    { name: 'Emerald Green', main: '#22c55e', light: '#bbf7d0', dark: '#15803d', ring: '#4ade80' },
    { name: 'Ruby Crimson', main: '#ef4444', light: '#fecaca', dark: '#b91c1c', ring: '#f87171' }
  ];

  // Full SVG path connecting all 40 levels in spiral order (in 1376x768 pixel space)
  const fullPathD = useMemo(() => generateSplinePath(SAGA_SPIRAL_COORDS, TOTAL_PRIMARY_LEVELS), []);
  // Completed portion of the path up to unlockedLevel
  const completedPathD = useMemo(() => generateSplinePath(SAGA_SPIRAL_COORDS, unlockedLevel), [unlockedLevel]);
  // Stepping stones between waypoints
  const steppingStones = useMemo(() => getSteppingStones(SAGA_SPIRAL_COORDS), []);

  // Center on active level node
  const scrollToActiveNode = (smooth = true) => {
    setTimeout(() => {
      const activeNode = document.getElementById(`saga-level-node-${unlockedLevel}`);
      if (activeNode) {
        activeNode.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'center',
          inline: 'center'
        });
      }
    }, 120);
  };

  // Traversal animation when unlocking a new level
  useEffect(() => {
    if (isOpen) {
      const storedLastLevel = parseInt(localStorage.getItem('bba_last_seen_saga_level') || '0', 10);

      if (storedLastLevel > 0 && unlockedLevel > storedLastLevel && unlockedLevel <= TOTAL_PRIMARY_LEVELS) {
        setAvatarLevel(storedLastLevel);
        setIsTraveling(true);
        setTravelProgress(0);

        let startTime = null;
        const duration = 1500;

        const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const p = Math.min(1, elapsed / duration);
          setTravelProgress(p);

          if (p < 1) {
            requestAnimationFrame(step);
          } else {
            setAvatarLevel(unlockedLevel);
            setIsTraveling(false);
            audioManager.playStarSound(3);

            confetti({
              particleCount: 55,
              spread: 65,
              origin: { y: 0.55 },
              colors: ['#fbbf24', '#38bdf8', '#4ade80', '#ffffff']
            });

            localStorage.setItem('bba_last_seen_saga_level', unlockedLevel.toString());
            scrollToActiveNode(true);
          }
        };

        const timer = setTimeout(() => {
          requestAnimationFrame(step);
        }, 300);

        return () => clearTimeout(timer);
      } else {
        setAvatarLevel(unlockedLevel);
        setIsTraveling(false);
        setTravelProgress(1);
        localStorage.setItem('bba_last_seen_saga_level', unlockedLevel.toString());
        scrollToActiveNode(false);
      }
    }
  }, [isOpen, unlockedLevel]);

  if (!isOpen) return null;

  const handleNodeClick = (lvl) => {
    audioManager.playButtonClick();
    setPreviewLevel(lvl);
  };

  const handleStartLevel = (lvl) => {
    setPreviewLevel(null);
    onSelectLevel(lvl);
    onClose();
  };

  // Coordinates for the traveling avatar in 1376x768 space
  const startPt = SAGA_SPIRAL_COORDS[avatarLevel - 1] || SAGA_SPIRAL_COORDS[0];
  const targetPt = SAGA_SPIRAL_COORDS[unlockedLevel - 1] || startPt;
  const startX = (startPt.x / 100) * 1376;
  const startY = (startPt.y / 100) * 768;
  const targetX = (targetPt.x / 100) * 1376;
  const targetY = (targetPt.y / 100) * 768;

  const avatarX = isTraveling ? startX + (targetX - startX) * travelProgress : startX;
  const avatarY = isTraveling ? startY + (targetY - startY) * travelProgress : startY;
  const avatarHop = isTraveling ? Math.sin(travelProgress * Math.PI) * 28 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        backgroundColor: '#0a192f',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      <style>{`
        @keyframes pulseRing {
          0%, 100% {
            r: 25;
            stroke-opacity: 0.9;
            stroke-width: 3.5;
          }
          50% {
            r: 29;
            stroke-opacity: 0.4;
            stroke-width: 4.5;
          }
        }
        @keyframes mascotBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shrineBeacon {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        .saga-svg-node {
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .saga-svg-node:hover {
          transform: scale(1.18);
        }
        .saga-svg-node:active {
          transform: scale(0.96);
        }
      `}</style>

      {/* 1. Aerial Sky Atmospheric Gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 20%, #1e3a8a 0%, #0c1b33 60%, #050b14 100%)',
          zIndex: 1
        }}
      />

      {/* 2. Top Header Bar */}
      <header
        style={{
          position: 'relative',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.2rem',
          background: 'linear-gradient(180deg, rgba(7, 22, 44, 0.95) 0%, rgba(7, 22, 44, 0.75) 80%, rgba(7, 22, 44, 0) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Left: Lives (5) + Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Lives Capsule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              border: '2px solid #334155',
              borderRadius: '9999px',
              padding: '0.25rem 0.7rem 0.25rem 0.4rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
              }}
            >
              <Heart size={14} fill="#ffffff" color="#ffffff" />
            </div>
            <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.95rem' }}>5</span>
          </div>

          {/* Total Stars Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              border: '2px solid #334155',
              borderRadius: '9999px',
              padding: '0.25rem 0.75rem 0.25rem 0.4rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)'
              }}
            >
              <Star size={14} fill="#ffffff" color="#ffffff" />
            </div>
            <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.95rem' }}>{totalStarsEarned}</span>
          </div>
        </div>

        {/* Center: Realm Title Banner */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#fef08a',
              letterSpacing: '0.8px',
              textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 12px rgba(245, 158, 11, 0.7)',
              fontFamily: 'Fredoka, Outfit, sans-serif'
            }}
          >
            DRAGON ISLES SAGA
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: '#93c5fd',
              fontWeight: 700,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              letterSpacing: '0.4px'
            }}
          >
            Spiral Trail to the Sacred Dragon Shrine
          </div>
        </div>

        {/* Right: View Toggle, Cheat & Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {/* Fit vs Zoom View Toggle */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              setIsFitScreen(!isFitScreen);
              if (!isFitScreen) scrollToActiveNode(true);
            }}
            title={isFitScreen ? 'Zoom In & Pan Map' : 'Fit Whole Map to Screen'}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1.5px solid #475569',
              borderRadius: '9999px',
              color: '#94a3b8',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            {isFitScreen ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            <span style={{ display: 'none', md: 'inline' }}>{isFitScreen ? 'Zoom' : 'Fit'}</span>
          </button>

          {/* Dev Cheat Button: Unlock 40 */}
          {onUnlockAll && unlockedLevel < TOTAL_PRIMARY_LEVELS && (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                onUnlockAll();
              }}
              style={{
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1.5px solid rgba(56, 189, 248, 0.6)',
                borderRadius: '9999px',
                color: '#38bdf8',
                padding: '0.35rem 0.7rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)'
              }}
            >
              Unlock 40
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onClose();
            }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
              border: '2px solid #fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* 3. SPIRAL SAGA MAP SCROLLABLE VIEWPORT */}
      <div
        ref={scrollContainerRef}
        id="saga-map-scroll-container"
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: isFitScreen ? 'center' : 'flex-start',
          justifyContent: isFitScreen ? 'center' : 'flex-start',
          padding: isFitScreen ? '0.5rem' : '2rem',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Responsive Interactive SVG Canvas */}
        <div
          id="saga-map-canvas"
          style={{
            position: 'relative',
            width: isFitScreen ? 'min(100%, calc((100vh - 75px) * 1.79))' : '1376px',
            minWidth: isFitScreen ? 'auto' : '1376px',
            aspectRatio: '1376 / 768',
            height: isFitScreen ? 'auto' : '768px',
            borderRadius: '1.2rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)',
            overflow: 'hidden',
            margin: 'auto'
          }}
        >
          <svg
            viewBox="0 0 1376 768"
            style={{
              width: '100%',
              height: '100%',
              display: 'block'
            }}
          >
            <defs>
              {/* Filter: Golden Trail Glow */}
              <filter id="goldenPathGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Filter: Node Active Halo Glow */}
              <filter id="activeHaloGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Filter: 3D Drop Shadow */}
              <filter id="medallionShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.65" />
              </filter>

              {/* Golden Path Gradient */}
              <linearGradient id="sagaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Stardust Sparkle Gradient */}
              <radialGradient id="stardustMote" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              {/* Theme Gradients for 3D Gemstones */}
              {RUNE_THEMES.map((th, i) => (
                <radialGradient key={`themeGrad-${i}`} id={`gemGrad-${i}`} cx="38%" cy="32%" r="65%">
                  <stop offset="0%" stopColor={th.light} />
                  <stop offset="55%" stopColor={th.main} />
                  <stop offset="100%" stopColor={th.dark} />
                </radialGradient>
              ))}

              {/* Locked Slate Stone Gradient */}
              <linearGradient id="lockedSlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Gloss Highlight Crescent */}
              <linearGradient id="glossHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              {/* Star Shape Symbol */}
              <g id="miniStarIcon">
                <polygon
                  points="0,-5.5 1.7,-1.8 5.7,-1.8 2.5,0.7 3.7,4.8 0,2.3 -3.7,4.8 -2.5,0.7 -5.7,-1.8 -1.7,-1.8"
                  strokeWidth="0.6"
                />
              </g>

              {/* Milestone Golden Crown Symbol */}
              <g id="milestoneCrown">
                <path
                  d="M -11,-16 L -13,-24 L -6,-19 L 0,-26 L 6,-19 L 13,-24 L 11,-16 Z"
                  fill="#fbbf24"
                  stroke="#b45309"
                  strokeWidth="1.2"
                  filter="drop-shadow(0 2px 3px rgba(0,0,0,0.7))"
                />
                <circle cx="-13" cy="-24" r="1.5" fill="#fef08a" />
                <circle cx="0" cy="-26" r="1.8" fill="#fef08a" />
                <circle cx="13" cy="-24" r="1.5" fill="#fef08a" />
              </g>
            </defs>

            {/* Background Floating Sky Island Artwork (saga_map_spiral.jpg) */}
            <image
              href="/assets/saga_map_spiral.jpg"
              x="0"
              y="0"
              width="1376"
              height="768"
              preserveAspectRatio="xMidYMid slice"
            />

            {/* Ambient Darkened Edge Vignette */}
            <rect
              width="1376"
              height="768"
              fill="none"
              stroke="rgba(10, 25, 47, 0.4)"
              strokeWidth="12"
              pointerEvents="none"
            />

            {/* 1. Underlying Base Stone Path (All 40 levels in spiral) */}
            <path
              d={fullPathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.38)"
              strokeWidth="5"
              strokeDasharray="10 8"
              strokeLinecap="round"
            />

            {/* 2. Completed / Radiant Stardust Trail (Levels 1 to Unlocked) */}
            {unlockedLevel > 1 && (
              <>
                <path
                  d={completedPathD}
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.6)"
                  strokeWidth="13"
                  filter="url(#goldenPathGlow)"
                  strokeLinecap="round"
                />
                <path
                  d={completedPathD}
                  fill="none"
                  stroke="url(#sagaGoldGrad)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* 3. Stepping Stone Pebbles Along Spiral Segments */}
            {steppingStones.map((st, idx) => {
              const isSegmentActive = st.segment < unlockedLevel;
              return (
                <g key={`step-${idx}`}>
                  {/* Pebble Shadow */}
                  <ellipse cx={st.x} cy={st.y + 3} rx="6.5" ry="3.5" fill="rgba(0, 0, 0, 0.35)" />
                  {/* Pebble Body */}
                  <circle
                    cx={st.x}
                    cy={st.y}
                    r={isSegmentActive ? 5 : 4}
                    fill={isSegmentActive ? '#fef08a' : '#cbd5e1'}
                    stroke={isSegmentActive ? '#d97706' : '#64748b'}
                    strokeWidth="1.2"
                    filter={isSegmentActive ? 'url(#goldenPathGlow)' : 'none'}
                  />
                  {/* Fairy Sparkle Mote on Completed Segments */}
                  {isSegmentActive && (
                    <circle cx={st.x} cy={st.y} r="8" fill="url(#stardustMote)" opacity="0.8" />
                  )}
                </g>
              );
            })}

            {/* 4. Level Medallions (1 through 39) */}
            {SAGA_SPIRAL_COORDS.map((node) => {
              const lvl = node.level;
              if (lvl === 40) return null; // Rendered as Grand Shrine below

              const pxX = (node.x / 100) * 1376;
              const pxY = (node.y / 100) * 768;
              const isUnlocked = lvl <= unlockedLevel;
              const isCompleted = lvl < unlockedLevel;
              const isCurrent = lvl === (isTraveling ? avatarLevel : unlockedLevel);
              const stars = starsMap[lvl] || 0;
              const themeIndex = (lvl - 1) % RUNE_THEMES.length;
              const theme = RUNE_THEMES[themeIndex];

              return (
                <g
                  key={`lvl-node-${lvl}`}
                  id={`saga-level-node-${lvl}`}
                  className="saga-svg-node"
                  transform={`translate(${pxX}, ${pxY})`}
                  style={{ transformOrigin: `${pxX}px ${pxY}px` }}
                  onClick={() => {
                    if (isUnlocked) handleNodeClick(lvl);
                  }}
                >
                  {/* Active Level Glowing Pulsing Halo */}
                  {isCurrent && (
                    <circle
                      r="26"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3.5"
                      filter="url(#activeHaloGlow)"
                      style={{ animation: 'pulseRing 1.8s infinite ease-in-out' }}
                    />
                  )}

                  {/* 3D Drop Shadow & Pedestal Base */}
                  <circle r="22" fill="rgba(0, 0, 0, 0.45)" cy="3" filter="url(#medallionShadow)" />

                  {/* Outer Beveled Ring Frame */}
                  <circle
                    r="20"
                    fill={isUnlocked ? (isCompleted ? '#fef08a' : theme.ring) : '#475569'}
                    stroke={isUnlocked ? (isCompleted ? '#b45309' : '#0f172a') : '#334155'}
                    strokeWidth="2.5"
                  />

                  {/* Inner Gemstone Disc Face */}
                  <circle
                    r="17"
                    fill={isUnlocked ? `url(#gemGrad-${themeIndex})` : 'url(#lockedSlateGrad)'}
                  />

                  {/* Gloss Highlight Crescent */}
                  <ellipse
                    cx="0"
                    cy="-6"
                    rx="12"
                    ry="6"
                    fill="url(#glossHighlight)"
                    pointerEvents="none"
                  />

                  {/* Milestone Golden Crown for Levels 5, 10, 15, 20, 25, 30, 35 */}
                  {node.isMilestone && <use href="#milestoneCrown" />}

                  {/* Level Number or Lock Icon */}
                  {isUnlocked ? (
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="14"
                      fontWeight="900"
                      fontFamily="Fredoka, Outfit, sans-serif"
                      stroke="#0f172a"
                      strokeWidth="0.8"
                      paintOrder="stroke"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                    >
                      {lvl}
                    </text>
                  ) : (
                    /* Padlock SVG graphic */
                    <g transform="translate(-6, -6)">
                      <rect x="2" y="5" width="8" height="6.5" rx="1.5" fill="#94a3b8" stroke="#334155" strokeWidth="0.8" />
                      <path d="M 3.5,5 L 3.5,3 A 2.5,2.5 0 0,1 8.5,3 L 8.5,5" fill="none" stroke="#94a3b8" strokeWidth="1.2" />
                    </g>
                  )}

                  {/* Completed Stars Arc Resting on Top/Bottom of Medallion */}
                  {isCompleted && (
                    <g transform="translate(0, 22)">
                      {/* Dark Star Plaque Pill */}
                      <rect
                        x="-19"
                        y="-6"
                        width="38"
                        height="12"
                        rx="6"
                        fill="rgba(15, 23, 42, 0.88)"
                        stroke="#fbbf24"
                        strokeWidth="0.8"
                      />
                      {/* Star 1 */}
                      <use
                        href="#miniStarIcon"
                        x="-11"
                        y="0"
                        fill={stars >= 1 ? '#fbbf24' : '#475569'}
                        stroke={stars >= 1 ? '#d97706' : '#1e293b'}
                      />
                      {/* Star 2 (Center) */}
                      <use
                        href="#miniStarIcon"
                        x="0"
                        y="-1.5"
                        fill={stars >= 2 ? '#fbbf24' : '#475569'}
                        stroke={stars >= 2 ? '#d97706' : '#1e293b'}
                      />
                      {/* Star 3 */}
                      <use
                        href="#miniStarIcon"
                        x="11"
                        y="0"
                        fill={stars >= 3 ? '#fbbf24' : '#475569'}
                        stroke={stars >= 3 ? '#d97706' : '#1e293b'}
                      />
                    </g>
                  )}
                </g>
              );
            })}

            {/* 5. Level 40: Grand Sacred Dragon Shrine Summit */}
            {(() => {
              const shrinePt = SAGA_SPIRAL_COORDS[39];
              const sx = (shrinePt.x / 100) * 1376;
              const sy = (shrinePt.y / 100) * 768;
              const isUnlocked = 40 <= unlockedLevel;
              const isCurrent = 40 === (isTraveling ? avatarLevel : unlockedLevel);
              const stars = starsMap[40] || 0;

              return (
                <g
                  id="saga-level-node-40"
                  className="saga-svg-node"
                  transform={`translate(${sx}, ${sy})`}
                  style={{ transformOrigin: `${sx}px ${sy}px` }}
                  onClick={() => {
                    if (isUnlocked) handleNodeClick(40);
                  }}
                >
                  {/* Radiant Altar Aura */}
                  <circle
                    r="42"
                    fill="url(#stardustMote)"
                    opacity="0.85"
                    style={{ animation: 'shrineBeacon 2.5s infinite ease-in-out' }}
                  />

                  {/* Active Level Glowing Halo */}
                  {isCurrent && (
                    <circle
                      r="38"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="4"
                      filter="url(#activeHaloGlow)"
                      style={{ animation: 'pulseRing 1.8s infinite ease-in-out' }}
                    />
                  )}

                  {/* Outer Golden Temple Base Disc */}
                  <circle
                    r="32"
                    fill="url(#gemGrad-0)"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    filter="url(#medallionShadow)"
                  />

                  {/* Glowing Ancient Dragon Egg in Shrine Altar */}
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="16"
                    ry="21"
                    fill="url(#gemGrad-1)"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                  {/* Egg Shell Specular Highlights */}
                  <ellipse cx="-4" cy="-7" rx="5" ry="8" fill="#ffffff" opacity="0.6" />

                  {/* Dragon Shrine Number 40 */}
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#0369a1"
                    fontSize="16"
                    fontWeight="900"
                    fontFamily="Fredoka, Outfit, sans-serif"
                    stroke="#ffffff"
                    strokeWidth="1"
                    paintOrder="stroke"
                    filter="drop-shadow(0 1px 2px rgba(255,255,255,0.8))"
                  >
                    40
                  </text>

                  {/* "DRAGON SHRINE" Title Ribbon Beneath Altar */}
                  <g transform="translate(0, 36)">
                    <rect
                      x="-48"
                      y="-9"
                      width="96"
                      height="18"
                      rx="7"
                      fill="linear-gradient(180deg, #0f172a 0%, #07162c 100%)"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 3px 6px rgba(0,0,0,0.8))"
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fef08a"
                      fontSize="9.5"
                      fontWeight="900"
                      letterSpacing="0.6"
                      fontFamily="Fredoka, Outfit, sans-serif"
                    >
                      DRAGON SHRINE
                    </text>
                  </g>

                  {/* Completed Stars on Level 40 */}
                  {stars > 0 && (
                    <g transform="translate(0, 52)">
                      <rect x="-24" y="-7" width="48" height="14" rx="7" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />
                      <use href="#miniStarIcon" x="-14" y="0" fill={stars >= 1 ? '#fbbf24' : '#475569'} stroke="#d97706" />
                      <use href="#miniStarIcon" x="0" y="-1.5" fill={stars >= 2 ? '#fbbf24' : '#475569'} stroke="#d97706" />
                      <use href="#miniStarIcon" x="14" y="0" fill={stars >= 3 ? '#fbbf24' : '#475569'} stroke="#d97706" />
                    </g>
                  )}
                </g>
              );
            })()}

            {/* 6. Dynamic 3D Baby Dino Mascot Avatar Pin */}
            <g
              transform={`translate(${avatarX}, ${avatarY - avatarHop})`}
              pointerEvents="none"
              style={{ transition: isTraveling ? 'none' : 'transform 0.3s ease' }}
            >
              <g style={{ animation: isTraveling ? 'none' : 'mascotBob 1.8s infinite ease-in-out' }}>
                {/* Speech Pointer Triangle */}
                <polygon
                  points="0,-20 -6,-30 6,-30"
                  fill="#ffffff"
                  filter="drop-shadow(0 2px 2px rgba(0,0,0,0.5))"
                />

                {/* Avatar Portrait Disc */}
                <circle
                  cx="0"
                  cy="-50"
                  r="23"
                  fill="url(#sagaGoldGrad)"
                  stroke="#ffffff"
                  strokeWidth="3"
                  filter="url(#activeHaloGlow)"
                />

                {/* Mascot Image */}
                <image
                  href="/assets/dino_mascot.png"
                  x="-20"
                  y="-70"
                  width="40"
                  height="40"
                  preserveAspectRatio="xMidYMid meet"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* 4. Bottom Quick-Action Toolbar: Locate Active Level Compass */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.2rem',
          right: '1.2rem',
          zIndex: 35
        }}
      >
        <button
          onClick={() => {
            audioManager.playButtonClick();
            scrollToActiveNode(true);
          }}
          title="Locate Current Level"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            border: '2px solid #7dd3fc',
            borderRadius: '9999px',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 6px 18px rgba(2, 132, 199, 0.6), 0 4px 10px rgba(0,0,0,0.5)',
            fontFamily: 'Fredoka, Outfit, sans-serif'
          }}
        >
          <Compass size={17} />
          <span>Level {unlockedLevel}</span>
        </button>
      </div>

      {/* 5. Stage Preview Modal on Tap (Section 32) */}
      {previewLevel && (
        <StagePreviewModal
          isOpen={!!previewLevel}
          levelNumber={previewLevel}
          levelConfig={getLevelDefinition(previewLevel)}
          stars={starsMap[previewLevel] || 0}
          onStart={() => handleStartLevel(previewLevel)}
          onClose={() => setPreviewLevel(null)}
        />
      )}
    </div>
  );
}
