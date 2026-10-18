import React, { useState, useEffect } from 'react';
import { X, Calendar, Flame, Trophy, Play, CheckCircle2, Sparkles, Gift, Clock, ShieldAlert } from 'lucide-react';
import { audioManager } from '../../utils/audioManager';

/**
 * DailyChallengeModal (Section 74 - Bonus Feature)
 * Date-seeded puzzle with special rewards (+500 Coins, +1 Booster)
 * and consecutive daily streak tracking.
 */
export default function DailyChallengeModal({
  isOpen,
  onClose,
  onPlayDaily,
  user
}) {
  const [streak, setStreak] = useState(1);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [todayDateStr, setTodayDateStr] = useState('');
  const [dailyDayNumber, setDailyDayNumber] = useState(284);

  useEffect(() => {
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    setTodayDateStr(dateFormatted);

    // Compute day of year for the daily puzzle # (e.g., Daily #284)
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setDailyDayNumber(dayOfYear);

    // Check localStorage for today's completion
    const savedDate = localStorage.getItem('bubble_blast_daily_last_date');
    const todayKey = today.toISOString().split('T')[0];
    const savedStreak = parseInt(localStorage.getItem('bubble_blast_daily_streak') || '1', 10);
    setStreak(savedStreak);

    if (savedDate === todayKey) {
      setIsCompletedToday(true);
    } else {
      setIsCompletedToday(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Daily puzzle preset
  const dailyConfig = {
    levelNumber: `Daily #${dailyDayNumber}`,
    difficulty: 'Special Event',
    objective: {
      type: 'rescue',
      target: 4,
      description: 'Rescue 4 enchanted baby dragons trapped in the daily vortex!'
    },
    shots: 22,
    colors: ['red', 'blue', 'purple', 'yellow'],
    targetScore: 2400,
    starThresholds: [800, 1600, 2400],
    isDaily: true,
    rewardCoins: 500,
    rewardBooster: 'Rainbow Bubble'
  };

  const handleStartDaily = () => {
    audioManager.playButtonClick();
    onClose();
    if (onPlayDaily) {
      onPlayDaily(dailyConfig);
    }
  };

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
        zIndex: 85,
        padding: '1.25rem'
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '540px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem 1.75rem',
          border: '3px solid #ec4899',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(236, 72, 153, 0.4)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            audioManager.playButtonClick();
            onClose();
          }}
          className="cartoon-btn"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            padding: '0.45rem',
            background: '#334155',
            borderRadius: '50%',
            width: '38px',
            height: '38px'
          }}
        >
          <X size={18} color="#f8fafc" />
        </button>

        {/* Header Ribbon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #be123c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(236, 72, 153, 0.6)'
            }}
          >
            <Calendar size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.65rem', color: '#f8fafc', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Daily Challenge
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ color: '#ec4899', fontSize: '0.82rem', fontWeight: 700 }}>
                Stage #{dailyDayNumber}
              </span>
              <span style={{ color: '#64748b' }}>&bull;</span>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                {todayDateStr}
              </span>
            </div>
          </div>
        </div>

        {/* Daily Streak & Reward Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1.5px solid rgba(236, 72, 153, 0.35)',
            borderRadius: '1rem',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              className="pulse-glow"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem'
              }}
            >
              🔥
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Consecutive Streak
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fcd34d' }}>
                {streak} Day{streak !== 1 ? 's' : ''} Active
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, display: 'block' }}>
              Daily Bounty
            </span>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34d399' }}>
              💰 +500 Coins
            </span>
            <span style={{ fontSize: '0.78rem', color: '#ec4899', fontWeight: 700, display: 'block' }}>
              🌈 +1 Rainbow Booster
            </span>
          </div>
        </div>

        {/* Mission Objectives Matrix (Section 74) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            borderRadius: '1rem',
            padding: '1.1rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '1.5rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.85rem'
          }}
        >
          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Target Goal</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
              🦕 Rescue 4 Dragons
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Shot Limit</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
              🎯 22 Shots
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Bubble Colors</span>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              {['#ef4444', '#38bdf8', '#a855f7', '#fbbf24'].map(c => (
                <div key={c} style={{ width: '14px', height: '14px', borderRadius: '50%', background: c, border: '1px solid #fff' }} />
              ))}
            </div>
          </div>

          <div>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>Challenge Status</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isCompletedToday ? '#34d399' : '#f59e0b', marginTop: '2px' }}>
              {isCompletedToday ? '✅ Claimed' : '⏳ Ready to Play'}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartDaily}
          className="cartoon-btn btn-ruby"
          style={{
            width: '100%',
            padding: '0.85rem',
            fontSize: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 8px 25px rgba(244, 63, 94, 0.45)'
          }}
        >
          <Play size={20} fill="currentColor" />
          {isCompletedToday ? 'REPLAY DAILY PUZZLE' : 'START DAILY CHALLENGE'}
        </button>
      </div>
    </div>
  );
}
