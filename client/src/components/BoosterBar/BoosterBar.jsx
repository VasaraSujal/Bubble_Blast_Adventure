import React from 'react';
import { Target, Bomb, Sparkles, PlusCircle, Shuffle } from 'lucide-react';

export default function BoosterBar({
  inventory = { aim_guide: 3, bomb: 2, rainbow: 2, extra_shots: 3, shuffle: 3 },
  activeAimGuide = false,
  isShooting = false,
  isLevelOver = false,
  onUseBooster
}) {
  const boosterList = [
    {
      id: 'extra_shots',
      name: 'Extra Shots',
      icon: <PlusCircle size={22} color="#10b981" />,
      count: inventory.extra_shots || 0,
      badgeColor: '#10b981',
      tooltip: '+5 extra shots'
    },
    {
      id: 'aim_guide',
      name: 'Aim Guide',
      icon: <Target size={22} color="#38bdf8" />,
      count: inventory.aim_guide || 0,
      active: activeAimGuide,
      badgeColor: '#38bdf8',
      tooltip: 'Extends trajectory reflection path'
    },
    {
      id: 'bomb',
      name: 'Bomb Bubble',
      icon: <Bomb size={22} color="#f87171" />,
      count: inventory.bomb || 0,
      badgeColor: '#ef4444',
      tooltip: 'Area blast cluster explosion'
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: <Sparkles size={22} color="#ec4899" />,
      count: inventory.rainbow || 0,
      badgeColor: '#ec4899',
      tooltip: 'Matches any bubble color'
    },
    {
      id: 'shuffle',
      name: 'Shuffle',
      icon: <Shuffle size={22} color="#fbbf24" />,
      count: inventory.shuffle || 0,
      badgeColor: '#f59e0b',
      tooltip: 'Shuffles upcoming queue'
    }
  ];

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        gap: '0.45rem',
        padding: '0.35rem 0.65rem',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '0.35rem',
        maxWidth: '480px',
        width: '100%',
        border: '2px solid rgba(245, 158, 11, 0.35)',
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)'
      }}
    >
      {boosterList.map(b => {
        const disabled = isShooting || isLevelOver || b.count <= 0;
        return (
          <button
            key={b.id}
            onClick={() => onUseBooster(b.id)}
            disabled={disabled}
            title={`${b.name} (${b.count} left): ${b.tooltip}`}
            className="cartoon-btn"
            style={{
              flex: 1,
              padding: '0.3rem 0.2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.15rem',
              borderRadius: '0.75rem',
              background: b.active
                ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.4) 0%, rgba(180, 83, 9, 0.4) 100%)'
                : 'rgba(15, 23, 42, 0.75)',
              borderColor: b.active ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)',
              boxShadow: b.active ? '0 0 12px rgba(245, 158, 11, 0.6)' : 'none',
              transform: b.active ? 'scale(1.05)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {React.cloneElement(b.icon, { size: 18 })}
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#ffffff',
                background: b.badgeColor,
                padding: '0.05rem 0.35rem',
                borderRadius: '0.35rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                lineHeight: 1.1
              }}
            >
              {b.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
