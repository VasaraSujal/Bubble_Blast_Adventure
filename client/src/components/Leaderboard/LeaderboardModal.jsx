import React, { useEffect, useState, useMemo } from 'react';
import { X, Trophy, Medal, Star, Flame, RefreshCw, Search, Calendar, Globe } from 'lucide-react';
import { leaderboardService } from '../../services/leaderboardService';
import { GAME_NAME } from '../../config/gameConfig';
import { audioManager } from '../../utils/audioManager';

export default function LeaderboardModal({ isOpen, onClose, currentUserName, currentUserScore = 0 }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'weekly' | 'monthly'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await leaderboardService.getLeaderboard(40);
      setLeaders(data);
    } catch {
      // Fallback handled in service
    } finally {
      setLoading(false);
    }
  };

  // Simulated score variations for weekly/monthly tabs (Section 72)
  const displayLeaders = useMemo(() => {
    let list = [...leaders];
    if (activeTab === 'weekly') {
      list = list.map(l => ({
        ...l,
        score: Math.floor(l.score * 0.72)
      })).sort((a, b) => b.score - a.score);
    } else if (activeTab === 'monthly') {
      list = list.map(l => ({
        ...l,
        score: Math.floor(l.score * 0.91)
      })).sort((a, b) => b.score - a.score);
    }

    if (searchQuery.trim()) {
      list = list.filter(l =>
        (l.player || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return list;
  }, [leaders, activeTab, searchQuery]);

  // Compute player's rank
  const playerRank = useMemo(() => {
    const higherCount = displayLeaders.filter(l => l.score > currentUserScore).length;
    return higherCount + 1;
  }, [displayLeaders, currentUserScore]);

  if (!isOpen) return null;

  const top3 = displayLeaders.slice(0, 3);
  const remainingLeaders = displayLeaders.slice(3);

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
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          border: '3px solid #f59e0b',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(245, 158, 11, 0.35)',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #b45309)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)'
              }}
            >
              <Trophy size={24} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Hall of Champions
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>
                {GAME_NAME} Global Standings
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <button
              onClick={() => {
                audioManager.playButtonClick();
                fetchLeaderboard();
              }}
              disabled={loading}
              className="cartoon-btn"
              style={{ padding: '0.45rem', background: '#334155', borderRadius: '50%' }}
              title="Refresh Leaderboard"
            >
              <RefreshCw size={16} color="#f8fafc" className={loading ? 'animate-spin' : ''} />
            </button>
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
        </div>

        {/* Tab Filters (Section 72: Global, Weekly, Monthly) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => {
                audioManager.playButtonClick();
                setActiveTab('global');
              }}
              className={`cartoon-btn ${activeTab === 'global' ? 'btn-gold' : ''}`}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.82rem',
                borderRadius: '0.75rem',
                background: activeTab === 'global' ? undefined : '#1e293b',
                transform: 'none'
              }}
            >
              <Globe size={14} /> Global
            </button>

            <button
              onClick={() => {
                audioManager.playButtonClick();
                setActiveTab('weekly');
              }}
              className={`cartoon-btn ${activeTab === 'weekly' ? 'btn-cyan' : ''}`}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.82rem',
                borderRadius: '0.75rem',
                background: activeTab === 'weekly' ? undefined : '#1e293b',
                transform: 'none'
              }}
            >
              <Calendar size={14} /> Weekly
            </button>

            <button
              onClick={() => {
                audioManager.playButtonClick();
                setActiveTab('monthly');
              }}
              className={`cartoon-btn ${activeTab === 'monthly' ? 'btn-purple' : ''}`}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.82rem',
                borderRadius: '0.75rem',
                background: activeTab === 'monthly' ? undefined : '#1e293b',
                transform: 'none'
              }}
            >
              <Medal size={14} /> Monthly
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.6rem 0.4rem 2rem',
                borderRadius: '0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Top 3 Podium Visual Cards */}
        {searchQuery === '' && top3.length >= 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: '0.65rem', marginBottom: '1.25rem', alignItems: 'flex-end' }}>
            {/* Rank 2 - Silver */}
            <div
              className="glass-panel"
              style={{
                padding: '0.85rem 0.5rem',
                textAlign: 'center',
                border: '2px solid #94a3b8',
                borderRadius: '1rem',
                background: 'rgba(30, 41, 59, 0.65)'
              }}
            >
              <div style={{ fontSize: '1.6rem' }}>🥈</div>
              <strong style={{ fontSize: '0.88rem', color: '#f8fafc', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {top3[1]?.player}
              </strong>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>
                {(top3[1]?.score || 0).toLocaleString()}
              </div>
            </div>

            {/* Rank 1 - Gold */}
            <div
              className="gold-panel pulse-glow"
              style={{
                padding: '1.1rem 0.5rem',
                textAlign: 'center',
                border: '3px solid #f59e0b',
                borderRadius: '1.25rem',
                background: 'rgba(15, 23, 42, 0.95)'
              }}
            >
              <div style={{ fontSize: '2.2rem' }}>👑 🥇</div>
              <strong style={{ fontSize: '0.98rem', color: '#fcd34d', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {top3[0]?.player}
              </strong>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fbbf24' }}>
                {(top3[0]?.score || 0).toLocaleString()}
              </div>
            </div>

            {/* Rank 3 - Bronze */}
            <div
              className="glass-panel"
              style={{
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                border: '2px solid #b45309',
                borderRadius: '1rem',
                background: 'rgba(30, 41, 59, 0.65)'
              }}
            >
              <div style={{ fontSize: '1.6rem' }}>🥉</div>
              <strong style={{ fontSize: '0.88rem', color: '#f8fafc', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {top3[2]?.player}
              </strong>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>
                {(top3[2]?.score || 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Leaderboard Table (Section 71) */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem', marginBottom: '0.85rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                <th style={{ padding: '0.55rem 0.5rem' }}>Rank</th>
                <th style={{ padding: '0.55rem 0.5rem' }}>Player</th>
                <th style={{ padding: '0.55rem 0.5rem', textAlign: 'right' }}>Score</th>
                <th style={{ padding: '0.55rem 0.5rem', textAlign: 'center' }}>Stars</th>
                <th style={{ padding: '0.55rem 0.5rem', textAlign: 'center' }}>Best Combo</th>
              </tr>
            </thead>
            <tbody>
              {displayLeaders.map((entry, index) => {
                const rank = entry.rank || index + 1;
                let rankBadge = `#${rank}`;
                if (rank === 1) rankBadge = '🥇';
                else if (rank === 2) rankBadge = '🥈';
                else if (rank === 3) rankBadge = '🥉';

                return (
                  <tr
                    key={entry.id || index}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      background: rank <= 3 ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '0.55rem 0.5rem', fontWeight: 700, fontSize: rank <= 3 ? '1.1rem' : '0.85rem' }}>
                      {rankBadge}
                    </td>
                    <td style={{ padding: '0.55rem 0.5rem', fontWeight: 600, color: '#f8fafc' }}>
                      {entry.player}
                    </td>
                    <td style={{ padding: '0.55rem 0.5rem', textAlign: 'right', fontWeight: 800, color: '#fbbf24' }}>
                      {(entry.score || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', color: '#f8fafc' }}>
                      <Star size={12} fill="#fbbf24" color="#fbbf24" style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                      {entry.stars || 0}
                    </td>
                    <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', color: '#ec4899', fontWeight: 700 }}>
                      x{entry.bestCombo || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sticky "Your Standing" Footer Bar (Section 71) */}
        <div
          className="glass-panel"
          style={{
            background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(16, 185, 129, 0.2) 100%)',
            border: '2px solid #38bdf8',
            padding: '0.65rem 1.1rem',
            borderRadius: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>
              #{playerRank}
            </span>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Your Rank</span>
              <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.92rem' }}>
                {currentUserName || 'Guest Player'}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Your Score</span>
            <div style={{ fontWeight: 900, color: '#fbbf24', fontSize: '1.15rem' }}>
              {currentUserScore.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
