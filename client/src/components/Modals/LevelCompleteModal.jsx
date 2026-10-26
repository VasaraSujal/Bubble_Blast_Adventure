import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, ArrowRight, RotateCcw, List, Sparkles } from 'lucide-react';
import { audioManager } from '../../utils/audioManager';

export default function LevelCompleteModal({
  isOpen,
  levelNumber = 1,
  score = 0,
  stars = 3,
  shotsUsed = 12,
  shotsRemaining = 13,
  bubblesPopped = 28,
  bestCombo = 3,
  objective = null,
  rescuedCount = 0,
  onNextLevel,
  onReplay,
  onLevelSelect
}) {
  const [revealedStars, setRevealedStars] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setRevealedStars(0);
      setProgressWidth(0);

      // 1. Initial celebratory confetti fan
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });

      // 2. Liquid progress fill animation over 500ms
      const fillTimer = setTimeout(() => {
        setProgressWidth(Math.min(100, Math.round((stars / 3) * 100)));
      }, 250);

      // 3. Sequential 3-Star Slam reveal with impact sound & starburst
      const timers = [];
      for (let i = 1; i <= stars; i++) {
        timers.push(
          setTimeout(() => {
            setRevealedStars(i);
            audioManager.playStarSound(i);

            // Targeted confetti burst for each star slot
            confetti({
              particleCount: 22 * i,
              spread: 45 + i * 15,
              origin: { y: 0.42, x: 0.36 + (i - 1) * 0.14 },
              colors: ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff']
            });
          }, 350 + i * 380)
        );
      }

      return () => {
        clearTimeout(fillTimer);
        timers.forEach(t => clearTimeout(t));
      };
    }
  }, [isOpen, stars]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: '1.25rem'
      }}
    >
      <div
        className="stone-tablet-slab"
        style={{
          maxWidth: '440px',
          width: '100%',
          background: 'linear-gradient(180deg, #3b5278 0%, #253552 60%, #172235 100%)',
          borderRadius: '1.75rem',
          border: '4.5px solid #506990',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -6px 12px rgba(0, 0, 0, 0.6)',
          padding: '2.5rem 1.75rem 2rem 1.75rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Stone Carved Notches on Corners */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', width: '10px', height: '10px', borderLeft: '2.5px solid #6482ad', borderTop: '2.5px solid #6482ad' }} />
        <div style={{ position: 'absolute', top: '12px', right: '12px', width: '10px', height: '10px', borderRight: '2.5px solid #6482ad', borderTop: '2.5px solid #6482ad' }} />
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '10px', height: '10px', borderLeft: '2.5px solid #6482ad', borderBottom: '2.5px solid #6482ad' }} />
        <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '10px', height: '10px', borderRight: '2.5px solid #6482ad', borderBottom: '2.5px solid #6482ad' }} />

        {/* Top Ribbon Header */}
        <div
          style={{
            background: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 50%, #b91c1c 100%)',
            color: '#ffffff',
            padding: '0.5rem 2rem',
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            borderBottomLeftRadius: '1rem',
            borderBottomRightRadius: '1rem',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.5)',
            border: '2px solid #fcd34d',
            borderTop: 'none',
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '1px',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap'
          }}
        >
          🎉 LEVEL CONQUERED!
        </div>

        <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#fcd34d', margin: 0, textShadow: '0 3px 6px rgba(0,0,0,0.6)' }}>
            LEVEL {levelNumber}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.2rem 0 0.5rem 0' }}>
            Outstanding shooting! All objectives completed!
          </p>
          {objective && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(34, 197, 94, 0.18)',
                border: '1px solid rgba(34, 197, 94, 0.45)',
                color: '#86efac',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '0.75rem',
                boxShadow: '0 0 12px rgba(34, 197, 94, 0.25)'
              }}
            >
              <span>{objective.type === 'rescue' ? '🦕' : '🎯'}</span>
              <span>
                {objective.type === 'rescue'
                  ? `Goal Achieved: ${Math.max(rescuedCount || 0, objective.target)}/${objective.target} Dragons Rescued!`
                  : objective.description || 'Target Cleared!'}
              </span>
            </div>
          )}
        </div>

        {/* 3-Star Animated Reveal Container */}
        <div style={{ position: 'relative', margin: '1rem 0 0.6rem 0' }}>
          {/* Rotating ambient star rays behind 3 stars if all 3 earned */}
          {revealedStars === 3 && (
            <div
              className="star-rays"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '180px',
                height: '180px',
                margin: '-90px 0 0 -90px',
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0) 70%)',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: '1.25rem',
              height: '80px',
              position: 'relative',
              zIndex: 5
            }}
          >
            {[1, 2, 3].map(s => {
              const isEarned = s <= stars;
              const isRevealed = s <= revealedStars;
              const isMiddle = s === 2;
              const starSize = isMiddle ? 66 : 54;

              return (
                <div
                  key={s}
                  style={{
                    position: 'relative',
                    width: `${starSize}px`,
                    height: `${starSize}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: isMiddle ? '10px' : '0'
                  }}
                >
                  {/* Empty Stone Star Socket */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Star
                      size={starSize}
                      fill="#151e2d"
                      color="#243347"
                      strokeWidth={2}
                    />
                  </div>

                  {/* Golden Animated Star Slam */}
                  {isRevealed && (
                    <div
                      className="star-slam"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: 'drop-shadow(0 0 16px rgba(251, 191, 36, 0.95))'
                      }}
                    >
                      <Star
                        size={starSize}
                        fill="#fbbf24"
                        color="#ffffff"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Liquid Star Gauge Progress Bar */}
          <div
            style={{
              width: '75%',
              height: '14px',
              margin: '0.8rem auto 0 auto',
              background: 'rgba(10, 18, 30, 0.9)',
              borderRadius: '9999px',
              border: '2px solid #334a6e',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            <div
              style={{
                width: `${progressWidth}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 65%, #fef08a 100%)',
                borderRadius: '9999px',
                transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.9)'
              }}
            />
            {/* Notch markers for 1, 2, 3 stars */}
            <div style={{ position: 'absolute', left: '33.3%', top: 0, bottom: 0, width: '2px', background: '#1e293b' }} />
            <div style={{ position: 'absolute', left: '66.6%', top: 0, bottom: 0, width: '2px', background: '#1e293b' }} />
          </div>
        </div>

        {/* Performance Score Plaque */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '1.25rem',
            padding: '1.1rem 1rem',
            margin: '1.2rem 0',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            textAlign: 'left',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}
        >
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Total Score</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', textShadow: '0 0 10px rgba(251, 191, 36, 0.4)' }}>
              {score.toLocaleString()}
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Best Combo</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ec4899', textShadow: '0 0 10px rgba(236, 72, 153, 0.4)' }}>
              x{bestCombo}
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Shots Efficiency</span>
            <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>
              {shotsRemaining} left ({shotsUsed} fired)
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Bubbles Popped</span>
            <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.95rem' }}>
              {bubblesPopped} Popped
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onNextLevel();
            }}
            className="cartoon-btn"
            style={{
              width: '100%',
              padding: '0.95rem',
              background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)',
              color: '#ffffff',
              borderRadius: '1rem',
              fontWeight: 800,
              fontSize: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 6px 0 #15803d, 0 12px 20px rgba(34, 197, 94, 0.4)',
              border: '2px solid #86efac',
              cursor: 'pointer'
            }}
          >
            <span>NEXT ADVENTURE</span>
            <ArrowRight size={22} />
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => {
                audioManager.playButtonClick();
                onReplay();
              }}
              className="cartoon-btn"
              style={{
                padding: '0.75rem',
                background: 'linear-gradient(180deg, #64748b 0%, #475569 50%, #334155 100%)',
                color: '#ffffff',
                borderRadius: '0.85rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 0 #1e293b',
                border: '1.5px solid #94a3b8',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={16} />
              <span>REPLAY</span>
            </button>

            <button
              onClick={() => {
                audioManager.playButtonClick();
                onLevelSelect();
              }}
              className="cartoon-btn"
              style={{
                padding: '0.75rem',
                background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%)',
                color: '#ffffff',
                borderRadius: '0.85rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 0 #075985',
                border: '1.5px solid #7dd3fc',
                cursor: 'pointer'
              }}
            >
              <List size={16} />
              <span>SAGA MAP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
