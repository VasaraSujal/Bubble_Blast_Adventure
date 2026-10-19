import React, { useState, useEffect } from 'react';
import { X, Trophy, Star, Flame, Target, Award, LogOut, CheckCircle2, History, Package, Calendar } from 'lucide-react';
import { authService } from '../../services/authService';
import { gameService } from '../../services/gameService';
import { audioManager } from '../../utils/audioManager';

export default function DashboardModal({
  isOpen,
  user,
  totalScore = 0,
  totalStars = 0,
  currentLevel = 1,
  completedLevels = [],
  bubblesPopped = 0,
  bestCombo = 0,
  rescuedObjects = 0,
  boosterInventory = { extra_shots: 3, aim_guide: 3, bomb: 2, rainbow: 2, shuffle: 3 },
  onClose,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'history' | 'inventory'
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await gameService.getHistory();
      if (history && history.length > 0) {
        setHistoryList(history);
      } else {
        // Fallback demo match history if fresh guest session
        setHistoryList([
          { levelId: 1, score: Math.max(500, totalScore), stars: 3, shotsUsed: 8, bestCombo: Math.max(2, bestCombo), completed: true, completedAt: new Date().toISOString() }
        ]);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  const playerName = user ? user.name : 'Guest Popper';
  const playerEmail = user ? user.email : 'Local Guest Account';

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
        padding: '0.75rem'
      }}
    >
      <div
        className="glass-panel responsive-modal-padding"
        style={{
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '3px solid #38bdf8',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.35)',
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
            borderRadius: '50%'
          }}
        >
          <X size={18} color="#f8fafc" />
        </button>

        {/* Player Profile Header Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.4rem',
              border: '3px solid #fcd34d',
              boxShadow: '0 8px 20px rgba(56, 189, 248, 0.5)'
            }}
          >
            🦕
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {playerName}
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {playerEmail}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }}>
              <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '0.45rem', fontWeight: 800 }}>
                LEVEL {currentLevel} UNLOCKED
              </span>
              <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Star size={13} fill="#fbbf24" /> {totalStars} Stars
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Section 61, 62, 70) */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              setActiveTab('stats');
            }}
            className={`cartoon-btn ${activeTab === 'stats' ? 'btn-cyan' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '0.75rem',
              background: activeTab === 'stats' ? undefined : '#1e293b',
              transform: 'none'
            }}
          >
            <Trophy size={14} /> Career Stats
          </button>

          <button
            onClick={() => {
              audioManager.playButtonClick();
              setActiveTab('history');
            }}
            className={`cartoon-btn ${activeTab === 'history' ? 'btn-gold' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '0.75rem',
              background: activeTab === 'history' ? undefined : '#1e293b',
              transform: 'none'
            }}
          >
            <History size={14} /> Game History
          </button>

          <button
            onClick={() => {
              audioManager.playButtonClick();
              setActiveTab('inventory');
            }}
            className={`cartoon-btn ${activeTab === 'inventory' ? 'btn-emerald' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '0.75rem',
              background: activeTab === 'inventory' ? undefined : '#1e293b',
              transform: 'none'
            }}
          >
            <Package size={14} /> Booster Vault
          </button>
        </div>

        {/* TAB 1: CAREER STATS GRID (Section 61) */}
        {activeTab === 'stats' && (
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}
            >
              <div className="glass-panel" style={{ padding: '0.9rem 0.5rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#fbbf24', marginBottom: '0.2rem' }}>
                  <Star size={22} fill="currentColor" />
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>{totalStars}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Stars</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.9rem 0.5rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#38bdf8', marginBottom: '0.2rem' }}>
                  <Trophy size={22} />
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>{totalScore.toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Score</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.9rem 0.5rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#ec4899', marginBottom: '0.2rem' }}>
                  <Flame size={22} />
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>x{bestCombo}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Best Combo</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.9rem 0.5rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#10b981', marginBottom: '0.2rem' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>{completedLevels.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Levels Completed</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.9rem 0.5rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#a855f7', marginBottom: '0.2rem' }}>
                  <Target size={22} />
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>{bubblesPopped.toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Bubbles Popped</div>
              </div>

              <div className="glass-panel" style={{ padding: '0.9rem 0.5rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.7)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: '#f97316', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🦕</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>{rescuedObjects}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Dragons Rescued</div>
              </div>
            </div>

            {/* Campaign Progress Bar */}
            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#cbd5e1', fontWeight: 700 }}>Saga Campaign Completion</span>
                <span style={{ color: '#38bdf8', fontWeight: 800 }}>{Math.floor((completedLevels.length / 40) * 100)}% (40 Levels)</span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#1e293b', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (completedLevels.length / 40) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #10b981)' }} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GAME HISTORY SESSIONS (Section 62) */}
        {activeTab === 'history' && (
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0.4rem' }}>Level</th>
                  <th style={{ padding: '0.5rem 0.4rem', textAlign: 'right' }}>Score</th>
                  <th style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>Stars</th>
                  <th style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>Shots Used</th>
                  <th style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>Best Combo</th>
                  <th style={{ padding: '0.5rem 0.4rem', textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.55rem 0.4rem', fontWeight: 700, color: '#38bdf8' }}>
                      Level {h.levelId || h.levelNumber || 1}
                    </td>
                    <td style={{ padding: '0.55rem 0.4rem', textAlign: 'right', fontWeight: 700, color: '#fbbf24' }}>
                      {(h.score || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center' }}>
                      <Star size={12} fill="#fbbf24" color="#fbbf24" style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                      {h.stars || 1}
                    </td>
                    <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center', color: '#cbd5e1' }}>
                      {h.shotsUsed || 12}
                    </td>
                    <td style={{ padding: '0.55rem 0.4rem', textAlign: 'center', color: '#ec4899', fontWeight: 700 }}>
                      x{h.bestCombo || 1}
                    </td>
                    <td style={{ padding: '0.55rem 0.4rem', textAlign: 'right', color: '#64748b', fontSize: '0.75rem' }}>
                      {new Date(h.completedAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: BOOSTER VAULT INVENTORY (Section 70) */}
        {activeTab === 'inventory' && (
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
            <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>➕</span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>Extra Shots (+5)</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Adds 5 additional shots when ammo runs out</div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '0.6rem', border: '1px solid #10b981' }}>
                x{boosterInventory.extra_shots ?? 3}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🎯</span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>Aim Guide</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Extended reflective laser trajectory</div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '0.6rem', border: '1px solid #38bdf8' }}>
                x{boosterInventory.aim_guide ?? 3}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>💣</span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>Bomb Bubble</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Explosive shockwave cluster detonation</div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '0.6rem', border: '1px solid #ef4444' }}>
                x{boosterInventory.bomb ?? 2}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🌈</span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>Rainbow Prism</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Universal wildcard matching any color</div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ec4899', background: 'rgba(236, 72, 153, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '0.6rem', border: '1px solid #ec4899' }}>
                x{boosterInventory.rainbow ?? 2}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🔀</span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>Shuffle Magic</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Re-rolls upcoming queue colors</div>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '0.6rem', border: '1px solid #f59e0b' }}>
                x{boosterInventory.shuffle ?? 3}
              </span>
            </div>
          </div>
        )}

        {/* Footer Bar */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {user ? (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                authService.logout();
                onLogout();
                onClose();
              }}
              className="cartoon-btn"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', background: '#334155', color: '#f87171' }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          ) : (
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Playing as Guest</span>
          )}

          <button
            onClick={() => {
              audioManager.playButtonClick();
              onClose();
            }}
            className="cartoon-btn btn-cyan"
            style={{ fontSize: '0.85rem', padding: '0.45rem 1.35rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
