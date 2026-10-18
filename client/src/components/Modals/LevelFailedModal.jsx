import React from 'react';
import { RotateCcw, PlusCircle, List, AlertTriangle } from 'lucide-react';

export default function LevelFailedModal({
  isOpen,
  levelNumber = 1,
  objectiveDescription = 'Clear all bubbles',
  hasExtraShotsBooster = true,
  onRetry,
  onUseExtraShots,
  onLevelSelect
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
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
          maxWidth: '400px',
          width: '100%',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          border: '3px solid #ef4444',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.4)'
        }}
      >
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>
          💔
        </span>
        <h2 style={{ fontSize: '2rem', color: '#f87171', marginBottom: '0.25rem' }}>
          LEVEL FAILED
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
          Out of shots on Level {levelNumber}
        </p>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '1rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
            fontSize: '0.9rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#94a3b8' }}>Shots Remaining:</span>{' '}
            <strong style={{ color: '#ef4444' }}>0</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Objective:</span>{' '}
            <strong style={{ color: '#f8fafc' }}>{objectiveDescription}</strong>
          </div>
        </div>

        {/* Buttons (Section 43) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {hasExtraShotsBooster && (
            <button
              onClick={onUseExtraShots}
              className="cartoon-btn btn-accent"
              style={{ fontSize: '1rem', padding: '0.75rem' }}
            >
              <PlusCircle size={20} /> Use Booster (+5 Shots)
            </button>
          )}

          <button
            onClick={onRetry}
            className="cartoon-btn btn-primary"
            style={{ fontSize: '1rem', padding: '0.7rem' }}
          >
            <RotateCcw size={18} /> Retry Level
          </button>

          <button
            onClick={onLevelSelect}
            className="cartoon-btn btn-secondary"
            style={{ fontSize: '0.95rem', padding: '0.65rem' }}
          >
            <List size={18} /> Level Select
          </button>
        </div>
      </div>
    </div>
  );
}
