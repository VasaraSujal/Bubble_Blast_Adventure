import React, { useMemo } from 'react';

/**
 * Ambient floating bubble backdrop
 * Renders lightweight decorative floating bubbles to give depth and life to the fantasy realm.
 */
export default function AmbientBubbles({ count = 18 }) {
  const bubbles = useMemo(() => {
    const colors = [
      'rgba(239, 68, 68, 0.25)',   // Ruby
      'rgba(56, 189, 248, 0.25)',  // Cyan
      'rgba(16, 185, 129, 0.25)',  // Emerald
      'rgba(245, 158, 11, 0.25)',  // Gold
      'rgba(168, 85, 247, 0.25)',  // Purple
      'rgba(236, 72, 153, 0.25)'   // Magenta
    ];

    return Array.from({ length: count }, (_, i) => {
      const size = Math.floor(Math.random() * 45) + 20; // 20px - 65px
      const left = Math.floor(Math.random() * 96);       // 0% - 96%
      const duration = Math.floor(Math.random() * 14) + 12; // 12s - 26s
      const delay = (Math.random() * 12).toFixed(1);     // 0s - 12s
      const color = colors[i % colors.length];

      return { id: i, size, left, duration, delay, color };
    });
  }, [count]);

  return (
    <div className="ambient-bg-container" aria-hidden="true">
      {bubbles.map(b => (
        <div
          key={b.id}
          className="ambient-bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            background: `radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.8) 0%, ${b.color} 50%, rgba(0, 0, 0, 0.2) 100%)`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`
          }}
        />
      ))}
    </div>
  );
}
