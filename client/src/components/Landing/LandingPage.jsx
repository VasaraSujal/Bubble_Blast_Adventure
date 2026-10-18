import React, { useState } from 'react';
import { GAME_NAME, COMPANION_NAME } from '../../config/gameConfig';
import {
  Play,
  Trophy,
  Award,
  Map,
  Sparkles,
  ShieldCheck,
  Compass,
  Volume2,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  RefreshCw,
  Flame,
  PlusCircle,
  Bomb,
  Shuffle,
  HelpCircle,
  CheckCircle2,
  Users,
  Star
} from 'lucide-react';
import { audioManager } from '../../utils/audioManager';

export default function LandingPage({ onPlayNow, onOpenLeaderboard, onOpenAchievements, onOpenLevelSelect }) {
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    audioManager.playButtonClick();
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const mechanics = [
    {
      title: 'Strategic Bank Shots',
      icon: <Target size={28} color="#38bdf8" />,
      tag: 'Physics',
      desc: 'Bounce bubbles off side walls using reflective trajectory calculation to reach hidden clusters behind obstacles.'
    },
    {
      title: 'Match-3 Chain Explosions',
      icon: <Zap size={28} color="#f59e0b" />,
      tag: 'Matching',
      desc: 'Connect 3 or more same-colored bubbles to trigger pops with escalating combo multipliers and comic sound effects.'
    },
    {
      title: 'Floating Drop Cascades',
      icon: <Flame size={28} color="#ec4899" />,
      tag: 'Gravity',
      desc: 'Sever the top connection to the ceiling! Any bubble left floating plummets down with realistic gravity physics for huge bonus points.'
    },
    {
      title: 'Dragon Egg Rescues',
      icon: <Sparkles size={28} color="#10b981" />,
      tag: 'Objective',
      desc: 'Break the bubble barrier enclosing trapped baby dragon eggs to hatch and rescue them with joyous victory animations.'
    }
  ];

  const boosters = [
    {
      name: 'Extra Shots (+5)',
      icon: <PlusCircle size={26} color="#10b981" />,
      badge: '+5 Ammo',
      desc: 'Adds 5 emergency shots to your quiver when you are down to the wire on challenging levels.'
    },
    {
      name: 'Aim Guide',
      icon: <Target size={26} color="#38bdf8" />,
      badge: 'Laser Path',
      desc: 'Extends your laser trajectory path with bank shot reflections and ghost landing slot preview.'
    },
    {
      name: 'Bomb Bubble',
      icon: <Bomb size={26} color="#f87171" />,
      badge: 'Area Blast',
      desc: 'Detonates a fiery shockwave upon contact, clearing out large clusters of all bubble types.'
    },
    {
      name: 'Rainbow Prism',
      icon: <Sparkles size={26} color="#ec4899" />,
      badge: 'Wildcard',
      desc: 'Matches automatically with any adjacent color, triggering guaranteed pops in tight spots.'
    },
    {
      name: 'Shuffle Magic',
      icon: <Shuffle size={26} color="#fbbf24" />,
      badge: 'Queue Swap',
      desc: 'Rerolls the upcoming bubble queue to hand you the exact colors needed to solve the board.'
    }
  ];

  const chapters = [
    {
      id: 1,
      title: 'Emerald Forest',
      range: 'Levels 1 – 10',
      tag: 'Tutorial & Basics',
      color: '#10b981',
      emoji: '🌲',
      desc: 'Learn bank shots, combo chains, and free the first baby dragons nestled in lush canopies.'
    },
    {
      id: 2,
      title: 'Crystal Caverns',
      range: 'Levels 11 – 20',
      tag: 'Bank Shot Mastery',
      color: '#38bdf8',
      emoji: '💎',
      desc: 'Navigate intricate ceiling layouts and narrow corridors with precision wall bounces.'
    },
    {
      id: 3,
      title: 'Sunken Isles',
      range: 'Levels 21 – 30',
      tag: 'Rescue Missions',
      color: '#ec4899',
      emoji: '🌊',
      desc: 'High-pressure rescue puzzles with limited ammo and floating cascade chains.'
    },
    {
      id: 4,
      title: 'Dragon Summit',
      range: 'Levels 31 – 40+',
      tag: 'Grandmaster Puzzles',
      color: '#f59e0b',
      emoji: '🌋',
      desc: 'Multi-tiered puzzle boards with complex color distributions and expert score challenges.'
    }
  ];

  const faqs = [
    {
      q: 'How do wall bounce bank shots work?',
      a: 'When you aim towards the left or right boundaries, your trajectory laser dynamically reflects off the wall at an equal and opposite angle (v_x = -v_x). This lets you shoot behind front rows to trigger floating drop cascades.'
    },
    {
      q: 'How are the 3 stars calculated for each level?',
      a: 'Stars are awarded based on your final level score versus the level star thresholds. You gain bonus points for remaining shots, consecutive combo streaks, and floating bubbles dropped in cascades.'
    },
    {
      q: 'Can I swap the current bubble for the next one?',
      a: 'Yes! You can either click the dedicated "Swap Bubble" button in the Action Controls panel, or tap directly on the next bubble nest located on the dragon cannon base.'
    },
    {
      q: 'Is my progress saved if I close the browser?',
      a: 'Yes. All completed levels, earned stars, high scores, and booster inventories are saved locally in your browser storage and automatically sync with the server database when signed in.'
    },
    {
      q: 'How does the anti-cheat verification protect high scores?',
      a: 'Every completed session is verified by our server validation engine, checking session tokens, minimum realistic durations, shot counts, and score ranges before recording to the global leaderboard.'
    }
  ];

  return (
    <div className="landing-scroll-view">
      {/* 1. HERO SECTION */}
      <section className="landing-section" style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        <div
          className="gold-panel float-wobble"
          style={{
            padding: '3rem 2rem',
            maxWidth: '720px',
            width: '100%',
            position: 'relative',
            textAlign: 'center'
          }}
        >
          {/* Animated Mascot Bubby Avatar */}
          <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <div
              style={{
                width: '95px',
                height: '95px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #047857 70%, #064e3b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.2rem',
                border: '4px solid #fcd34d',
                boxShadow: '0 12px 30px rgba(16, 185, 129, 0.6), inset 0 3px 6px rgba(255,255,255,0.4)',
                margin: '0 auto'
              }}
            >
              🦕
            </div>
            {/* Mascot Greeting Speech Bubble */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1.5px solid #34d399',
                borderRadius: '0.85rem',
                padding: '0.35rem 0.85rem',
                fontSize: '0.85rem',
                color: '#34d399',
                fontWeight: 700,
                marginTop: '0.65rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
            >
              <span>👋</span>
              <span>{COMPANION_NAME}: "Ready to pop some bubbles?"</span>
            </div>
          </div>

          {/* Dynamic Game Title (Section 4, 5, 6, 77) */}
          <h1
            style={{
              fontSize: '2.9rem',
              color: '#f8fafc',
              marginBottom: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              textShadow: '0 4px 12px rgba(0,0,0,0.7)',
              lineHeight: 1.15
            }}
          >
            {GAME_NAME}
          </h1>

          {/* Slogan Badges (Section 77) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#0284c7', color: '#ffffff', padding: '0.25rem 0.85rem', borderRadius: '0.75rem', fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 3px 6px rgba(0,0,0,0.3)' }}>Aim.</span>
            <span style={{ background: '#d97706', color: '#ffffff', padding: '0.25rem 0.85rem', borderRadius: '0.75rem', fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 3px 6px rgba(0,0,0,0.3)' }}>Match.</span>
            <span style={{ background: '#db2777', color: '#ffffff', padding: '0.25rem 0.85rem', borderRadius: '0.75rem', fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 3px 6px rgba(0,0,0,0.3)' }}>Pop.</span>
            <span style={{ background: '#059669', color: '#ffffff', padding: '0.25rem 0.85rem', borderRadius: '0.75rem', fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 3px 6px rgba(0,0,0,0.3)' }}>Rescue.</span>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto 2.2rem auto', lineHeight: 1.6 }}>
            Step into a magical dragon realm! Master high-velocity bank shots, pop dazzling color clusters, unleash powerful boosters, and rescue your dragon friends across 40+ handcrafted levels.
          </p>

          {/* Main Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                audioManager.playButtonClick();
                onPlayNow();
              }}
              className="cartoon-btn btn-gold"
              style={{
                fontSize: '1.45rem',
                padding: '1.15rem 3.2rem',
                borderRadius: '1.6rem',
                boxShadow: '0 12px 35px rgba(245, 158, 11, 0.6)'
              }}
            >
              <Play size={28} fill="currentColor" /> PLAY NOW
            </button>

            <button
              onClick={() => {
                audioManager.playButtonClick();
                onOpenLevelSelect();
              }}
              className="cartoon-btn btn-cyan"
              style={{
                fontSize: '1.1rem',
                padding: '1.15rem 2rem',
                borderRadius: '1.6rem'
              }}
            >
              <Map size={22} /> SAGA MAP
            </button>
          </div>
        </div>

        {/* Live Feature Stats Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            maxWidth: '920px',
            width: '100%',
            marginTop: '2.5rem'
          }}
        >
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', border: '1.5px solid rgba(56, 189, 248, 0.3)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>40+</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Saga Campaign Levels</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', border: '1.5px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>5 Boosters</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Tactical Power-Ups</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', border: '1.5px solid rgba(236, 72, 153, 0.3)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ec4899' }}>10+ Trophies</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Career Achievements</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', border: '1.5px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>100% Verified</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Server Anti-Cheat Engine</div>
          </div>
        </div>
      </section>

      {/* 2. GAME MECHANICS SHOWCASE */}
      <section className="landing-section" style={{ background: 'rgba(15, 23, 42, 0.45)', borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Arcade-Grade Physics
          </span>
          <h2 style={{ fontSize: '2.2rem', color: '#f8fafc', margin: '0.4rem 0 0.8rem 0' }} className="gradient-title-gold">
            How to Play & Master the Board
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
            Inspired by Google Play's <em>Bubble Shooter - Dragon Pop</em>, engineered with custom raycast reflection math and multi-source BFS connected matching.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            width: '100%'
          }}
        >
          {mechanics.map((m, idx) => (
            <div
              key={idx}
              className="glass-panel interactive-card"
              style={{
                padding: '1.6rem 1.4rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '1rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  {m.icon}
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#fbbf24',
                    background: 'rgba(245, 158, 11, 0.15)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                >
                  {m.tag}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', margin: 0 }}>{m.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. THE 5 TACTICAL BOOSTERS ARSENAL */}
      <section className="landing-section">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Special Props & Power-Ups
          </span>
          <h2 style={{ fontSize: '2.2rem', color: '#f8fafc', margin: '0.4rem 0 0.8rem 0' }} className="gradient-title-cyan">
            Turn the Tide with the Booster Arsenal
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '580px', margin: '0 auto', fontSize: '1rem' }}>
            Use tactical props to overcome tight obstacles, extend reflections, and shatter stubborn clusters.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            width: '100%'
          }}
        >
          {boosters.map((b, idx) => (
            <div
              key={idx}
              className="glass-panel interactive-card"
              style={{
                padding: '1.4rem 1.1rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.65rem'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.5)'
                }}
              >
                {b.icon}
              </div>
              <strong style={{ fontSize: '1.05rem', color: '#f8fafc' }}>{b.name}</strong>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '0.45rem',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                {b.badge}
              </span>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ADVENTURE SAGA WORLD MAP PREVIEW */}
      <section className="landing-section" style={{ background: 'rgba(15, 23, 42, 0.45)', borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Level Progression
          </span>
          <h2 style={{ fontSize: '2.2rem', color: '#f8fafc', margin: '0.4rem 0 0.8rem 0' }}>
            Journey Across 4 Mystical Realms
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '580px', margin: '0 auto', fontSize: '1rem' }}>
            Progress sequentially through 40+ handcrafted puzzle challenges, each featuring unique visual biomes and difficulty curves.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            marginBottom: '2rem'
          }}
        >
          {chapters.map(c => (
            <div
              key={c.id}
              className="glass-panel interactive-card"
              style={{
                padding: '1.5rem',
                textAlign: 'left',
                borderLeft: `5px solid ${c.color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '2rem' }}>{c.emoji}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: c.color, background: 'rgba(15, 23, 42, 0.8)', padding: '0.2rem 0.55rem', borderRadius: '0.45rem', border: `1px solid ${c.color}` }}>
                  {c.range}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>{c.title}</h3>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>{c.tag}</div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            audioManager.playButtonClick();
            onOpenLevelSelect();
          }}
          className="cartoon-btn btn-emerald"
          style={{ fontSize: '1.1rem', padding: '0.85rem 2.2rem' }}
        >
          <Compass size={20} /> VIEW FULL SAGA MAP (40 LEVELS)
        </button>
      </section>

      {/* 5. HALL OF FAME / LEADERBOARD PREVIEW */}
      <section className="landing-section">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Global Champions
          </span>
          <h2 style={{ fontSize: '2.2rem', color: '#f8fafc', margin: '0.4rem 0 0.8rem 0' }} className="gradient-title-gold">
            Hall of Fame Podium
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '580px', margin: '0 auto', fontSize: '1rem' }}>
            Compete against players worldwide. Scores are validated server-side to ensure fair play.
          </p>
        </div>

        {/* Podium Top 3 Widget */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '1rem',
            width: '100%',
            maxWidth: '650px',
            marginBottom: '2rem'
          }}
        >
          {/* Silver #2 */}
          <div
            className="glass-panel"
            style={{
              flex: 1,
              padding: '1.25rem 0.85rem',
              textAlign: 'center',
              border: '2px solid #94a3b8',
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
              height: '170px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderRadius: '1.25rem'
            }}
          >
            <div style={{ fontSize: '1.8rem' }}>🥈</div>
            <strong style={{ color: '#f8fafc', fontSize: '0.95rem', marginTop: '4px' }}>DragonRider</strong>
            <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem', marginTop: '2px' }}>142,800</div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>⭐ 68 Stars</span>
          </div>

          {/* Gold #1 */}
          <div
            className="gold-panel pulse-glow"
            style={{
              flex: 1.15,
              padding: '1.5rem 1rem',
              textAlign: 'center',
              border: '3px solid #f59e0b',
              height: '210px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderRadius: '1.5rem',
              boxShadow: '0 12px 30px rgba(245, 158, 11, 0.4)'
            }}
          >
            <div style={{ fontSize: '2.4rem' }}>👑 🥇</div>
            <strong style={{ color: '#fcd34d', fontSize: '1.1rem', marginTop: '4px' }}>Aria Flame</strong>
            <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '1.35rem', marginTop: '2px' }}>189,450</div>
            <span style={{ fontSize: '0.75rem', color: '#fef08a', fontWeight: 700 }}>⭐ 92 Stars • Level 38</span>
          </div>

          {/* Bronze #3 */}
          <div
            className="glass-panel"
            style={{
              flex: 1,
              padding: '1.25rem 0.85rem',
              textAlign: 'center',
              border: '2px solid #b45309',
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
              height: '150px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderRadius: '1.25rem'
            }}
          >
            <div style={{ fontSize: '1.8rem' }}>🥉</div>
            <strong style={{ color: '#f8fafc', fontSize: '0.95rem', marginTop: '4px' }}>SparkPop</strong>
            <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem', marginTop: '2px' }}>128,500</div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>⭐ 54 Stars</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onOpenLeaderboard();
            }}
            className="cartoon-btn btn-gold"
            style={{ fontSize: '0.95rem', padding: '0.65rem 1.6rem' }}
          >
            <Trophy size={18} /> OPEN FULL LEADERBOARD
          </button>
          <button
            onClick={() => {
              audioManager.playButtonClick();
              onOpenAchievements();
            }}
            className="cartoon-btn btn-purple"
            style={{ fontSize: '0.95rem', padding: '0.65rem 1.6rem' }}
          >
            <Award size={18} /> VIEW ACHIEVEMENTS
          </button>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="landing-section" style={{ background: 'rgba(15, 23, 42, 0.45)', borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: '#a855f7', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Frequently Asked Questions
          </span>
          <h2 style={{ fontSize: '2.2rem', color: '#f8fafc', margin: '0.4rem 0 0.8rem 0' }}>
            Game Rules & Strategy FAQ
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '540px', margin: '0 auto', fontSize: '1rem' }}>
            Everything you need to know about bubble trajectories, boosters, and score mechanics.
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '750px' }}>
          {faqs.map((f, idx) => (
            <div key={idx} className="accordion-item">
              <div className="accordion-header" onClick={() => toggleFaq(idx)}>
                <span>{f.q}</span>
                {openFaq === idx ? <ChevronUp size={20} color="#fbbf24" /> : <ChevronDown size={20} color="#94a3b8" />}
              </div>
              {openFaq === idx && (
                <div className="accordion-body">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. FULL COMMERCIAL FOOTER */}
      <footer
        style={{
          width: '100%',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(9, 13, 22, 0.95)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          marginTop: '2rem',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          {/* Logo & Slogan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 60%, #b45309 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fef3c7'
              }}
            >
              <Sparkles size={18} color="#78350f" />
            </div>
            <strong style={{ fontSize: '1.3rem', color: '#f8fafc', fontFamily: 'Fredoka, sans-serif' }}>
              {GAME_NAME}
            </strong>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '600px', margin: 0, lineHeight: 1.5 }}>
            A production-grade full-stack bubble shooter game inspired by <em>Bubble Shooter - Dragon Pop</em>. Built with React 18, HTML5 Canvas, Synthesized Web Audio API, Express, MongoDB, and Anti-Cheat Session Verification.
          </p>

          {/* Quick Navigation Links */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.85rem' }}>
            <span onClick={onPlayNow} style={{ color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fbbf24'} onMouseLeave={e => e.target.style.color = '#cbd5e1'}>
              Play Game
            </span>
            <span onClick={onOpenLevelSelect} style={{ color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fbbf24'} onMouseLeave={e => e.target.style.color = '#cbd5e1'}>
              Saga Map (40 Levels)
            </span>
            <span onClick={onOpenLeaderboard} style={{ color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fbbf24'} onMouseLeave={e => e.target.style.color = '#cbd5e1'}>
              Leaderboard
            </span>
            <span onClick={onOpenAchievements} style={{ color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fbbf24'} onMouseLeave={e => e.target.style.color = '#cbd5e1'}>
              Achievements
            </span>
          </div>

          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            © {new Date().getFullYear()} {GAME_NAME} • VELoop Rewards Full Stack Developer Internship Task 2
          </div>
        </div>
      </footer>
    </div>
  );
}
