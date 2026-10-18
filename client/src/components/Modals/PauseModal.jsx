import React from 'react';
import { Play, RotateCcw, List } from 'lucide-react';

export default function PauseModal({
  isOpen,
  levelNumber = 1,
  onResume,
  onRestart,
  onLevelSelect
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem'
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '380px',
          width: '100%',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          border: '3px solid #38bdf8'
        }}
      >
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>
          ⏸️
        </span>
        <h2 style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
          GAME PAUSED
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Level {levelNumber} is temporarily on hold
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={onResume}
            className="cartoon-btn btn-primary"
            style={{ fontSize: '1.1rem', padding: '0.75rem' }}
          >
            <Play size={20} fill="currentColor" /> Resume
          </button>

          <button
            onClick={onRestart}
            className="cartoon-btn btn-secondary"
            style={{ fontSize: '1rem', padding: '0.7rem' }}
          >
            <RotateCcw size={18} /> Restart Level
          </button>

          <button
            onClick={onLevelSelect}
            className="cartoon-btn"
            style={{
              fontSize: '0.95rem',
              padding: '0.65rem',
              background: '#334155',
              color: '#f8fafc'
            }}
          >
            <List size={18} /> Level Select
          </button>
        </div>
      </div>
    </div>
  );
}
