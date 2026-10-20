import React, { useState } from 'react';
import { Star, Lock, X, ChevronRight, Award, Compass } from 'lucide-react';
import { TOTAL_PRIMARY_LEVELS } from '../../data/levels/levelRegistry';
import { audioManager } from '../../utils/audioManager';

const CHAPTERS = [
  { id: 1, title: '🌲 Emerald Forest', levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], desc: 'Learn the basics & rescue your first dragons!' },
  { id: 2, title: '💎 Crystal Caverns', levels: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], desc: 'Denser clusters, tactical bank shots & color hunts.' },
  { id: 3, title: '🏝️ Sunken Dragon Isles', levels: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30], desc: 'High score challenges & multi-creature rescues.' },
  { id: 4, title: '🌋 Dragon Summit', levels: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], desc: 'Expert trials with tight shots and grand rewards!' },
  { id: 5, title: '🌌 Endless Realm', levels: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50], desc: 'Infinite procedural levels with evolving challenges!' }
];

export default function LevelSelectModal({
  isOpen,
  unlockedLevel = 1,
  completedLevels = [],
  onSelectLevel,
  onUnlockAll,
  onClose
}) {
  const [selectedChapter, setSelectedChapter] = useState(1);

  if (!isOpen) return null;

  // Star lookup map
  const starsMap = {};
  let totalStarsEarned = 0;
  completedLevels.forEach(lvl => {
    starsMap[lvl.levelNumber] = lvl.stars || 0;
    totalStarsEarned += lvl.stars || 0;
  });

  const currentChapterData = CHAPTERS.find(c => c.id === selectedChapter) || CHAPTERS[0];

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
        zIndex: 80,
        padding: '0.75rem'
      }}
    >
      <div
        className="glass-panel responsive-modal-padding"
        style={{
          maxWidth: '740px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '3px solid #f59e0b',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.35)',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)' }}>
              <Compass size={24} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: '#f8fafc', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Dragon Realm Map
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Star size={14} fill="#fbbf24" /> {totalStarsEarned} Stars
                </span>
                <span style={{ color: '#64748b' }}>&bull;</span>
                <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>
                  {unlockedLevel} / {TOTAL_PRIMARY_LEVELS} Unlocked
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {unlockedLevel < TOTAL_PRIMARY_LEVELS && onUnlockAll && (
              <button
                onClick={() => {
                  audioManager.playButtonClick();
                  onUnlockAll();
                }}
                className="cartoon-btn btn-cyan"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                title="Unlock all levels for quick review & testing"
              >
                🔓 Unlock All
              </button>
            )}

            <button
              onClick={() => {
                audioManager.playButtonClick();
                onClose();
              }}
              className="cartoon-btn"
              style={{
                padding: '0.45rem',
                background: '#334155',
                borderRadius: '50%',
                width: '40px',
                height: '40px'
              }}
            >
              <X size={20} color="#f8fafc" />
            </button>
          </div>
        </div>

        {/* Chapter Realm Selector Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.6rem',
            marginBottom: '1rem'
          }}
        >
          {CHAPTERS.map(ch => {
            const isSelected = ch.id === selectedChapter;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  audioManager.playButtonClick();
                  setSelectedChapter(ch.id);
                }}
                className={`cartoon-btn ${isSelected ? 'btn-gold' : ''}`}
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.88rem',
                  borderRadius: '0.85rem',
                  whiteSpace: 'nowrap',
                  background: isSelected ? undefined : 'rgba(30, 41, 59, 0.65)',
                  borderColor: isSelected ? '#fcd34d' : 'rgba(255, 255, 255, 0.1)',
                  transform: 'none'
                }}
              >
                {ch.title}
              </button>
            );
          })}
        </div>

        {/* Chapter Description Banner */}
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(56, 189, 248, 0.1) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '0.85rem',
            padding: '0.65rem 1rem',
            fontSize: '0.85rem',
            color: '#cbd5e1',
            marginBottom: '1.25rem'
          }}
        >
          <strong style={{ color: '#fbbf24' }}>{currentChapterData.title}:</strong> {currentChapterData.desc}
        </div>

        {/* Level Path Nodes (Sections 32 & 33) */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: '1.25rem',
            padding: '0.5rem 0.25rem',
            justifyItems: 'center'
          }}
        >
          {currentChapterData.levels.map(lvl => {
            const isUnlocked = lvl <= unlockedLevel;
            const isCurrent = lvl === unlockedLevel;
            const stars = starsMap[lvl] || 0;

            return (
              <div
                key={lvl}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <button
                  disabled={!isUnlocked}
                  onClick={() => {
                    audioManager.playButtonClick();
                    onSelectLevel(lvl);
                    onClose();
                  }}
                  className={`cartoon-btn ${isCurrent ? 'btn-gold pulse-glow' : (isUnlocked ? 'btn-cyan' : '')}`}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    background: isUnlocked
                      ? (isCurrent ? 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 60%, #b45309 100%)' : 'linear-gradient(135deg, #38bdf8 0%, #0284c7 60%, #0369a1 100%)')
                      : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    borderColor: isCurrent ? '#fef08a' : (isUnlocked ? '#bae6fd' : 'rgba(255, 255, 255, 0.1)'),
                    boxShadow: isCurrent
                      ? '0 8px 25px rgba(245, 158, 11, 0.7)'
                      : (isUnlocked ? '0 6px 16px rgba(56, 189, 248, 0.4)' : 'none'),
                    opacity: isUnlocked ? 1 : 0.6,
                    cursor: isUnlocked ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isUnlocked ? (
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isCurrent ? '#78350f' : '#ffffff' }}>
                      {lvl}
                    </span>
                  ) : (
                    <Lock size={22} color="#64748b" />
                  )}
                </button>

                {/* Star Rating Badge (Section 34) */}
                <div style={{ display: 'flex', gap: '2px', height: '16px', alignItems: 'center' }}>
                  {isUnlocked ? (
                    [1, 2, 3].map(s => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= stars ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)'}
                        color={s <= stars ? '#f59e0b' : 'transparent'}
                        style={{
                          filter: s <= stars ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))' : 'none'
                        }}
                      />
                    ))
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
