import React, { useState, useEffect } from 'react';
import { COMPANION_NAME } from '../../config/gameConfig';
import { Flame, Sparkles, Heart } from 'lucide-react';

export default function MascotBuddy({
  reaction = 'idle', // 'idle' | 'aiming' | 'combo' | 'victory' | 'failed'
  message = null,
  comboCount = 0
}) {
  const [bubbleText, setBubbleText] = useState(message);

  useEffect(() => {
    if (message) {
      setBubbleText(message);
    } else if (reaction === 'combo' && comboCount >= 2) {
      if (comboCount === 2) setBubbleText('🔥 Great streak! Double power!');
      else if (comboCount === 3) setBubbleText('⚡ AWESOME! Fire combo blast!');
      else setBubbleText('👑 UNSTOPPABLE! You are a Dragon Master!');
    } else if (reaction === 'victory') {
      setBubbleText('🎉 YAY! We rescued our friends and conquered the level!');
    } else if (reaction === 'failed') {
      setBubbleText("Don't give up! Use a bank shot or the +5 shots booster!");
    } else {
      setBubbleText(`Ready when you are! Aim high for cascading drops!`);
    }
  }, [reaction, message, comboCount]);

  let avatarEmoji = '🦕';
  let badgeText = 'Ready';
  let badgeColor = '#10b981';

  if (reaction === 'combo') {
    avatarEmoji = '🦖';
    badgeText = `x${comboCount} Combo!`;
    badgeColor = '#f59e0b';
  } else if (reaction === 'victory') {
    avatarEmoji = '🐲';
    badgeText = 'Victory!';
    badgeColor = '#3b82f6';
  } else if (reaction === 'failed') {
    avatarEmoji = '🥺';
    badgeText = 'Try Again!';
    badgeColor = '#ef4444';
  }

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        width: '100%',
        margin: '0',
        padding: '0.45rem 0.75rem',
        border: '2px solid rgba(245, 158, 11, 0.4)',
        background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)'
      }}
    >
      {/* 3D Animated Dragon Avatar */}
      <div
        className={reaction === 'combo' ? 'pulse-glow' : 'float-wobble'}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #047857 60%, #064e3b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          border: '2.5px solid #fcd34d',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        {avatarEmoji}

        {reaction === 'combo' && (
          <span style={{ position: 'absolute', top: '-5px', right: '-5px', fontSize: '0.85rem' }}>
            🔥
          </span>
        )}
      </div>

      {/* Comic Speech Bubble */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1px' }}>
          <strong style={{ color: '#34d399', fontSize: '0.82rem', fontFamily: 'Fredoka, sans-serif' }}>
            {COMPANION_NAME}
          </strong>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.1rem 0.45rem',
              borderRadius: '0.4rem',
              background: badgeColor,
              color: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {badgeText}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#f8fafc', fontWeight: 500, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={bubbleText}>
          {bubbleText}
        </p>
      </div>
    </div>
  );
}
