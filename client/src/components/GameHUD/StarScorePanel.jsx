import React from 'react';
import { Star, Flame, Trophy, Target, Sparkles, TrendingUp } from 'lucide-react';

/**
 * StarScorePanel
 * Right-hand column in the active arcade screen.
 * Displays dynamic 3-star score progress bar, star thresholds, live combo streak, and level stats.
 * Satisfies PDF Sections 34, 35, 36, 79.
 */
export default function StarScorePanel({
  score = 0,
  starThresholds = [500, 1000, 1500],
  combo = 0,
  bestCombo = 0,
  bubblesPopped = 0,
  rescuedCount = 0,
  objective,
  difficulty = 'easy',
  levelNumber = 1
}) {
  const [t1, t2, t3] = starThresholds;

  // Compute star progress percentage (0 - 100%)
  const maxScore = t3 * 1.1;
  const progressPct = Math.min(100, Math.floor((score / t3) * 100));

  const hasStar1 = score >= t1;
  const hasStar2 = score >= t2;
  const hasStar3 = score >= t3;

  return (
    <div
      className="game-hud-panel"
      style={{
        flexDirection: 'column',
        gap: '0.45rem',
        flexShrink: 0
      }}
    >
      {/* 1. Dynamic 3-Star Score Progress Gauge (Section 34) */}
      <div
        className="glass-panel"
        style={{
          padding: '0.65rem 0.85rem',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          borderRadius: '1rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Star Rating
          </span>
          <span style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 800 }}>
            {score.toLocaleString()} / {t3.toLocaleString()}
          </span>
        </div>

        {/* 3-Star Icons Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem', marginBottom: '0.35rem' }}>
          {/* Star 1 */}
          <div
            className={hasStar1 ? 'star-slam' : ''}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              filter: hasStar1 ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'grayscale(1) opacity(0.35)',
              transition: 'all 0.3s ease'
            }}
          >
            <Star size={20} fill={hasStar1 ? '#fbbf24' : '#334155'} color={hasStar1 ? '#f59e0b' : '#64748b'} />
            <span style={{ fontSize: '0.62rem', color: hasStar1 ? '#fbbf24' : '#64748b', fontWeight: 700, marginTop: '1px' }}>
              {t1}
            </span>
          </div>

          {/* Star 2 */}
          <div
            className={hasStar2 ? 'star-slam' : ''}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              filter: hasStar2 ? 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.8))' : 'grayscale(1) opacity(0.35)',
              transition: 'all 0.3s ease'
            }}
          >
            <Star size={22} fill={hasStar2 ? '#fbbf24' : '#334155'} color={hasStar2 ? '#f59e0b' : '#64748b'} />
            <span style={{ fontSize: '0.62rem', color: hasStar2 ? '#fbbf24' : '#64748b', fontWeight: 700, marginTop: '1px' }}>
              {t2}
            </span>
          </div>

          {/* Star 3 (Grandmaster) */}
          <div
            className={hasStar3 ? 'star-slam' : ''}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              filter: hasStar3 ? 'drop-shadow(0 0 14px rgba(251, 191, 36, 1))' : 'grayscale(1) opacity(0.35)',
              transition: 'all 0.3s ease'
            }}
          >
            <Star size={24} fill={hasStar3 ? '#fcd34d' : '#334155'} color={hasStar3 ? '#f59e0b' : '#64748b'} />
            <span style={{ fontSize: '0.62rem', color: hasStar3 ? '#fcd34d' : '#64748b', fontWeight: 700, marginTop: '1px' }}>
              {t3}
            </span>
          </div>
        </div>

        {/* The Animated Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 70%, #fef08a 100%)',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.8)',
              transition: 'width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          />
        </div>
      </div>

      {/* 2. Combo Flame & Multiplier Banner (Section 36) */}
      <div
        className="glass-panel"
        style={{
          padding: '0.55rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: combo >= 2
            ? 'linear-gradient(90deg, rgba(236, 72, 153, 0.25) 0%, rgba(245, 158, 11, 0.2) 100%)'
            : 'rgba(15, 23, 42, 0.75)',
          border: combo >= 2 ? '2px solid #ec4899' : '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div
            className={combo >= 2 ? 'pulse-glow' : ''}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: combo >= 2 ? 'linear-gradient(135deg, #ec4899, #f59e0b)' : '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem'
            }}
          >
            🔥
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              Combo Streak
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: combo >= 2 ? '#ec4899' : '#cbd5e1' }}>
              {combo >= 2 ? `x${combo} ACTIVE!` : `Best: x${bestCombo}`}
            </div>
          </div>
        </div>

        {combo >= 2 && (
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fcd34d', background: 'rgba(245, 158, 11, 0.2)', padding: '0.15rem 0.45rem', borderRadius: '0.4rem', border: '1px solid #f59e0b' }}>
            +{combo * 20} pts
          </span>
        )}
      </div>

      {/* 3. Real-Time Level Stats Matrix (Section 61, 79) */}
      <div
        className="glass-panel"
        style={{
          padding: '0.65rem 0.85rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.45rem',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1.5px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '0.85rem'
        }}
      >
        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block' }}>Bubbles Popped</span>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8' }}>
            🎯 {bubblesPopped}
          </div>
        </div>

        <div>
          <span style={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block' }}>Difficulty</span>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#34d399', textTransform: 'capitalize' }}>
            🛡️ {difficulty}
          </div>
        </div>

        {objective?.type === 'rescue' && (
          <div style={{ gridColumn: 'span 2', paddingTop: '0.2rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block' }}>Dragon Rescue Progress</span>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🦕</span> {rescuedCount} of {objective.target} Eggs Free
            </div>
          </div>
        )}
      </div>

      {/* 4. Strategic Bank Shot Tip Box (Section 14, 48) */}
      <div
        className="glass-panel"
        style={{
          padding: '0.55rem 0.75rem',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '0.85rem',
          fontSize: '0.74rem'
        }}
      >
        <div style={{ color: '#38bdf8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <span>💡</span> Tactical Tip
        </div>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.35 }}>
          Aim at side walls to bank your shots behind obstacles and drop floating clusters!
        </p>
      </div>
    </div>
  );
}
