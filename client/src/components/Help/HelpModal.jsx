import React, { useState } from 'react';
import { X, HelpCircle, Target, Zap, Flame, Sparkles, PlusCircle, Bomb, Shuffle, Compass } from 'lucide-react';
import { audioManager } from '../../utils/audioManager';
import { GAME_NAME, COMPANION_NAME } from '../../config/gameConfig';

export default function HelpModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('mechanics'); // 'mechanics' | 'boosters' | 'scoring'

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
          border: '3px solid #10b981',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(16, 185, 129, 0.35)',
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
                background: 'linear-gradient(135deg, #10b981, #047857)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
              }}
            >
              <HelpCircle size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Dragon Guide & Rules
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                {GAME_NAME} Academy
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

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              setActiveSection('mechanics');
            }}
            className={`cartoon-btn ${activeSection === 'mechanics' ? 'btn-emerald' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '0.75rem',
              background: activeSection === 'mechanics' ? undefined : '#1e293b',
              transform: 'none'
            }}
          >
            <Target size={14} /> Core Physics
          </button>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              setActiveSection('boosters');
            }}
            className={`cartoon-btn ${activeSection === 'boosters' ? 'btn-gold' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '0.75rem',
              background: activeSection === 'boosters' ? undefined : '#1e293b',
              transform: 'none'
            }}
          >
            <Zap size={14} /> Booster Guide
          </button>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              setActiveSection('scoring');
            }}
            className={`cartoon-btn ${activeSection === 'scoring' ? 'btn-cyan' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '0.75rem',
              background: activeSection === 'scoring' ? undefined : '#1e293b',
              transform: 'none'
            }}
          >
            <Flame size={14} /> Scoring & Combos
          </button>
        </div>

        {/* Tab 1: Core Physics & Mechanics */}
        {activeSection === 'mechanics' && (
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '0.25rem' }}>
            <div className="glass-panel" style={{ padding: '0.9rem', background: 'rgba(15, 23, 42, 0.7)' }}>
              <strong style={{ color: '#38bdf8', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={18} /> 1. Aiming & Bank Shots
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.35rem 0 0 0', lineHeight: 1.5 }}>
                Move your mouse (or drag your finger on mobile) to adjust the cannon's aim. The dashed laser trajectory reveals where your bubble will travel. Aim towards the left or right walls to perform <strong>bank shots</strong> that bounce around obstacles!
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '0.9rem', background: 'rgba(15, 23, 42, 0.7)' }}>
              <strong style={{ color: '#fbbf24', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={18} /> 2. Match-3 Connected Popping
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.35rem 0 0 0', lineHeight: 1.5 }}>
                When your shot bubble attaches to 2 or more connected bubbles of the same color, they immediately burst into star particles and score bonus points!
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '0.9rem', background: 'rgba(15, 23, 42, 0.7)' }}>
              <strong style={{ color: '#ec4899', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flame size={18} /> 3. Floating Drop Cascades
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.35rem 0 0 0', lineHeight: 1.5 }}>
                All bubbles must trace an unbroken connection up to the ceiling (Row 0). When you pop the supporting bubbles, all lower bubbles fall via gravity, scoring huge cascade multipliers!
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '0.9rem', background: 'rgba(15, 23, 42, 0.7)' }}>
              <strong style={{ color: '#34d399', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={18} /> 4. Rescuing Dragon Eggs
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.35rem 0 0 0', lineHeight: 1.5 }}>
                On rescue missions, baby dragons are trapped inside glowing eggs embedded in the board. Pop the adjacent bubbles or cause them to fall to free your companions!
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Booster Guide */}
        {activeSection === 'boosters' && (
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
            <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
              <span style={{ fontSize: '1.6rem' }}>➕</span>
              <div>
                <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>Extra Shots (+5)</strong>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Instantly grants 5 additional ammo shots to keep the run alive.</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
              <span style={{ fontSize: '1.6rem' }}>🎯</span>
              <div>
                <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>Aim Guide</strong>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Extends reflection laser length and highlights landing slot coordinates.</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
              <span style={{ fontSize: '1.6rem' }}>💣</span>
              <div>
                <strong style={{ color: '#f87171', fontSize: '0.95rem' }}>Bomb Bubble</strong>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Loads a heavy bomb bubble that vaporizes an entire cluster on impact.</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
              <span style={{ fontSize: '1.6rem' }}>🌈</span>
              <div>
                <strong style={{ color: '#ec4899', fontSize: '0.95rem' }}>Rainbow Prism</strong>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Wildcard bubble that matches any color it connects with.</p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
              <span style={{ fontSize: '1.6rem' }}>🔀</span>
              <div>
                <strong style={{ color: '#fbbf24', fontSize: '0.95rem' }}>Shuffle Magic</strong>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>Randomizes both the loaded bubble and upcoming queue.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Scoring & Combos */}
        {activeSection === 'scoring' && (
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '0.25rem' }}>
            <div className="glass-panel" style={{ padding: '0.85rem', background: 'rgba(15, 23, 42, 0.7)' }}>
              <strong style={{ color: '#fbbf24', fontSize: '0.95rem' }}>⭐ Point Breakdown</strong>
              <ul style={{ margin: '0.4rem 0 0 1.25rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <li>Direct Bubble Pop: <strong>+30 Points</strong> per bubble</li>
                <li>Floating Drop: <strong>+50 Points</strong> per dropped bubble</li>
                <li>Baby Dragon Rescued: <strong>+150 Points</strong></li>
                <li>Shots Remaining Bonus: <strong>+100 Points</strong> per unused shot</li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '0.85rem', background: 'rgba(15, 23, 42, 0.7)' }}>
              <strong style={{ color: '#ec4899', fontSize: '0.95rem' }}>🔥 Consecutive Combo Multipliers</strong>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.35rem 0 0 0', lineHeight: 1.5 }}>
                Popping clusters with consecutive shots builds your Combo Streak (x2, x3, x4...). Each level escalates the point value of subsequent pops and triggers special celebratory reactions from {COMPANION_NAME}!
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onClose();
            }}
            className="cartoon-btn btn-emerald"
            style={{ fontSize: '0.9rem', padding: '0.5rem 2rem' }}
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
}
