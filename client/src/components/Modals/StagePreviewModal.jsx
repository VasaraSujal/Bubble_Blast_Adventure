import React from 'react';
import { Star, X, Play } from 'lucide-react';
import { audioManager } from '../../utils/audioManager';

/**
 * StagePreviewModal
 * Carved Fantasy Stone Tablet Stage Popup matching reference game screenshot 2.
 * Features:
 * - Stone slab frame with carved rune cracks & bevels
 * - Level number badge at top
 * - 3 stars awaiting completion (or showing earned stars)
 * - Large circular medallion displaying level quest objective / Golden Dragon Key
 * - Chunky emerald gemstone "Play" button with shine & finger tap animation
 * Satisfies PDF Sections 32, 33, 34, 101.
 */
export default function StagePreviewModal({
  isOpen,
  levelNumber = 1,
  starsEarned = 0,
  objective = { type: 'rescue', target: 2, description: 'Rescue 2 Baby Dragons' },
  onPlay,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: '1rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Carved Stone Tablet Slab */}
      <div
        className="stone-tablet-slab"
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'linear-gradient(180deg, #3b5278 0%, #253552 60%, #172235 100%)',
          borderRadius: '1.75rem',
          border: '4.5px solid #506990',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -6px 12px rgba(0, 0, 0, 0.6)',
          position: 'relative',
          padding: '1.75rem 1.5rem 1.75rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          userSelect: 'none'
        }}
      >
        {/* Stone Carved Notches on Slab Corners */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', width: '12px', height: '12px', borderLeft: '3px solid #6482ad', borderTop: '3px solid #6482ad' }} />
        <div style={{ position: 'absolute', top: '16px', right: '16px', width: '12px', height: '12px', borderRight: '3px solid #6482ad', borderTop: '3px solid #6482ad' }} />
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '12px', height: '12px', borderLeft: '3px solid #6482ad', borderBottom: '3px solid #6482ad' }} />
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '12px', height: '12px', borderRight: '3px solid #6482ad', borderBottom: '3px solid #6482ad' }} />

        {/* Wooden / Stone 'X' Close Button */}
        <button
          onClick={() => {
            audioManager.playButtonClick();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            background: 'linear-gradient(180deg, #ea580c 0%, #c2410c 100%)',
            border: '2.5px solid #f97316',
            borderRadius: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.4)'
          }}
        >
          <X size={18} strokeWidth={3} />
        </button>

        {/* Level Number Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '-0.35rem' }}>
          <span
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              color: '#facc15',
              fontFamily: 'Fredoka, sans-serif',
              textShadow: '0 3px 0 #854d0e, 0 6px 12px rgba(0, 0, 0, 0.8)',
              letterSpacing: '1px'
            }}
          >
            {levelNumber}
          </span>
        </div>

        {/* 3 Stars Progression Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '-0.5rem'
          }}
        >
          {/* Star 1 */}
          <div style={{ transform: 'rotate(-10deg)', filter: starsEarned >= 1 ? 'drop-shadow(0 0 10px #f59e0b)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
            <Star
              size={36}
              fill={starsEarned >= 1 ? '#fbbf24' : '#64748b'}
              color={starsEarned >= 1 ? '#fef08a' : '#334155'}
              strokeWidth={2}
            />
          </div>

          {/* Star 2 (Slightly larger, center) */}
          <div style={{ transform: 'translateY(-6px)', filter: starsEarned >= 2 ? 'drop-shadow(0 0 12px #f59e0b)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
            <Star
              size={44}
              fill={starsEarned >= 2 ? '#fbbf24' : '#64748b'}
              color={starsEarned >= 2 ? '#fef08a' : '#334155'}
              strokeWidth={2}
            />
          </div>

          {/* Star 3 */}
          <div style={{ transform: 'rotate(10deg)', filter: starsEarned >= 3 ? 'drop-shadow(0 0 10px #f59e0b)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
            <Star
              size={36}
              fill={starsEarned >= 3 ? '#fbbf24' : '#64748b'}
              color={starsEarned >= 3 ? '#fef08a' : '#334155'}
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Large Central Medallion: Level Objective / Golden Dragon Key */}
        <div
          style={{
            width: '135px',
            height: '135px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #1e293b, #0f172a 70%, #020617)',
            border: '4px solid #475569',
            boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.9), 0 8px 24px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            margin: '0.4rem 0'
          }}
        >
          {/* Subtle sunray shine behind key */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          {/* Golden Winged Dragon Key with Amethyst Gemstone */}
          <svg width="90" height="90" viewBox="0 0 90 90">
            <defs>
              <linearGradient id="modalKeyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#fbbf24" />
                <stop offset="75%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id="purpleGem" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="45%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#86198f" />
              </linearGradient>
            </defs>

            {/* Winged key handle */}
            <g transform="translate(14, 12) rotate(45, 30, 30)">
              {/* Dragon Horns on Key Bow */}
              <path
                d="M10,8 C4,2 1,12 8,18 C14,24 22,24 28,18 C35,12 32,2 26,8 Z"
                fill="url(#modalKeyGold)"
                filter="drop-shadow(0 2px 5px rgba(0,0,0,0.6))"
              />
              {/* Amethyst Gemstone in Bow Center */}
              <polygon points="18,6 24,12 18,18 12,12" fill="url(#purpleGem)" stroke="#fef08a" strokeWidth="1.2" />

              {/* Key Shaft */}
              <rect x="16" y="24" width="6" height="34" rx="2" fill="url(#modalKeyGold)" />
              {/* Key Teeth */}
              <rect x="22" y="44" width="7" height="4" fill="#fbbf24" />
              <rect x="22" y="51" width="9" height="5" fill="#f59e0b" />
            </g>
          </svg>
        </div>

        {/* Objective Description text */}
        <div
          style={{
            fontSize: '0.86rem',
            color: '#cbd5e1',
            fontWeight: 700,
            textAlign: 'center',
            maxWidth: '260px',
            lineHeight: 1.3
          }}
        >
          {objective.description || 'Clear the level and earn golden keys!'}
        </div>

        {/* Chunky Emerald Gemstone "PLAY" Button */}
        <button
          onClick={() => {
            audioManager.playButtonClick();
            onPlay();
          }}
          className="emerald-gem-play-btn"
          style={{
            width: '100%',
            maxWidth: '250px',
            height: '62px',
            borderRadius: '1.25rem',
            background: 'linear-gradient(180deg, #34d399 0%, #10b981 40%, #059669 80%, #047857 100%)',
            border: '3.5px solid #6ee7b7',
            boxShadow: '0 8px 22px rgba(16, 185, 129, 0.6), inset 0 3px 6px rgba(255, 255, 255, 0.5), inset 0 -4px 8px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative',
            marginTop: '0.35rem'
          }}
        >
          {/* Beveled Play Icon Arrow */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            <Play size={20} fill="#ffffff" color="#ffffff" style={{ marginLeft: '3px' }} />
          </div>

          <span
            style={{
              fontSize: '1.45rem',
              fontWeight: 900,
              fontFamily: 'Fredoka, sans-serif',
              letterSpacing: '1px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)'
            }}
          >
            PLAY
          </span>

          {/* Animated Pointing Finger Guide (Reference game inspired) */}
          <div
            style={{
              position: 'absolute',
              right: '-18px',
              bottom: '-14px',
              fontSize: '28px',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
              animation: 'bounceGuide 1.5s ease-in-out infinite'
            }}
          >
            👆
          </div>
        </button>
      </div>
    </div>
  );
}
