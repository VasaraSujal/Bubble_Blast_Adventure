import React, { useState, useEffect, useRef } from 'react';
import { GAME_NAME, COMPANION_NAME } from './config/gameConfig';
import BubbleCanvas from './components/BubbleBoard/BubbleCanvas';
import BoosterBar from './components/BoosterBar/BoosterBar';
import MascotBuddy from './components/Companion/MascotBuddy';
import StarScorePanel from './components/GameHUD/StarScorePanel';
import LandingPage from './components/Landing/LandingPage';
import AuthModal from './components/Auth/AuthModal';
import DashboardModal from './components/Dashboard/DashboardModal';
import LeaderboardModal from './components/Leaderboard/LeaderboardModal';
import AchievementsModal from './components/Achievements/AchievementsModal';
import LevelSelectModal from './components/LevelSelect/LevelSelectModal';
import LevelCompleteModal from './components/Modals/LevelCompleteModal';
import LevelFailedModal from './components/Modals/LevelFailedModal';
import PauseModal from './components/Modals/PauseModal';
import AmbientBubbles from './components/AmbientBackground/AmbientBubbles';
import SettingsModal from './components/Settings/SettingsModal';
import HelpModal from './components/Help/HelpModal';

import { getLevelDefinition, TOTAL_PRIMARY_LEVELS } from './data/levels/levelRegistry';
import { checkObjectiveCompletion, calculateStars } from './game/objectiveManager';
import { findRecommendedHint } from './game/hintManager';
import { audioManager } from './utils/audioManager';
import { authService } from './services/authService';
import { gameService } from './services/gameService';

import {
  Sparkles,
  Flame,
  Pause,
  Undo2,
  Lightbulb,
  Map,
  Volume2,
  VolumeX,
  Music,
  Disc,
  User,
  Trophy,
  Award,
  Home,
  Play,
  RotateCcw,
  RefreshCw,
  HelpCircle,
  Settings
} from 'lucide-react';

export default function App() {
  // Navigation view: 'landing' | 'game'
  const [currentView, setCurrentView] = useState('landing');

  // Authenticated user state
  const [user, setUser] = useState(() => authService.getCurrentUser());

  // Active Level State
  const [levelNumber, setLevelNumber] = useState(1);
  const [levelConfig, setLevelConfig] = useState(() => getLevelDefinition(1));
  const [highestUnlockedLevel, setHighestUnlockedLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [sessionToken, setSessionToken] = useState(null);

  // Gameplay session stats
  const [shotsRemaining, setShotsRemaining] = useState(levelConfig.shots);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [bubblesPoppedCount, setBubblesPoppedCount] = useState(0);
  const [rescuedCount, setRescuedCount] = useState(0);
  const [boostersUsed, setBoostersUsed] = useState([]);

  // Bubble queue
  const [currentBubble, setCurrentBubble] = useState('red');
  const [nextBubble, setNextBubble] = useState('blue');
  const [queueIndex, setQueueIndex] = useState(2);

  // Boosters inventory
  const [boosterInventory, setBoosterInventory] = useState({
    extra_shots: 3,
    aim_guide: 3,
    bomb: 2,
    rainbow: 2,
    shuffle: 3
  });
  const [aimGuideActive, setAimGuideActive] = useState(false);

  // Audio toggles (Sections 58 & 59)
  const [soundEnabled, setSoundEnabled] = useState(audioManager.sfxEnabled);
  const [musicEnabled, setMusicEnabled] = useState(audioManager.musicEnabled);

  // Mascot Companion Reaction
  const [mascotReaction, setMascotReaction] = useState('idle');

  // History for Undo
  const historyRef = useRef([]);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isLevelCompleteOpen, setIsLevelCompleteOpen] = useState(false);
  const [isLevelFailedOpen, setIsLevelFailedOpen] = useState(false);
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hintMessage, setHintMessage] = useState(null);

  // Sync profile on mount
  useEffect(() => {
    async function syncProfile() {
      const me = await authService.getMe();
      if (me) {
        setUser(me);
        if (me.currentLevel) setHighestUnlockedLevel(me.currentLevel);
        if (me.completedLevels) setCompletedLevels(me.completedLevels);
        if (me.totalScore) setScore(me.totalScore);
        if (me.boosterInventory) setBoosterInventory(me.boosterInventory);
      }
    }
    syncProfile();
  }, []);

  // Initialize level
  const loadLevel = async (num) => {
    const config = getLevelDefinition(num);
    setLevelNumber(num);
    setLevelConfig(config);
    setShotsRemaining(config.shots);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setBubblesPoppedCount(0);
    setRescuedCount(0);
    setBoostersUsed([]);
    setAimGuideActive(false);
    setMascotReaction('idle');
    historyRef.current = [];

    const queue = config.bubbleQueue || ['red', 'blue', 'green', 'yellow'];
    setCurrentBubble(queue[0] || 'red');
    setNextBubble(queue[1] || 'blue');
    setQueueIndex(2);

    setIsLevelCompleteOpen(false);
    setIsLevelFailedOpen(false);
    setIsPauseOpen(false);
    setHintMessage(null);
    setCurrentView('game');

    const sessionRes = await gameService.startSession(num);
    if (sessionRes && sessionRes.sessionToken) {
      setSessionToken(sessionRes.sessionToken);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioManager.setSoundEnabled(next);
    if (next) audioManager.playButtonClick();
  };

  const toggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    audioManager.setMusicEnabled(next);
  };

  const handleShotFired = () => {
    historyRef.current.push({
      shotsRemaining,
      score,
      combo,
      currentBubble,
      nextBubble,
      rescuedCount
    });

    setShotsRemaining(prev => Math.max(0, prev - 1));

    setCurrentBubble(nextBubble);
    const queue = levelConfig.bubbleQueue || ['red', 'blue', 'green', 'yellow'];
    const nextInQueue = queue[queueIndex % queue.length] || levelConfig.colors[0];
    setNextBubble(nextInQueue);
    setQueueIndex(prev => prev + 1);
  };

  const handleScoreAdded = (points) => {
    setScore(prev => prev + points);
    setBubblesPoppedCount(prev => prev + Math.max(1, Math.floor(points / 30)));
  };

  const handleComboChanged = (newCombo) => {
    setCombo(newCombo);
    if (newCombo > bestCombo) {
      setBestCombo(newCombo);
    }
    if (newCombo >= 2) {
      setMascotReaction('combo');
    } else {
      setMascotReaction('idle');
    }
  };

  const handleRescueFree = (count) => {
    setRescuedCount(prev => prev + count);
    setMascotReaction('victory');
    setTimeout(() => setMascotReaction('idle'), 2500);
  };

  const handleBoardStateChange = async (newGrid) => {
    const isComplete = checkObjectiveCompletion({
      objective: levelConfig.objective,
      grid: newGrid,
      score,
      rescuedCount,
      colorHuntCount: bubblesPoppedCount
    });

    if (isComplete) {
      const earnedStars = calculateStars(score, levelConfig.starThresholds);

      setCompletedLevels(prev => {
        const existing = prev.find(l => l.levelNumber === levelNumber);
        if (existing) {
          return prev.map(l => l.levelNumber === levelNumber
            ? { ...l, stars: Math.max(l.stars, earnedStars), score: Math.max(l.score, score) }
            : l
          );
        }
        return [...prev, { levelNumber, stars: earnedStars, score }];
      });

      if (levelNumber >= highestUnlockedLevel) {
        setHighestUnlockedLevel(levelNumber + 1);
      }

      setMascotReaction('victory');
      audioManager.playLevelCompleteSound();
      setIsLevelCompleteOpen(true);

      if (sessionToken) {
        await gameService.completeSession({
          sessionToken,
          levelNumber,
          shotsUsed: levelConfig.shots - shotsRemaining,
          bubblesPopped: bubblesPoppedCount,
          score,
          bestCombo,
          rescuedObjects: rescuedCount,
          boostersUsed,
          completed: true
        });
      }
      return;
    }

    if (shotsRemaining <= 1 && !isComplete) {
      setMascotReaction('failed');
      audioManager.playLevelFailedSound();
      setIsLevelFailedOpen(true);
    }
  };

  const handleUseBooster = (boosterId) => {
    if (boosterInventory[boosterId] <= 0) return;

    audioManager.playBoosterSound();

    setBoosterInventory(prev => ({
      ...prev,
      [boosterId]: prev[boosterId] - 1
    }));
    setBoostersUsed(prev => [...prev, boosterId]);

    switch (boosterId) {
      case 'extra_shots':
        setShotsRemaining(prev => prev + 5);
        if (isLevelFailedOpen) {
          setIsLevelFailedOpen(false);
          setMascotReaction('idle');
        }
        break;

      case 'aim_guide':
        setAimGuideActive(true);
        break;

      case 'bomb':
        setCurrentBubble('bomb');
        break;

      case 'rainbow':
        setCurrentBubble('rainbow');
        break;

      case 'shuffle': {
        const pool = levelConfig.colors;
        setCurrentBubble(pool[Math.floor(Math.random() * pool.length)]);
        setNextBubble(pool[Math.floor(Math.random() * pool.length)]);
        break;
      }
      default:
        break;
    }
  };

  const handleUndo = () => {
    if (historyRef.current.length === 0) return;
    audioManager.playButtonClick();
    const previous = historyRef.current.pop();
    setShotsRemaining(previous.shotsRemaining);
    setScore(previous.score);
    setCombo(previous.combo);
    setCurrentBubble(previous.currentBubble);
    setNextBubble(previous.nextBubble);
    setRescuedCount(previous.rescuedCount);
    setHintMessage('Reverted previous shot.');
    setTimeout(() => setHintMessage(null), 3000);
  };

  const handleHint = () => {
    audioManager.playButtonClick();
    const hint = findRecommendedHint({
      currentBubble,
      grid: levelConfig.boardLayout,
      boardWidth: 480,
      boardHeight: 640,
      launcherX: 240,
      launcherY: 588,
      radius: 30
    });

    if (hint) {
      setHintMessage(`💡 Hint: ${hint.description}`);
    } else {
      setHintMessage('💡 Aim high towards connected groups to cause drop reactions!');
    }
    setTimeout(() => setHintMessage(null), 4000);
  };

  const handleSwapBubbles = () => {
    const temp = currentBubble;
    setCurrentBubble(nextBubble);
    setNextBubble(temp);
  };

  return (
    <div
      className="game-viewport"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0.35rem 0.6rem',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Ambient Floating Bubble Atmosphere */}
      <AmbientBubbles count={16} />

      {/* Top Universal Navbar / In-Game HUD Header */}
      <header
        className="glass-panel"
        style={{
          padding: '0.35rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1020px',
          margin: '0 auto',
          width: '100%',
          flexShrink: 0,
          border: '2px solid rgba(245, 158, 11, 0.35)',
          gap: '0.5rem'
        }}
      >
        {/* Brand */}
        <div
          onClick={() => {
            audioManager.playButtonClick();
            setCurrentView('landing');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', flexShrink: 0 }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 60%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fef3c7'
            }}
          >
            <Sparkles size={16} color="#78350f" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f8fafc', lineHeight: 1.1 }}>
              {GAME_NAME}
            </h1>
            <span style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 600 }}>
              {currentView === 'game' ? `Lvl ${levelNumber} (${levelConfig.difficulty.toUpperCase()})` : 'Dragon Pop Edition'}
            </span>
          </div>
        </div>

        {/* IN-GAME ACTIVE HUD: Always front and center so score & shots are 100% visible together */}
        {currentView === 'game' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Shots Remaining */}
            <div
              className="hud-pill"
              style={{
                borderColor: shotsRemaining <= 5 ? '#ef4444' : 'rgba(56, 189, 248, 0.45)',
                background: shotsRemaining <= 5 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                color: shotsRemaining <= 5 ? '#f87171' : '#38bdf8'
              }}
            >
              <span>🎯</span>
              <span>Shots: <strong style={{ fontSize: '0.92rem' }}>{shotsRemaining}</strong></span>
            </div>

            {/* Score */}
            <div
              className="hud-pill"
              style={{
                borderColor: 'rgba(245, 158, 11, 0.45)',
                color: '#fbbf24'
              }}
            >
              <span>⭐</span>
              <span>Score: <strong style={{ fontSize: '0.92rem' }}>{score.toLocaleString()}</strong></span>
            </div>

            {/* Mission Objective */}
            <div
              className="hud-pill"
              style={{
                borderColor: 'rgba(16, 185, 129, 0.45)',
                color: '#34d399'
              }}
              title={levelConfig.objective.description}
            >
              {levelConfig.objective.type === 'rescue' ? (
                <>
                  <span>🦕</span>
                  <span>{rescuedCount} / {levelConfig.objective.target} Rescued</span>
                </>
              ) : (
                <>
                  <span>🎯</span>
                  <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{levelConfig.objective.description}</span>
                </>
              )}
            </div>

            {/* Combo Streak */}
            {combo > 1 && (
              <div
                className="hud-pill pulse-glow"
                style={{
                  borderColor: '#ec4899',
                  background: 'rgba(236, 72, 153, 0.25)',
                  color: '#ec4899',
                  fontWeight: 800
                }}
              >
                🔥 x{combo}
              </div>
            )}
          </div>
        )}

        {/* Global Navigation Controls */}
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexShrink: 0 }}>
          {currentView === 'game' ? (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                setCurrentView('landing');
              }}
              className="cartoon-btn"
              style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem', background: '#334155', color: '#f8fafc' }}
              title="Home"
            >
              <Home size={14} /> Home
            </button>
          ) : (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                loadLevel(levelNumber);
              }}
              className="cartoon-btn btn-gold"
              style={{ padding: '0.32rem 0.7rem', fontSize: '0.8rem' }}
            >
              <Play size={14} fill="currentColor" /> Play
            </button>
          )}

          <button
            onClick={() => {
              audioManager.playButtonClick();
              setIsLevelSelectOpen(true);
            }}
            className="cartoon-btn btn-cyan"
            style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem' }}
            title="Adventure Map"
          >
            <Map size={14} /> Map
          </button>

          {currentView !== 'game' && (
            <>
              <button
                onClick={() => {
                  audioManager.playButtonClick();
                  setIsLeaderboardOpen(true);
                }}
                className="cartoon-btn btn-gold"
                style={{ padding: '0.3rem 0.5rem' }}
                title="Leaderboard"
              >
                <Trophy size={14} />
              </button>

              <button
                onClick={() => {
                  audioManager.playButtonClick();
                  setIsAchievementsOpen(true);
                }}
                className="cartoon-btn btn-purple"
                style={{ padding: '0.3rem 0.5rem' }}
                title="Achievements"
              >
                <Award size={14} />
              </button>
            </>
          )}

          {/* Help & Rules Button */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              setIsHelpOpen(true);
            }}
            className="cartoon-btn btn-cyan"
            style={{ padding: '0.3rem 0.5rem' }}
            title="Help & Rules"
          >
            <HelpCircle size={14} />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              setIsSettingsOpen(true);
            }}
            className="cartoon-btn"
            style={{ padding: '0.3rem 0.5rem', background: '#334155' }}
            title="Settings & Audio"
          >
            <Settings size={14} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="cartoon-btn"
            style={{
              padding: '0.3rem 0.45rem',
              background: soundEnabled ? 'rgba(56, 189, 248, 0.25)' : '#334155',
              borderColor: soundEnabled ? '#38bdf8' : 'rgba(255,255,255,0.1)'
            }}
          >
            {soundEnabled ? <Volume2 size={14} color="#38bdf8" /> : <VolumeX size={14} color="#94a3b8" />}
          </button>

          {/* Music Toggle */}
          <button
            onClick={toggleMusic}
            title={musicEnabled ? 'Stop Music' : 'Play Music'}
            className="cartoon-btn"
            style={{
              padding: '0.3rem 0.45rem',
              background: musicEnabled ? 'rgba(236, 72, 153, 0.25)' : '#334155',
              borderColor: musicEnabled ? '#ec4899' : 'rgba(255,255,255,0.1)'
            }}
          >
            {musicEnabled ? <Music size={14} color="#ec4899" /> : <Disc size={14} color="#94a3b8" />}
          </button>

          {/* User Account / Pause */}
          {currentView !== 'game' ? (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                if (user) setIsDashboardOpen(true);
                else setIsAuthOpen(true);
              }}
              className="cartoon-btn btn-emerald"
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
            >
              <User size={14} /> {user ? user.name : 'Sign In'}
            </button>
          ) : (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                setIsPauseOpen(true);
              }}
              className="cartoon-btn"
              style={{ padding: '0.3rem 0.45rem', background: '#334155', color: '#f8fafc' }}
              title="Pause Game"
            >
              <Pause size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Main View Router */}
      {currentView === 'landing' ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
          <LandingPage
            onPlayNow={() => loadLevel(levelNumber)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          />
        </div>
      ) : (
        /* Arcade 1-Screen Game Layout (Guaranteed NO vertical scrolling!) */
        <main className="game-main-area">
          {/* Left Tactical Column */}
          <div className="game-sidebar">
            {/* Mascot Companion Bubby Card */}
            <MascotBuddy
              reaction={mascotReaction}
              comboCount={combo}
            />

            {/* Tactical Action Dock: Swap Bubble, Undo, Hint */}
            <div
              className="glass-panel"
              style={{
                padding: '0.55rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                border: '2px solid rgba(245, 158, 11, 0.35)',
                background: 'rgba(15, 23, 42, 0.85)'
              }}
            >
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.5px' }}>
                Action Controls
              </span>

              {/* Swap Bubble Button with color preview dots */}
              <button
                onClick={() => {
                  audioManager.playButtonClick();
                  handleSwapBubbles();
                }}
                className="cartoon-btn btn-gold"
                style={{
                  padding: '0.42rem 0.6rem',
                  fontSize: '0.82rem',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                title="Swap Current and Next Bubble (or tap the NEXT bubble on the cannon)"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <RefreshCw size={14} />
                  <span>Swap Bubble</span>
                </div>
                {/* Bubble color dots preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: currentBubble === 'bomb' ? '#1e293b' : currentBubble === 'rainbow' ? 'linear-gradient(135deg, red, yellow, blue)' : currentBubble,
                      border: '1.5px solid #ffffff',
                      boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                    }}
                    title={`Current: ${currentBubble}`}
                  />
                  <span style={{ fontSize: '0.65rem', color: '#78350f', fontWeight: 800 }}>⇄</span>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: nextBubble === 'bomb' ? '#1e293b' : nextBubble === 'rainbow' ? 'linear-gradient(135deg, red, yellow, blue)' : nextBubble,
                      border: '1.5px solid #ffffff',
                      boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                    }}
                    title={`Next: ${nextBubble}`}
                  />
                </div>
              </button>

              {/* Undo & Hint Buttons */}
              <div style={{ display: 'flex', gap: '0.45rem' }}>
                <button
                  onClick={handleUndo}
                  disabled={historyRef.current.length === 0}
                  className="cartoon-btn btn-cyan"
                  style={{ flex: 1, padding: '0.42rem 0.4rem', fontSize: '0.8rem' }}
                  title="Undo previous shot"
                >
                  <Undo2 size={13} /> Undo
                </button>
                <button
                  onClick={handleHint}
                  className="cartoon-btn btn-emerald"
                  style={{ flex: 1, padding: '0.42rem 0.4rem', fontSize: '0.8rem' }}
                  title="Show recommended target hint"
                >
                  <Lightbulb size={13} /> Hint
                </button>
              </div>

              {hintMessage && (
                <div
                  style={{
                    padding: '0.35rem 0.5rem',
                    fontSize: '0.74rem',
                    color: '#fbbf24',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    lineHeight: 1.2
                  }}
                >
                  {hintMessage}
                </div>
              )}
            </div>

            {/* Mission Guide Note */}
            <div
              className="glass-panel"
              style={{
                padding: '0.5rem 0.75rem',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                background: 'rgba(15, 23, 42, 0.7)',
                fontSize: '0.76rem'
              }}
            >
              <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase' }}>
                Mission Guide
              </div>
              <div style={{ color: '#f8fafc', fontWeight: 600, marginTop: '2px' }}>
                {levelConfig.objective.description}
              </div>
              <div style={{ color: '#38bdf8', fontSize: '0.7rem', marginTop: '2px' }}>
                💡 Tap NEXT bubble to swap quickly!
              </div>
            </div>
          </div>

          {/* Center Column: The Game Canvas & Integrated Booster Dock */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flex: 1,
              minWidth: 0
            }}
          >
            {/* The Canvas (Responsively scaled with maxHeight: min(63vh, calc(100vh - 135px))) */}
            <BubbleCanvas
              initialBoard={levelConfig.boardLayout}
              shotsRemaining={shotsRemaining}
              currentBubble={currentBubble}
              nextBubble={nextBubble}
              aimGuideActive={aimGuideActive}
              combo={combo}
              onShotFired={handleShotFired}
              onScoreAdded={handleScoreAdded}
              onComboChanged={handleComboChanged}
              onRescueFree={handleRescueFree}
              onBoardStateChange={handleBoardStateChange}
              onSwapBubbles={handleSwapBubbles}
            />

            {/* Booster Dock directly below the Canvas */}
            <BoosterBar
              inventory={boosterInventory}
              activeAimGuide={aimGuideActive}
              isShooting={false}
              isLevelOver={isLevelCompleteOpen || isLevelFailedOpen}
              onUseBooster={handleUseBooster}
            />
          </div>

          {/* Right Tactical Column: Live 3-Star Score Progress, Combo Flame & Stats Matrix */}
          <StarScorePanel
            score={score}
            starThresholds={levelConfig.starThresholds}
            combo={combo}
            bestCombo={bestCombo}
            bubblesPopped={bubblesPoppedCount}
            rescuedCount={rescuedCount}
            objective={levelConfig.objective}
            difficulty={levelConfig.difficulty}
            levelNumber={levelNumber}
          />
        </main>
      )}

      {/* Universal Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(authedUser) => {
          setUser(authedUser);
          if (authedUser.currentLevel) setHighestUnlockedLevel(authedUser.currentLevel);
          if (authedUser.completedLevels) setCompletedLevels(authedUser.completedLevels);
        }}
      />

      <DashboardModal
        isOpen={isDashboardOpen}
        user={user}
        totalScore={score}
        totalStars={completedLevels.reduce((acc, curr) => acc + (curr.stars || 0), 0)}
        currentLevel={highestUnlockedLevel}
        completedLevels={completedLevels}
        bubblesPopped={bubblesPoppedCount}
        bestCombo={bestCombo}
        rescuedObjects={rescuedCount}
        boosterInventory={boosterInventory}
        onClose={() => setIsDashboardOpen(false)}
        onLogout={() => setUser(null)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUserName={user ? user.name : 'Guest Player'}
        currentUserScore={score}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        stats={{
          bubblesPopped: bubblesPoppedCount,
          completedLevels: completedLevels.length,
          bestCombo,
          rescuedObjects: rescuedCount,
          totalStars: completedLevels.reduce((acc, curr) => acc + (curr.stars || 0), 0),
          totalScore: score,
          boostersUsed: boostersUsed.length
        }}
      />

      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        unlockedLevel={highestUnlockedLevel}
        completedLevels={completedLevels}
        onSelectLevel={(lvl) => {
          setIsLevelSelectOpen(false);
          loadLevel(lvl);
        }}
        onUnlockAll={() => {
          setHighestUnlockedLevel(TOTAL_PRIMARY_LEVELS);
        }}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      <LevelCompleteModal
        isOpen={isLevelCompleteOpen}
        levelNumber={levelNumber}
        score={score}
        stars={calculateStars(score, levelConfig.starThresholds)}
        shotsUsed={levelConfig.shots - shotsRemaining}
        shotsRemaining={shotsRemaining}
        bubblesPopped={bubblesPoppedCount}
        bestCombo={bestCombo}
        onNextLevel={() => loadLevel(levelNumber + 1)}
        onReplay={() => loadLevel(levelNumber)}
        onLevelSelect={() => {
          setIsLevelCompleteOpen(false);
          setIsLevelSelectOpen(true);
        }}
      />

      <LevelFailedModal
        isOpen={isLevelFailedOpen}
        levelNumber={levelNumber}
        objectiveDescription={levelConfig.objective.description}
        hasExtraShotsBooster={boosterInventory.extra_shots > 0}
        onRetry={() => loadLevel(levelNumber)}
        onUseExtraShots={() => handleUseBooster('extra_shots')}
        onLevelSelect={() => {
          setIsLevelFailedOpen(false);
          setIsLevelSelectOpen(true);
        }}
      />

      <PauseModal
        isOpen={isPauseOpen}
        levelNumber={levelNumber}
        onResume={() => setIsPauseOpen(false)}
        onRestart={() => {
          setIsPauseOpen(false);
          loadLevel(levelNumber);
        }}
        onLevelSelect={() => {
          setIsPauseOpen(false);
          setIsLevelSelectOpen(true);
        }}
      />

      {/* Settings Modal (Section 58, 59, 89) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        onToggleSound={toggleSound}
        onToggleMusic={toggleMusic}
      />

      {/* Help Modal (Section 10–21, 26, 38–40, 76) */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
