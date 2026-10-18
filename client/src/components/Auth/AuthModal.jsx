import React, { useState } from 'react';
import { X, User, Lock, Mail, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { authService } from '../../services/authService';
import { GAME_NAME } from '../../config/gameConfig';
import { audioManager } from '../../utils/audioManager';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    audioManager.playButtonClick();

    try {
      let res;
      if (isRegister) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        res = await authService.register({ name, email, password, confirmPassword });
      } else {
        res = await authService.login({ email, password });
      }

      if (res.user) {
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

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
        zIndex: 80,
        padding: '1rem'
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '400px',
          width: '100%',
          padding: '2rem 1.5rem',
          border: '2px solid rgba(56, 189, 248, 0.4)',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          className="cartoon-btn"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.4rem',
            background: '#334155',
            borderRadius: '50%'
          }}
        >
          <X size={18} color="#f8fafc" />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <Sparkles size={26} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', margin: 0 }}>
            {isRegister ? 'Join ' + GAME_NAME : 'Welcome Back'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {isRegister ? 'Create an account to save your stars & ranking' : 'Sign in to access your game progress'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.5rem', borderRadius: '0.6rem', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Player Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. DragonRider"
                  style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', borderRadius: '0.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', color: '#f8fafc', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@example.com"
                style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', borderRadius: '0.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', color: '#f8fafc', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', borderRadius: '0.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', color: '#f8fafc', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', borderRadius: '0.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', color: '#f8fafc', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cartoon-btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {loading ? 'Please wait...' : (isRegister ? <><UserPlus size={18} /> Register</> : <><LogIn size={18} /> Sign In</>)}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
