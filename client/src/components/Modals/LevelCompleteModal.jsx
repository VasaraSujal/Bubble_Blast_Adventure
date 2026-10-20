import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (isOpen) {
      // Commercial celebration confetti cannon
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Sequential star twinkles
      for (let i = 1; i <= stars; i++) {
        setTimeout(() => {
          audioManager.playStarSound(i);
        }, i * 250);
      }
    }
  }, [isOpen, stars]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.9)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: '1.25rem'
      }}
    >
      <div
        className="gold-panel"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem 1.75rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
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

        {/* 3-Star Animated Reveal (Section 34) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.9rem', marginBottom: '1.5rem' }}>
          {[1, 2, 3].map(s => {
            const isEarned = s <= stars;
            return (
              <div
                key={s}
                className={isEarned ? 'star-slam' : ''}
                style={{
                  animationDelay: `${s * 200}ms`,
                  filter: isEarned ? 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.8))' : 'none'
                }}
              >
                <Star
                  size={52}
                  fill={isEarned ? '#fbbf24' : '#1e293b'}
                  color={isEarned ? '#f59e0b' : '#334155'}
                  strokeWidth={2}
                />
              </div>
            );
          })}
        </div>

        {/* Performance Score Plaque (Section 42) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: '1.25rem',
            padding: '1.25rem 1rem',
            marginBottom: '1.75rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.9rem',
            textAlign: 'left',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}
        >
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Total Score</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', textShadow: '0 0 10px rgba(251, 191, 36, 0.4)' }}>
              {score.toLocaleString()}
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Best Combo</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ec4899', textShadow: '0 0 10px rgba(236, 72, 153, 0.4)' }}>
              x{bestCombo}
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Shots Efficiency</span>
            <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '1rem' }}>
              {shotsRemaining} left ({shotsUsed} fired)
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Bubbles Popped</span>
            <div style={{ color: '#34d399', fontWeight: 700, fontSize: '1rem' }}>
              {bubblesPopped} Popped
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onNextLevel();
            }}
            className="cartoon-btn btn-gold"
            style={{
              fontSize: '1.2rem',
              padding: '0.85rem',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {typeof levelNumber === 'string' && levelNumber.startsWith('Daily') ? (
              <>CLAIM DAILY REWARDS <Sparkles size={22} /></>
            ) : (
              <>NEXT LEVEL <ArrowRight size={22} /></>
            )}
          </button>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => {
                audioManager.playButtonClick();
                onReplay();
              }}
              className="cartoon-btn btn-cyan"
              style={{ flex: 1, fontSize: '0.95rem', padding: '0.65rem' }}
            >
              <RotateCcw size={16} /> Replay
            </button>

            <button
              onClick={() => {
                audioManager.playButtonClick();
                onLevelSelect();
              }}
              className="cartoon-btn"
              style={{
                flex: 1,
                fontSize: '0.95rem',
                padding: '0.65rem',
                background: '#334155',
                color: '#f8fafc'
              }}
            >
              <List size={16} /> Levels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
