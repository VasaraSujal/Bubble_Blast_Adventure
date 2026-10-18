import React, { useState } from 'react';
import { X, Award, CheckCircle, Lock, Trophy, Sparkles, Filter } from 'lucide-react';
import { GAME_NAME } from '../../config/gameConfig';
import { audioManager } from '../../utils/audioManager';

export const CORE_ACHIEVEMENTS = [
  { key: 'first_pop', title: 'First Pop', desc: 'Pop your very first bubble cluster.', icon: '🎈', metric: 'bubblesPopped', target: 1, reward: '+50 XP' },
  { key: 'bubble_beginner', title: 'Bubble Beginner', desc: 'Conquer 5 campaign levels successfully.', icon: '🌱', metric: 'completedLevels', target: 5, reward: '+1 Extra Shot' },
  { key: 'perfect_aim', title: 'Perfect Aim', desc: 'Complete a level with high shot conservation.', icon: '🎯', metric: 'completedLevels', target: 3, reward: '+1 Aim Guide' },
  { key: 'combo_master', title: 'Combo Master', desc: 'Achieve a blazing combo streak multiplier of x10.', icon: '🔥', metric: 'bestCombo', target: 10, reward: '+1 Bomb Bubble' },
  { key: 'bubble_hunter', title: 'Bubble Hunter', desc: 'Pop 1,000 bubbles across all campaign levels.', icon: '🏹', metric: 'bubblesPopped', target: 1000, reward: '+100 XP' },
  { key: 'rescue_hero', title: 'Rescue Hero', desc: 'Free 25 baby dragons trapped inside bubble shells.', icon: '🦕', metric: 'rescuedObjects', target: 25, reward: '+1 Rainbow Prism' },
  { key: 'star_collector', title: 'Star Collector', desc: 'Earn 50 stars by achieving three-star victories.', icon: '⭐', metric: 'totalStars', target: 50, reward: '+200 XP' },
  { key: 'booster_expert', title: 'Booster Expert', desc: 'Activate 15 tactical boosters in gameplay.', icon: '⚡', metric: 'boostersUsed', target: 15, reward: '+1 Shuffle Magic' },
  { key: 'level_master', title: 'Level Master', desc: 'Complete all 40 primary campaign levels!', icon: '🏆', metric: 'completedLevels', target: 40, reward: '👑 Grandmaster Title' },
  { key: 'bubble_legend', title: 'Bubble Legend', desc: 'Accumulate over 100,000 total career points.', icon: '👑', metric: 'totalScore', target: 100000, reward: '+500 XP' }
];

export default function AchievementsModal({
  isOpen,
  onClose,
  stats = { bubblesPopped: 0, completedLevels: 0, bestCombo: 0, rescuedObjects: 0, totalStars: 0, totalScore: 0, boostersUsed: 0 }
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unlocked' | 'in_progress'

  if (!isOpen) return null;

  // Calculate unlocked achievements
  const unlockedCount = CORE_ACHIEVEMENTS.filter(a => {
    const val = stats[a.metric] || 0;
    return val >= a.target;
  }).length;

  const filteredAchievements = CORE_ACHIEVEMENTS.filter(a => {
    const val = stats[a.metric] || 0;
    const isUnlocked = val >= a.target;
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'in_progress') return !isUnlocked;
    return true;
  });

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
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          border: '3px solid #ec4899',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(236, 72, 153, 0.35)',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ec4899, #be185d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)'
              }}
            >
              <Award size={24} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Dragon Trophies
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#f472b6', fontWeight: 600 }}>
                Unlocked: {unlockedCount} / {CORE_ACHIEVEMENTS.length} Trophies ({Math.floor((unlockedCount / CORE_ACHIEVEMENTS.length) * 100)}%)
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              audioManager.playButtonClick();
              onClose();
            }}
            className="cartoon-btn"
            style={{ padding: '0.45rem', background: '#334155', borderRadius: '50%' }}
          >
            <X size={18} color="#f8fafc" />
          </button>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              setFilter('all');
            }}
            className={`cartoon-btn ${filter === 'all' ? 'btn-purple' : ''}`}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '0.75rem',
              background: filter === 'all' ? undefined : '#1e293b',
              transform: 'none'
            }}
          >
            All ({CORE_ACHIEVEMENTS.length})
          </button>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              setFilter('unlocked');
            }}
            className={`cartoon-btn ${filter === 'unlocked' ? 'btn-emerald' : ''}`}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '0.75rem',
              background: filter === 'unlocked' ? undefined : '#1e293b',
              transform: 'none'
            }}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              setFilter('in_progress');
            }}
            className={`cartoon-btn ${filter === 'in_progress' ? 'btn-cyan' : ''}`}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '0.75rem',
              background: filter === 'in_progress' ? undefined : '#1e293b',
              transform: 'none'
            }}
          >
            In Progress ({CORE_ACHIEVEMENTS.length - unlockedCount})
          </button>
        </div>

        {/* Achievement Cards List */}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
          {filteredAchievements.map(ach => {
            const currentVal = stats[ach.metric] || 0;
            const isUnlocked = currentVal >= ach.target;
            const progressPct = Math.min(100, Math.floor((currentVal / ach.target) * 100));

            return (
              <div
                key={ach.key}
                className="glass-panel"
                style={{
                  padding: '1rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: isUnlocked
                    ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)'
                    : 'rgba(15, 23, 42, 0.75)',
                  border: isUnlocked ? '2px solid rgba(16, 185, 129, 0.5)' : '1.5px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1rem',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* 3D Icon Badge */}
                <div
                  style={{
                    fontSize: '2.4rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '1rem',
                    background: isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.4)',
                    border: isUnlocked ? '1.5px solid #34d399' : '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {ach.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: isUnlocked ? '#34d399' : '#f8fafc' }}>
                      {ach.title}
                    </strong>
                    {isUnlocked ? (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          color: '#ffffff',
                          background: '#10b981',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '0.45rem',
                          fontWeight: 800,
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <CheckCircle size={13} /> Conquered
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                        <Lock size={12} /> {currentVal.toLocaleString()} / {ach.target.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                    {ach.desc}
                  </p>

                  {/* Progress Meter Bar */}
                  <div style={{ width: '100%', height: '7px', borderRadius: '4px', background: 'rgba(51, 65, 85, 0.7)', overflow: 'hidden', position: 'relative' }}>
                    <div
                      style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        background: isUnlocked
                          ? 'linear-gradient(90deg, #34d399 0%, #10b981 100%)'
                          : 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                    <span>Reward: <strong style={{ color: '#fbbf24' }}>{ach.reward}</strong></span>
                    <span>{progressPct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
