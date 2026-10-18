import React, { useState } from 'react';
import { X, Settings, Volume2, VolumeX, Music, Disc, Eye, Trash2, Shield, Check } from 'lucide-react';
import { audioManager } from '../../utils/audioManager';
import { GAME_NAME } from '../../config/gameConfig';

export default function SettingsModal({
  isOpen,
  onClose,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic
}) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('bubble_blast_reduced_motion') === 'true';
  });
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const toggleReducedMotion = () => {
    audioManager.playButtonClick();
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem('bubble_blast_reduced_motion', String(next));
  };

  const handleClearCache = () => {
    audioManager.playButtonClick();
    if (window.confirm('Reset all saved game data, unlocked levels, and stats back to default?')) {
      localStorage.clear();
      setClearedNotice(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
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
          maxWidth: '520px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          border: '3px solid #38bdf8',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.35)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)'
              }}
            >
              <Settings size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Game Settings
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Preferences & Accessibility
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

        {/* Settings Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Sound FX Toggle (Section 58, 59) */}
          <div
            className="glass-panel"
            style={{
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.7)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {soundEnabled ? <Volume2 size={22} color="#38bdf8" /> : <VolumeX size={22} color="#94a3b8" />}
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>Sound Effects (SFX)</strong>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Pops, launches, collisions, and combo sounds</div>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`cartoon-btn ${soundEnabled ? 'btn-cyan' : ''}`}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                borderRadius: '0.65rem',
                background: soundEnabled ? undefined : '#334155',
                transform: 'none'
              }}
            >
              {soundEnabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* Background Music Toggle (Section 58, 59) */}
          <div
            className="glass-panel"
            style={{
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.7)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {musicEnabled ? <Music size={22} color="#ec4899" /> : <Disc size={22} color="#94a3b8" />}
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>Background Music (BGM)</strong>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Synthesized fantasy soundtrack loop</div>
              </div>
            </div>
            <button
              onClick={onToggleMusic}
              className={`cartoon-btn ${musicEnabled ? 'btn-purple' : ''}`}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                borderRadius: '0.65rem',
                background: musicEnabled ? undefined : '#334155',
                transform: 'none'
              }}
            >
              {musicEnabled ? 'PLAYING' : 'OFF'}
            </button>
          </div>

          {/* Reduced Motion Toggle (Section 89) */}
          <div
            className="glass-panel"
            style={{
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.7)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Eye size={22} color="#10b981" />
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>Reduced Motion</strong>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Minimizes screen shakes & rapid animations</div>
              </div>
            </div>
            <button
              onClick={toggleReducedMotion}
              className={`cartoon-btn ${reducedMotion ? 'btn-emerald' : ''}`}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                borderRadius: '0.65rem',
                background: reducedMotion ? undefined : '#334155',
                transform: 'none'
              }}
            >
              {reducedMotion ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Reset Save Data */}
          <div
            className="glass-panel"
            style={{
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.7)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Trash2 size={22} color="#f87171" />
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>Clear Local Data</strong>
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Reset campaign progress and inventories</div>
              </div>
            </div>
            <button
              onClick={handleClearCache}
              className="cartoon-btn btn-ruby"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.82rem',
                borderRadius: '0.65rem',
                transform: 'none'
              }}
            >
              RESET
            </button>
          </div>

          {clearedNotice && (
            <div style={{ textAlign: 'center', color: '#10b981', fontSize: '0.85rem', fontWeight: 700 }}>
              ✓ Data reset successfully. Reloading game...
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onClose();
            }}
            className="cartoon-btn btn-cyan"
            style={{ fontSize: '0.9rem', padding: '0.5rem 2rem' }}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
