import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Lock, X, Settings, Heart, Sparkles, Trophy } from 'lucide-react';
import { TOTAL_PRIMARY_LEVELS, getLevelDefinition } from '../../data/levels/levelRegistry';
import { audioManager } from '../../utils/audioManager';
import StagePreviewModal from '../Modals/StagePreviewModal';

/**
 * Floating Sky-Island Saga Map
 * Inspired by reference mobile game Overworld Map (Screenshot 3 & 4).
 * Features:
 * - Stunning panoramic aerial valley & winding glacial river landscape background
 * - 3D Floating Mountain Crag Island Pedestals with realistic rock facets & moss
 * - Floating stepping stone pebbles & magical fairy dust energy trails connecting islands
 * - 3D Baby Dinosaur mascot walking & hopping across stepping stones on level advancement
 * - Ancient Dragon Egg Shrine Altar at the summit
 * - Top header with Lives (❤️ 5), Stars counter, and settings
 * - Clicking an unlocked pedestal opens the Stone Tablet StagePreviewModal
 * Satisfies PDF Sections 32, 33, 34, 53, 55, 76, 101.
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
  const [travelProgress, setTravelProgress] = useState(1); // 0 to 1

  // Star lookup map
  const starsMap = {};
  let totalStarsEarned = 0;
  completedLevels.forEach(lvl => {
    starsMap[lvl.levelNumber] = lvl.stars || 0;
    totalStarsEarned += lvl.stars || 0;
  });

  // Generate levels list up to TOTAL_PRIMARY_LEVELS (40 levels)
  const levels = Array.from({ length: TOTAL_PRIMARY_LEVELS }, (_, i) => i + 1);

  // Gemstone Rune Themes matching reference game
  const RUNE_THEMES = [
    { name: 'Amber Gold', main: '#f59e0b', light: '#fef08a', dark: '#b45309', glow: '#fbbf24' },
    { name: 'Glacial Cyan', main: '#06b6d4', light: '#a5f3fc', dark: '#0e7490', glow: '#22d3ee' },
    { name: 'Sapphire Blue', main: '#3b82f6', light: '#bfdbfe', dark: '#1d4ed8', glow: '#60a5fa' },
    { name: 'Amethyst Purple', main: '#a855f7', light: '#f3e8ff', dark: '#7e22ce', glow: '#c084fc' },
    { name: 'Emerald Green', main: '#22c55e', light: '#bbf7d0', dark: '#15803d', glow: '#4ade80' },
    { name: 'Ruby Red', main: '#ef4444', light: '#fecaca', dark: '#b91c1c', glow: '#f87171' }
  ];

  // Animated progression path traversal effect when advancing levels
  useEffect(() => {
    if (isOpen) {
      const storedLastLevel = parseInt(localStorage.getItem('bba_last_seen_saga_level') || '0', 10);
      
      // If user unlocked a new level (e.g. was 1, now 2)
      if (storedLastLevel > 0 && unlockedLevel > storedLastLevel && unlockedLevel <= TOTAL_PRIMARY_LEVELS) {
        setAvatarLevel(storedLastLevel);
        setIsTraveling(true);
        setTravelProgress(0);

        let startTime = null;
        const duration = 1400; // 1.4s hop traversal across stepping stones

        const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const p = Math.min(1, elapsed / duration);
          setTravelProgress(p);

          if (p < 1) {
            requestAnimationFrame(step);
          } else {
            // Arrived at the newly unlocked level!
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
          }
        };

        const timer = setTimeout(() => {
          requestAnimationFrame(step);
        }, 350);

        return () => clearTimeout(timer);
      } else {
        setAvatarLevel(unlockedLevel);
        setIsTraveling(false);
        setTravelProgress(1);
        localStorage.setItem('bba_last_seen_saga_level', unlockedLevel.toString());
      }

      // Auto-scroll to active level node in the saga path
      setTimeout(() => {
        const activeNode = document.getElementById(`saga-level-node-${unlockedLevel}`);
        if (activeNode) {
          activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const container = document.getElementById('saga-map-scroll-container');
          if (container) container.scrollTop = container.scrollHeight;
        }
      }, 150);
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        backgroundColor: '#0c2448',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* 1. Mythical Aerial Sky-Valley & Glacial River Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/assets/saga_map_bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }}
      />

      {/* Atmospheric Cloud Mist & Soft Depth Gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(12, 36, 72, 0.45) 0%, rgba(12, 36, 72, 0.1) 40%, rgba(12, 36, 72, 0.35) 100%)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

      {/* 2. Top Header Bar (Screenshot 3 Layout) */}
      <div
        style={{
          position: 'relative',
          zIndex: 25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1rem',
          background: 'linear-gradient(180deg, rgba(7, 22, 44, 0.88) 0%, rgba(7, 22, 44, 0) 100%)',
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Left: Hearts / Lives System (❤️ 5) + Stars Earned */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Hearts Capsule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              border: '2px solid #334155',
              borderRadius: '9999px',
              padding: '0.25rem 0.65rem 0.25rem 0.35rem',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
              }}
            >
              <Heart size={14} fill="#ffffff" color="#ffffff" />
            </div>
            <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.9rem' }}>5</span>
          </div>

          {/* Total Stars Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              border: '2px solid #334155',
              borderRadius: '9999px',
              padding: '0.25rem 0.65rem 0.25rem 0.35rem',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)'
              }}
            >
              <Star size={14} fill="#ffffff" color="#ffffff" />
            </div>
            <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.9rem' }}>{totalStarsEarned}</span>
          </div>
        </div>

        {/* Center: Realm Title */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 900,
              color: '#fef08a',
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(245, 158, 11, 0.5)'
            }}
          >
            DRAGON ISLES SAGA
          </div>
          <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            Levels 1 - 40
          </div>
        </div>

        {/* Right: Controls (Unlock All dev cheat + Close button) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onUnlockAll && unlockedLevel < TOTAL_PRIMARY_LEVELS && (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                onUnlockAll();
              }}
              style={{
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '9999px',
                color: '#38bdf8',
                padding: '0.2rem 0.55rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Unlock 40
            </button>
          )}

          <button
            onClick={() => {
              audioManager.playButtonClick();
              onClose();
            }}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
              border: '2px solid #fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)'
            }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 3. Scrollable Saga Map Winding Island Road */}
      <div
        id="saga-map-scroll-container"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 10,
          padding: '2rem 1rem 5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* Top Summit Shrine (Level 40 Dragon Altar Goal from Screenshot 4) */}
          <div
            style={{
              width: '300px',
              height: '160px',
              position: 'relative',
              marginBottom: '3rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Ancient Sky-Altar 3D Floating Island Artwork */}
            <svg width="300" height="160" viewBox="0 0 300 160" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <linearGradient id="shrineCrag" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9a5d30" />
                  <stop offset="45%" stopColor="#693716" />
                  <stop offset="100%" stopColor="#2a1204" />
                </linearGradient>
                <linearGradient id="shrineGrass" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="40%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
              </defs>

              {/* Island Spire Base Crag */}
              <polygon points="30,85 270,85 210,145 150,158 90,145" fill="url(#shrineCrag)" filter="drop-shadow(0 15px 20px rgba(0,0,0,0.6))" />
              {/* Craggy facets */}
              <polygon points="150,85 270,85 210,145 150,158" fill="rgba(0,0,0,0.22)" />
              <polygon points="30,85 150,85 150,158 90,145" fill="rgba(255,255,255,0.08)" />

              {/* Island Grassy Plateau */}
              <ellipse cx="150" cy="85" rx="120" ry="32" fill="url(#shrineGrass)" stroke="#166534" strokeWidth="2" />
              {/* Stone temple ring */}
              <ellipse cx="150" cy="82" rx="90" ry="24" fill="#334155" stroke="#64748b" strokeWidth="2" />
              <ellipse cx="150" cy="80" rx="35" ry="14" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />

              {/* Golden Dragon Totem Pillars */}
              <g transform="translate(210, 40) scale(0.7)">
                <rect x="0" y="10" width="22" height="42" fill="#cbd5e1" rx="4" />
                <polygon points="11,0 24,12 -2,12" fill="#fbbf24" stroke="#d97706" />
                <ellipse cx="11" cy="24" rx="4" ry="4" fill="#38bdf8" />
              </g>

              <g transform="translate(68, 40) scale(0.7)">
                <rect x="0" y="10" width="22" height="42" fill="#cbd5e1" rx="4" />
                <polygon points="11,0 24,12 -2,12" fill="#fbbf24" stroke="#d97706" />
                <ellipse cx="11" cy="24" rx="4" ry="4" fill="#38bdf8" />
              </g>

              {/* The Sacred Glowing Dragon Egg */}
              <g transform="translate(135, 36)">
                <ellipse cx="15" cy="24" rx="16" ry="22" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" filter="drop-shadow(0 0 14px rgba(56, 189, 248, 0.9))" />
                <ellipse cx="15" cy="26" rx="6" ry="5" fill="#38bdf8" />
                <ellipse cx="11" cy="20" rx="2.5" ry="2.5" fill="#38bdf8" />
                <ellipse cx="15" cy="18" rx="2.5" ry="2.5" fill="#38bdf8" />
                <ellipse cx="19" cy="20" rx="2.5" ry="2.5" fill="#38bdf8" />
              </g>

              {/* Floating Golden Quest Keys */}
              <g transform="translate(90, 95) rotate(-22) scale(0.75)">
                <polygon points="12,4 20,12 12,20 4,12" fill="#fbbf24" filter="drop-shadow(0 0 10px #f59e0b)" />
                <rect x="18" y="10" width="18" height="4" fill="#f59e0b" />
                <rect x="30" y="14" width="4" height="4" fill="#f59e0b" />
              </g>

              <g transform="translate(180, 95) rotate(22) scale(0.75)">
                <polygon points="12,4 20,12 12,20 4,12" fill="#fbbf24" filter="drop-shadow(0 0 10px #f59e0b)" />
                <rect x="18" y="10" width="18" height="4" fill="#f59e0b" />
                <rect x="30" y="14" width="4" height="4" fill="#f59e0b" />
              </g>
            </svg>

            <span
              style={{
                position: 'absolute',
                bottom: '8px',
                color: '#fef08a',
                fontWeight: 900,
                fontSize: '0.85rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(245, 158, 11, 0.7)',
                letterSpacing: '0.8px'
              }}
            >
              DRAGON SHRINE SUMMIT
            </span>
          </div>

          {/* Stepping Stones Path leading down from Level 40 down to Level 1 */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column-reverse',
              alignItems: 'center',
              gap: '2.8rem',
              position: 'relative'
            }}
          >
            {levels.map((lvl) => {
              const isUnlocked = lvl <= unlockedLevel;
              const isCurrent = lvl === (isTraveling ? avatarLevel : unlockedLevel);
              const stars = starsMap[lvl] || 0;

              // Sinusoidal winding path X-offset (-75px to +75px)
              const xOffset = Math.sin(lvl * 1.1) * 75;
              const nextXOffset = lvl < TOTAL_PRIMARY_LEVELS ? Math.sin((lvl + 1) * 1.1) * 75 : 0;
              const dx = nextXOffset - xOffset;
              const theme = RUNE_THEMES[(lvl - 1) % RUNE_THEMES.length];

              // Bezier intermediate coordinates for 3 floating stepping pebbles
              const p1x = 0.156 * dx;
              const p1y = -30;
              const p2x = 0.5 * dx;
              const p2y = -52;
              const p3x = 0.844 * dx;
              const p3y = -74;

              return (
                <div
                  key={lvl}
                  id={`saga-level-node-${lvl}`}
                  style={{
                    transform: `translateX(${xOffset}px)`,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    transition: 'transform 0.2s ease',
                    zIndex: 5
                  }}
                  onClick={() => {
                    if (isUnlocked) handleNodeClick(lvl);
                  }}
                >
                  {/* Floating Stepping Stones & Fairy Dust Energy Trail connecting to level above */}
                  {lvl < TOTAL_PRIMARY_LEVELS && (
                    <svg
                      style={{
                        position: 'absolute',
                        top: '25px', // center of this pedestal rune disc
                        left: '42px', // center of this pedestal (width 84 / 2)
                        overflow: 'visible',
                        pointerEvents: 'none',
                        zIndex: -1
                      }}
                    >
                      {/* Shimmering Starlight Fairy Dust Thread */}
                      <path
                        d={`M 0 0 C 0 -52, ${dx} -52, ${dx} -105`}
                        fill="none"
                        stroke={lvl < unlockedLevel ? 'rgba(251, 191, 36, 0.45)' : 'rgba(255, 255, 255, 0.18)'}
                        strokeWidth="2.5"
                        strokeDasharray={lvl < unlockedLevel ? '4 5' : '3 6'}
                        className={lvl < unlockedLevel ? 'saga-path-active' : ''}
                        filter={lvl < unlockedLevel ? 'drop-shadow(0 0 6px #fbbf24)' : 'none'}
                      />

                      {/* Floating Stepping Pebble 1 (at t = 0.25) */}
                      <g transform={`translate(${p1x}, ${p1y})`}>
                        <ellipse cx="0" cy="3" rx="7" ry="3" fill="rgba(2, 6, 23, 0.35)" filter="blur(2px)" />
                        <ellipse cx="0" cy="1" rx="6.5" ry="4.5" fill="#784724" />
                        <ellipse cx="0" cy="0" rx="6" ry="3.8" fill={lvl < unlockedLevel ? '#4ade80' : '#475569'} stroke="#22c55e" strokeWidth="0.8" />
                        {lvl < unlockedLevel && (
                          <circle cx="0" cy="0" r="1.5" fill="#fef08a" filter="drop-shadow(0 0 3px #fbbf24)" />
                        )}
                      </g>

                      {/* Floating Stepping Pebble 2 (at t = 0.50) */}
                      <g transform={`translate(${p2x}, ${p2y})`}>
                        <ellipse cx="0" cy="3" rx="8" ry="3.5" fill="rgba(2, 6, 23, 0.35)" filter="blur(2px)" />
                        <ellipse cx="0" cy="1" rx="7.5" ry="5" fill="#693716" />
                        <ellipse cx="0" cy="0" rx="7" ry="4" fill={lvl < unlockedLevel ? '#22c55e' : '#334155'} stroke="#16a34a" strokeWidth="0.8" />
                        {lvl < unlockedLevel && (
                          <circle cx="0" cy="0" r="1.8" fill="#fef08a" filter="drop-shadow(0 0 4px #fbbf24)" />
                        )}
                      </g>

                      {/* Floating Stepping Pebble 3 (at t = 0.75) */}
                      <g transform={`translate(${p3x}, ${p3y})`}>
                        <ellipse cx="0" cy="3" rx="7" ry="3" fill="rgba(2, 6, 23, 0.35)" filter="blur(2px)" />
                        <ellipse cx="0" cy="1" rx="6.5" ry="4.5" fill="#784724" />
                        <ellipse cx="0" cy="0" rx="6" ry="3.8" fill={lvl < unlockedLevel ? '#4ade80' : '#475569'} stroke="#22c55e" strokeWidth="0.8" />
                        {lvl < unlockedLevel && (
                          <circle cx="0" cy="0" r="1.5" fill="#fef08a" filter="drop-shadow(0 0 3px #fbbf24)" />
                        )}
                      </g>
                    </svg>
                  )}

                  {/* Player Mascot 3D Avatar Pin standing on active level! */}
                  {isCurrent && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-54px',
                        zIndex: 15,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        animation: isTraveling ? 'none' : 'bounceGuide 1.8s ease-in-out infinite',
                        transform: isTraveling
                          ? `translate(${travelProgress * dx}px, ${-travelProgress * 105 - Math.abs(Math.sin(travelProgress * Math.PI * 3)) * 18}px)`
                          : 'none',
                        transition: isTraveling ? 'none' : 'transform 0.3s ease'
                      }}
                    >
                      {/* Avatar Pin Card with Glowing Gold Border */}
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
                          borderRadius: '0.75rem',
                          border: '2.5px solid #ffffff',
                          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.6), 0 0 14px rgba(245, 158, 11, 0.85)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <img
                          src="/assets/dino_mascot.png"
                          alt="Baby Dino"
                          style={{
                            width: '42px',
                            height: '42px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
                          }}
                        />
                      </div>
                      {/* Downward triangle pin pointer */}
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: '7px solid transparent',
                          borderRight: '7px solid transparent',
                          borderTop: '9px solid #ffffff',
                          marginTop: '-1px'
                        }}
                      />
                    </div>
                  )}

                  {/* 3 Golden Stars Hovering over Completed Pedestal */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      position: 'absolute',
                      top: '-20px',
                      zIndex: 8
                    }}
                  >
                    {[1, 2, 3].map((starNum) => (
                      <Star
                        key={starNum}
                        size={16}
                        fill={stars >= starNum ? '#fbbf24' : '#334155'}
                        color={stars >= starNum ? '#fef08a' : '#1e293b'}
                        strokeWidth={1.5}
                        style={{
                          filter: stars >= starNum ? 'drop-shadow(0 0 5px #f59e0b)' : 'none',
                          transform: starNum === 2 ? 'translateY(-2px)' : 'none'
                        }}
                      />
                    ))}
                  </div>

                  {/* The 3D Floating Mountain Crag Island Pedestal (Screenshot 4 Layout) */}
                  <div
                    className={isCurrent && !isTraveling ? 'pulse-glow' : ''}
                    style={{
                      width: '84px',
                      height: '76px',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: 'drop-shadow(0 12px 14px rgba(0, 0, 0, 0.65))'
                    }}
                  >
                    <svg width="84" height="76" viewBox="0 0 84 76">
                      <defs>
                        {/* Shaded Earthen Mountain Crag Gradients */}
                        <linearGradient id={`cragLeft_${lvl}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#b47b42" />
                          <stop offset="70%" stopColor="#8d5727" />
                          <stop offset="100%" stopColor="#5c3413" />
                        </linearGradient>
                        <linearGradient id={`cragRight_${lvl}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#693716" />
                          <stop offset="60%" stopColor="#432109" />
                          <stop offset="100%" stopColor="#251003" />
                        </linearGradient>
                        {/* Colored Gemstone Rune Disc Gradient */}
                        <radialGradient id={`runeDisc_${lvl}`} cx="40%" cy="35%" r="65%">
                          <stop offset="0%" stopColor={isUnlocked ? theme.light : '#64748b'} />
                          <stop offset="60%" stopColor={isUnlocked ? theme.main : '#334155'} />
                          <stop offset="100%" stopColor={isUnlocked ? theme.dark : '#1e293b'} />
                        </radialGradient>
                      </defs>

                      {/* 1. Soft Island Drop Shadow */}
                      <ellipse cx="42" cy="73" rx="24" ry="3.5" fill="rgba(0,0,0,0.4)" filter="blur(2px)" />

                      {/* 2. 3D Floating Rock Spire Crags */}
                      {/* Left Sunlit Rock Facet */}
                      <polygon points="10,28 42,28 42,70 20,52" fill={`url(#cragLeft_${lvl})`} />
                      {/* Right Shaded Rock Facet */}
                      <polygon points="42,28 74,28 64,52 42,70" fill={`url(#cragRight_${lvl})`} />
                      {/* Center Rock Ridge Shading */}
                      <polygon points="36,28 46,28 44,68 40,68" fill="rgba(0,0,0,0.2)" />

                      {/* 3. Carved Stone / Sandstone Plateau Rim */}
                      <ellipse cx="42" cy="28" rx="36" ry="16" fill="#8c5828" stroke="#4a2608" strokeWidth="1.5" />
                      {/* Grassy / Sandstone Collar */}
                      <ellipse cx="42" cy="27" rx="34" ry="14" fill="#a16833" />
                      <ellipse cx="42" cy="25" rx="31" ry="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />

                      {/* 4. Raised Gemstone Rune Medallion Disc */}
                      <ellipse cx="42" cy="24" rx="26" ry="11" fill={`url(#runeDisc_${lvl})`} stroke="#ffffff" strokeWidth={isCurrent ? '2.5' : '1.5'} />
                      {/* Inner 3D Glass Bevel Ring */}
                      <ellipse cx="42" cy="23" rx="22" ry="9" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.2" />

                      {/* Embossed Dragon Paw Stamp Mark */}
                      {isUnlocked && (
                        <g transform="translate(42, 23) scale(0.65)" opacity="0.38">
                          <ellipse cx="0" cy="4" rx="7" ry="5" fill="#ffffff" />
                          <circle cx="-5" cy="-4" r="2.5" fill="#ffffff" />
                          <circle cx="0" cy="-6" r="2.8" fill="#ffffff" />
                          <circle cx="5" cy="-4" r="2.5" fill="#ffffff" />
                        </g>
                      )}
                    </svg>

                    {/* Pedestal Level Number or Lock Icon */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}
                    >
                      {isUnlocked ? (
                        <span
                          style={{
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: '1.3rem',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.7)',
                            fontFamily: 'Fredoka, Outfit, sans-serif'
                          }}
                        >
                          {lvl}
                        </span>
                      ) : (
                        <Lock size={19} color="#94a3b8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Stage Preview Modal on Tap (Section 32) */}
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
