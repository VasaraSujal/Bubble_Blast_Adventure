import React, { useRef, useState, useEffect } from 'react';
import { Star, Settings, Volume2, VolumeX, Pause, Sparkles, Home } from 'lucide-react';

/**
 * ArcadeTopHUD
 * Authentic arcade in-game top bar inspired by reference mobile game.
 * Features:
 * - Left: Hexagonal stone emblem with Golden Dragon Key / Quest Goal
 * - Center: Trapped Baby Dragon Target + Live 3-Star Gauge Bar with Star Pins
 * - Right: Carved Stone Settings / Sound / Home buttons
 * Satisfies PDF Sections 26, 27, 34, 79, 80, 101.
 */
export default function ArcadeTopHUD({
  levelNumber = 1,
  score = 0,
  starThresholds = [500, 1000, 1500],
  objective = { type: 'rescue', target: 2, description: 'Rescue Baby Dragons' },
  rescuedCount = 0,
  combo = 0,
  soundEnabled = true,
  onToggleSound,
  onOpenSettings,
  onOpenPause,
  onOpenMap,
  onGoHome
}) {
  const [t1 = 500, t2 = 1000, t3 = 1500] = starThresholds;

  const prevRescueRef = useRef(rescuedCount);
  const [isRescuePopping, setIsRescuePopping] = useState(false);

  useEffect(() => {
    if (rescuedCount > prevRescueRef.current) {
      setIsRescuePopping(true);
      const timer = setTimeout(() => setIsRescuePopping(false), 700);
      return () => clearTimeout(timer);
    }
    prevRescueRef.current = rescuedCount;
  }, [rescuedCount]);

  // Calculate progress percentage along the 3-star bar (clamped 0 to 100%)
  const fillPct = Math.min(100, Math.max(0, (score / t3) * 100));

  const star1Unlocked = score >= t1;
  const star2Unlocked = score >= t2;
  const star3Unlocked = score >= t3;

  // Target count string (e.g. "0/2" or "1/1")
  const targetText = objective.type === 'rescue'
    ? `${rescuedCount}/${objective.target || 1}`
    : objective.type === 'score'
    ? `${score}/${objective.target || t3}`
    : `${rescuedCount}/${objective.target || 1}`;

  return (
    <div
      className="arcade-top-hud"
      style={{
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.35rem 0.6rem 0.25rem 0.6rem',
        position: 'relative',
        zIndex: 35,
        userSelect: 'none'
      }}
    >
      {/* 1. Left: Hexagonal Stone Emblem with Golden Dragon Key */}
      <div
        className="hud-hex-badge"
        onClick={() => {
          if (onOpenMap) onOpenMap();
          else if (onOpenPause) onOpenPause();
        }}
        title={`Level ${levelNumber} Quest Item: Ancient Dragon Key (Tap to open Saga Map)`}
        style={{
          width: '46px',
          height: '46px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6))'
        }}
      >
        {/* Hexagonal Stone Border & Surface via SVG */}
        <svg width="46" height="46" viewBox="0 0 46 46" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="hexStoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="hexRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="keyGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="85%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {/* Hexagon Outer Rim */}
          <polygon
            points="23,2 43,13 43,33 23,44 3,33 3,13"
            fill="url(#hexStoneGrad)"
            stroke="url(#hexRimGrad)"
            strokeWidth="2.5"
          />

          {/* Golden Dragon Key Icon with Cyan Gemstone */}
          <g transform="translate(10, 8) scale(0.65)">
            {/* Winged key handle */}
            <path
              d="M12,4 C7,4 3,8 3,14 C3,20 8,24 14,24 C17,24 19,23 21,21 L34,34 L40,34 L40,28 L36,28 L36,24 L32,24 L30,22 C32,19 33,16 33,13 C33,7 28,4 21,4 Z"
              fill="url(#keyGoldGrad)"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
            />
            {/* Key stem bit teeth */}
            <rect x="28" y="29" width="5" height="4" fill="#fbbf24" />
            <rect x="34" y="27" width="5" height="4" fill="#f59e0b" />
            {/* Embedded Cyan Crystal Gem in Key Bow */}
            <polygon points="12,10 16,14 12,18 8,14" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* 2. Center: Rescue Target + Dynamic 3-Star Score Progress Bar */}
      <div
        className="hud-center-cluster"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          flex: 1,
          justifyContent: 'center',
          maxWidth: '320px',
          margin: '0 0.5rem'
        }}
      >
        {/* Baby Dragon Rescue Target Badge */}
        <div
          id="arcade-hud-rescue-badge"
          className={isRescuePopping ? 'rescue-badge-pop' : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '2px solid rgba(34, 197, 94, 0.6)',
            borderRadius: '1.25rem',
            padding: '0.2rem 0.45rem 0.2rem 0.25rem',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.5)',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          title={objective.description}
        >
          {/* Mini Baby Dragon Icon */}
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #86efac, #22c55e 65%, #15803d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 6px rgba(34, 197, 94, 0.8)',
              border: '1.5px solid #bbf7d0',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: '13px', lineHeight: 1 }}>🐲</span>
          </div>

          {/* Rescue Target Text */}
          <span
            style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            {targetText}
          </span>
        </div>

        {/* Dynamic 3-Star Horizontal Progression Bar */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            height: '18px',
            background: 'rgba(10, 20, 36, 0.95)',
            borderRadius: '9999px',
            border: '2px solid #334155',
            boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.8), 0 3px 8px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            minWidth: '100px',
            maxWidth: '180px'
          }}
          title={`Score: ${score.toLocaleString()} (Thresholds: ${t1} / ${t2} / ${t3})`}
        >
          {/* Fluid Glowing Golden Progress Fill */}
          <div
            style={{
              width: `${fillPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 60%, #fef08a 100%)',
              borderRadius: '9999px',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.75)',
              transition: 'width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          />

          {/* Star 1 Marker Pin */}
          <div
            style={{
              position: 'absolute',
              left: `${Math.round((t1 / t3) * 100)}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            <div
              style={{
                filter: star1Unlocked
                  ? 'drop-shadow(0 0 6px #f59e0b)'
                  : 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                transform: star1Unlocked ? 'scale(1.2)' : 'scale(0.85)',
                transition: 'transform 0.25s ease'
              }}
            >
              <Star
                size={14}
                fill={star1Unlocked ? '#fbbf24' : '#475569'}
                color={star1Unlocked ? '#fef08a' : '#1e293b'}
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Star 2 Marker Pin */}
          <div
            style={{
              position: 'absolute',
              left: `${Math.round((t2 / t3) * 100)}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            <div
              style={{
                filter: star2Unlocked
                  ? 'drop-shadow(0 0 6px #f59e0b)'
                  : 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                transform: star2Unlocked ? 'scale(1.2)' : 'scale(0.85)',
                transition: 'transform 0.25s ease'
              }}
            >
              <Star
                size={14}
                fill={star2Unlocked ? '#fbbf24' : '#475569'}
                color={star2Unlocked ? '#fef08a' : '#1e293b'}
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Star 3 Marker Pin (Rightmost end) */}
          <div
            style={{
              position: 'absolute',
              right: '-4px',
              top: '50%',
              transform: 'translate(0, -50%)',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            <div
              style={{
                filter: star3Unlocked
                  ? 'drop-shadow(0 0 8px #f59e0b)'
                  : 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                transform: star3Unlocked ? 'scale(1.25)' : 'scale(0.9)',
                transition: 'transform 0.25s ease'
              }}
            >
              <Star
                size={16}
                fill={star3Unlocked ? '#fbbf24' : '#475569'}
                color={star3Unlocked ? '#fef08a' : '#1e293b'}
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right: Carved Stone Settings & Pause Controls */}
      <div
        className="hud-right-controls"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexShrink: 0
        }}
      >
        {/* Sound FX Toggle Button */}
        {onToggleSound && (
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '0.5rem',
              background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              color: soundEnabled ? '#38bdf8' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.5)'
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        )}

        {/* 3D Beveled Stone Settings / Pause Gear Button */}
        <button
          onClick={onOpenPause || onOpenSettings}
          title="Pause & Settings"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '0.65rem',
            background: 'linear-gradient(180deg, #334155 0%, #1e293b 70%, #0f172a 100%)',
            border: '2.5px solid #475569',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f8fafc',
            cursor: 'pointer',
            transition: 'transform 0.1s active'
          }}
        >
          <Settings size={20} color="#f8fafc" />
        </button>

        {/* Home Screen Button */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            title="Return to Home Screen"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '0.65rem',
              background: 'linear-gradient(180deg, #0284c7 0%, #0369a1 70%, #0c4a6e 100%)',
              border: '2.5px solid #38bdf8',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'transform 0.1s active'
            }}
          >
            <Home size={19} color="#ffffff" />
          </button>
        )}
      </div>
    </div>
  );
}
