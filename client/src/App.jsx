import React, { useState, useEffect, useRef } from 'react';
import { GAME_NAME, COMPANION_NAME } from './config/gameConfig';
import BubbleCanvas from './components/BubbleBoard/BubbleCanvas';
import BoosterBar from './components/BoosterBar/BoosterBar';
import MascotBuddy from './components/Companion/MascotBuddy';
import StarScorePanel from './components/GameHUD/StarScorePanel';
import ArcadeTopHUD from './components/GameHUD/ArcadeTopHUD';
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
import DailyChallengeModal from './components/DailyChallenge/DailyChallengeModal';

import { getLevelDefinition, getDailyChallengeDefinition, TOTAL_PRIMARY_LEVELS } from './data/levels/levelRegistry';
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
  Settings,
  Calendar,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // Navigation view: 'landing' | 'game'
  const [currentView, setCurrentView] = useState('landing');

  // Authenticated user state
  const [user, setUser] = useState(() => authService.getCurrentUser());

  // Active Level State
  const [levelNumber, setLevelNumber] = useState(1);
  const [sessionInstanceId, setSessionInstanceId] = useState(1);
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

  // History for Undo (Section 46)
  const historyRef = useRef([]);
  const liveGridRef = useRef(null);
  const [boardRestoreTrigger, setBoardRestoreTrigger] = useState(null);

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
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hintMessage, setHintMessage] = useState(null);

  // HTML5 History Routing Synchronization (Section 76)
  const syncRouteFromPath = (path) => {
    const clean = path.toLowerCase().replace(/\/$/, '') || '/';

    // Close overlays
    setIsAuthOpen(false);
    setIsDashboardOpen(false);
    setIsLeaderboardOpen(false);
    setIsAchievementsOpen(false);
    setIsLevelSelectOpen(false);
    setIsSettingsOpen(false);
    setIsHelpOpen(false);
    setIsDailyChallengeOpen(false);
    setIsMobileMenuOpen(false);

    if (clean === '/' || clean === '') {
      setCurrentView('landing');
    } else if (clean.startsWith('/game')) {
      const match = clean.match(/\/game\/(\d+)/);
      const lvl = match ? parseInt(match[1], 10) : (highestUnlockedLevel || 1);
      loadLevel(lvl);
    } else if (clean === '/login' || clean === '/register') {
      setIsAuthOpen(true);
    } else if (clean === '/dashboard' || clean === '/profile') {
      setIsDashboardOpen(true);
    } else if (clean === '/levels') {
      setIsLevelSelectOpen(true);
    } else if (clean === '/leaderboard') {
      setIsLeaderboardOpen(true);
    } else if (clean === '/achievements') {
      setIsAchievementsOpen(true);
    } else if (clean === '/settings') {
      setIsSettingsOpen(true);
    } else if (clean === '/help') {
      setIsHelpOpen(true);
    } else if (clean === '/daily-challenge') {
      setIsDailyChallengeOpen(true);
    }
  };

  const navigateTo = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    syncRouteFromPath(path);
  };

  const closeModal = (setter) => {
    setter(false);
    const fallbackPath = currentView === 'game' ? `/game/${levelNumber}` : '/';
    if (window.location.pathname !== fallbackPath) {
      window.history.pushState(null, '', fallbackPath);
    }
  };

  // Sync profile and handle browser routing on mount
  useEffect(() => {
    async function syncProfile() {
      const me = await authService.getMe();
      if (me) {
        setUser(me);
        if (me.currentLevel) {
          setHighestUnlockedLevel(me.currentLevel);
          setLevelNumber(me.currentLevel);
        }
        if (me.completedLevels) setCompletedLevels(me.completedLevels);
        if (me.totalScore) setScore(me.totalScore);
        if (me.boosterInventory) setBoosterInventory(me.boosterInventory);
      }
    }
    syncProfile();

    // Initial path sync
    syncRouteFromPath(window.location.pathname);

    // Browser back/forward navigation support
    const handlePopState = () => {
      syncRouteFromPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard Shortcuts (PDF Section 52)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in form inputs
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.key === 'Escape') {
        if (isPauseOpen) {
          setIsPauseOpen(false);
        } else if (currentView === 'game' && !isLevelCompleteOpen && !isLevelFailedOpen) {
          setIsPauseOpen(true);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (currentView === 'game' && !isLevelCompleteOpen) {
          loadLevel(levelNumber, levelConfig?.isDaily ? levelConfig : null);
        }
      } else if (e.code === 'Space' || e.key === 'c' || e.key === 'C') {
        if (currentView === 'game' && !isPauseOpen && !isLevelCompleteOpen && !isLevelFailedOpen) {
          e.preventDefault();
          handleSwapBubbles();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isPauseOpen, isLevelCompleteOpen, isLevelFailedOpen, levelNumber, levelConfig, currentBubble, nextBubble]);

  // Initialize level
  const loadLevel = async (num, customConfig = null) => {
    let config = customConfig;
    if (!config) {
      if (typeof num === 'string' && num.includes('Daily')) {
        const match = num.match(/\d+/);
        const day = match ? parseInt(match[0], 10) : 284;
        config = getDailyChallengeDefinition(day);
      } else {
        config = getLevelDefinition(typeof num === 'number' ? num : 1);
      }
    }

    // Deep-clone boardLayout to ensure clean independent grid state on every restart
    const clonedBoard = config.boardLayout
      ? config.boardLayout.map(row => row ? row.map(cell => (typeof cell === 'object' && cell !== null ? { ...cell } : cell)) : [])
      : [];

    const activeConfig = {
      ...config,
      boardLayout: clonedBoard
    };

    setSessionInstanceId(prev => prev + 1);
    setLevelNumber(num);
    setLevelConfig(activeConfig);
    setShotsRemaining(activeConfig.shots);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setBubblesPoppedCount(0);
    setRescuedCount(0);
    setBoostersUsed([]);
    setAimGuideActive(false);
    setMascotReaction('idle');
    historyRef.current = [];
    liveGridRef.current = clonedBoard.map(r => r ? [...r] : []);
    setBoardRestoreTrigger(null);

    const queue = config.bubbleQueue || ['red', 'blue', 'green', 'yellow'];
    setCurrentBubble(queue[0] || 'red');
    setNextBubble(queue[1] || 'blue');
    setQueueIndex(2);

    setIsLevelCompleteOpen(false);
    setIsLevelFailedOpen(false);
    setIsPauseOpen(false);
    setIsDailyChallengeOpen(false);
    setHintMessage(null);
    setCurrentView('game');

    const routePath = typeof num === 'number' ? `/game/${num}` : '/daily-challenge';
    if (window.location.pathname !== routePath) {
      window.history.pushState(null, '', routePath);
    }

    if (typeof num === 'number') {
      const sessionRes = await gameService.startSession(num);
      if (sessionRes && sessionRes.sessionToken) {
        setSessionToken(sessionRes.sessionToken);
      }
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

  const handleShotFired = (currentGridSnapshot) => {
    const gridToSave = currentGridSnapshot || liveGridRef.current;
    historyRef.current.push({
      shotsRemaining,
      score,
      combo,
      currentBubble,
      nextBubble,
      rescuedCount,
      grid: gridToSave ? gridToSave.map(r => r ? [...r] : []) : null
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

  const handleBoardStateChange = async (newGrid, deltaStats = {}) => {
    liveGridRef.current = newGrid;
    const currentScore = score + (deltaStats.pointsEarned || 0);
    const currentRescued = rescuedCount + (deltaStats.newlyRescued || 0);

    const isComplete = checkObjectiveCompletion({
      objective: levelConfig.objective,
      grid: newGrid,
      score: currentScore,
      rescuedCount: currentRescued,
      colorHuntCount: bubblesPoppedCount
    });

    if (isComplete) {
      const earnedStars = calculateStars(currentScore, levelConfig.starThresholds);

      setCompletedLevels(prev => {
        const existing = prev.find(l => l.levelNumber === levelNumber);
        if (existing) {
          return prev.map(l => l.levelNumber === levelNumber
            ? { ...l, stars: Math.max(l.stars, earnedStars), score: Math.max(l.score, currentScore) }
            : l
          );
        }
        return [...prev, { levelNumber, stars: earnedStars, score: currentScore }];
      });

      if (levelConfig.isDaily) {
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        const prevDate = localStorage.getItem('bubble_blast_daily_last_date');
        let currentStreak = parseInt(localStorage.getItem('bubble_blast_daily_streak') || '0', 10);

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (prevDate === yesterday) {
          currentStreak += 1;
        } else if (prevDate !== todayKey) {
          currentStreak = 1;
        }
        localStorage.setItem('bubble_blast_daily_last_date', todayKey);
        localStorage.setItem('bubble_blast_daily_streak', currentStreak.toString());

        const prevBest = parseInt(localStorage.getItem('bubble_blast_daily_best_score') || '0', 10);
        if (currentScore > prevBest) {
          localStorage.setItem('bubble_blast_daily_best_score', currentScore.toString());
        }

        // Grant daily bounty: +500 Coins & +1 Rainbow booster
        setScore(s => s + 500);
        setBoosterInventory(prev => ({
          ...prev,
          rainbow: (prev.rainbow || 0) + 1
        }));
      } else if (typeof levelNumber === 'number' && levelNumber >= highestUnlockedLevel) {
        setHighestUnlockedLevel(levelNumber + 1);
      }

      setMascotReaction('victory');
      audioManager.playLevelCompleteSound();
      setIsLevelCompleteOpen(true);

      if (sessionToken && typeof levelNumber === 'number') {
        await gameService.completeSession({
          sessionToken,
          levelNumber,
          shotsUsed: levelConfig.shots - shotsRemaining,
          bubblesPopped: bubblesPoppedCount,
          score: currentScore,
          bestCombo,
          rescuedObjects: currentRescued,
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
    if (previous.grid) {
      liveGridRef.current = previous.grid.map(r => r ? [...r] : []);
      setBoardRestoreTrigger({ grid: previous.grid, id: Date.now() });
    }
    setHintMessage('Reverted previous shot & restored board.');
    setTimeout(() => setHintMessage(null), 3000);
  };

  const handleHint = () => {
    audioManager.playButtonClick();
    const activeGrid = liveGridRef.current || levelConfig.boardLayout;
    const hint = findRecommendedHint({
      currentBubble,
      grid: activeGrid,
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
      className={`game-viewport ${currentView === 'game' ? 'is-game-view' : ''}`}
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: currentView === 'game' ? '0' : '0.35rem 0.6rem',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Ambient Floating Bubble Atmosphere */}
      {currentView !== 'game' && <AmbientBubbles count={16} />}

      {/* Top Universal Navbar / In-Game Arcade HUD */}
      {currentView === 'game' ? (
        <ArcadeTopHUD
          levelNumber={levelNumber}
          score={score}
          starThresholds={levelConfig.starThresholds}
          objective={levelConfig.objective}
          rescuedCount={rescuedCount}
          combo={combo}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onOpenSettings={() => {
            audioManager.playButtonClick();
            setIsSettingsOpen(true);
          }}
          onOpenPause={() => {
            audioManager.playButtonClick();
            setIsPauseOpen(true);
          }}
          onOpenMap={() => {
            audioManager.playButtonClick();
            setIsLevelSelectOpen(true);
          }}
        />
      ) : (
        <header className="glass-panel app-header">
          {/* Brand */}
          <div
            className="header-brand-container"
            onClick={() => {
              audioManager.playButtonClick();
              setCurrentView('landing');
            }}
          >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 60%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fef3c7',
              flexShrink: 0
            }}
          >
            <Sparkles size={15} color="#78350f" />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h1 className="header-brand-title">
              {GAME_NAME}
            </h1>
            <span className="header-brand-subtitle">
              {currentView === 'game' ? `Lvl ${levelNumber} (${levelConfig.difficulty.toUpperCase()})` : 'Dragon Pop Edition'}
            </span>
          </div>
        </div>

        {/* IN-GAME ACTIVE HUD: Always front and center so score & shots are 100% visible together */}
        {currentView === 'game' && (
          <div className="header-hud-container">
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
              <span><strong style={{ fontSize: '0.88rem' }}>{shotsRemaining}</strong></span>
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
              <span><strong style={{ fontSize: '0.88rem' }}>{score.toLocaleString()}</strong></span>
            </div>

            {/* Mission Objective (Rescue target or desktop description) */}
            {levelConfig.objective.type === 'rescue' ? (
              <div
                className="hud-pill"
                style={{
                  borderColor: 'rgba(16, 185, 129, 0.45)',
                  color: '#34d399'
                }}
                title={levelConfig.objective.description}
              >
                <span>🦕</span>
                <span><strong>{rescuedCount}/{levelConfig.objective.target}</strong></span>
              </div>
            ) : (
              <div
                className="hud-pill desktop-only-objective"
                style={{
                  borderColor: 'rgba(16, 185, 129, 0.45)',
                  color: '#34d399'
                }}
                title={levelConfig.objective.description}
              >
                <span>🎯</span>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{levelConfig.objective.description}</span>
              </div>
            )}

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

        {/* Global Desktop Navigation Controls (Section 78) */}
        <div className="desktop-nav-controls">
          {currentView === 'game' ? (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                navigateTo('/');
              }}
              className="cartoon-btn"
              style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem', background: '#334155', color: '#f8fafc' }}
              title="Home"
            >
              <Home size={14} /> <span className="nav-btn-text">Home</span>
            </button>
          ) : (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                loadLevel(highestUnlockedLevel || levelNumber || 1);
              }}
              className="cartoon-btn btn-gold"
              style={{ padding: '0.32rem 0.7rem', fontSize: '0.8rem' }}
            >
              <Play size={14} fill="currentColor" /> <span className="nav-btn-text">Play</span>
            </button>
          )}

          <button
            onClick={() => {
              audioManager.playButtonClick();
              navigateTo('/levels');
            }}
            className="cartoon-btn btn-cyan"
            style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem' }}
            title="Adventure Map"
          >
            <Map size={14} /> <span className="nav-btn-text">Map</span>
          </button>

          {/* Daily Challenge Button (Section 74) */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              navigateTo('/daily-challenge');
            }}
            className="cartoon-btn btn-ruby"
            style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem' }}
            title="Daily Challenge Quest"
          >
            <Calendar size={14} /> <span className="nav-btn-text">Daily</span>
          </button>

          <button
            onClick={() => {
              audioManager.playButtonClick();
              navigateTo('/leaderboard');
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
              navigateTo('/achievements');
            }}
            className="cartoon-btn btn-purple"
            style={{ padding: '0.3rem 0.5rem' }}
            title="Achievements"
          >
            <Award size={14} />
          </button>

          {/* Help & Rules Button */}
          <button
            onClick={() => {
              audioManager.playButtonClick();
              navigateTo('/help');
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
              navigateTo('/settings');
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
                if (user) navigateTo('/dashboard');
                else navigateTo('/login');
              }}
              className="cartoon-btn btn-emerald"
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
            >
              <User size={14} /> <span className="nav-btn-text">{user ? user.name : 'Sign In'}</span>
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

        {/* Mobile Navigation Toggle (Section 78) */}
        <div className="mobile-nav-toggle">
          <button
            onClick={toggleSound}
            className="cartoon-btn"
            style={{ padding: '0.3rem', minWidth: '32px', height: '32px', borderRadius: '50%', background: soundEnabled ? 'rgba(56, 189, 248, 0.25)' : '#334155' }}
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={15} color="#38bdf8" /> : <VolumeX size={15} color="#94a3b8" />}
          </button>

          {currentView === 'game' && (
            <button
              onClick={() => {
                audioManager.playButtonClick();
                setIsPauseOpen(true);
              }}
              className="cartoon-btn"
              style={{ padding: '0.3rem', minWidth: '32px', height: '32px', borderRadius: '50%', background: '#334155', color: '#f8fafc' }}
              title="Pause Game"
            >
              <Pause size={15} />
            </button>
          )}

          <button
            onClick={() => {
              audioManager.playButtonClick();
              setIsMobileMenuOpen(prev => !prev);
            }}
            className="cartoon-btn btn-gold"
            style={{ padding: '0.3rem', minWidth: '34px', height: '32px', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Menu"
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>
      )}

      {/* Mobile Navigation Drawer (Section 78) */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#f59e0b" />
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>{GAME_NAME}</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="cartoon-btn"
              style={{ padding: '0.4rem', background: '#334155', borderRadius: '50%' }}
            >
              <X size={18} color="#f8fafc" />
            </button>
          </div>

          <div className="mobile-drawer-content">
            <div
              className="mobile-nav-item"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('/');
              }}
            >
              <Home size={20} color="#38bdf8" />
              <span>Home</span>
            </div>

            <div
              className="mobile-nav-item"
              onClick={() => {
                setIsMobileMenuOpen(false);
                loadLevel(highestUnlockedLevel || levelNumber || 1);
              }}
            >
              <Play size={20} color="#fbbf24" fill="currentColor" />
              <span>Play Level {highestUnlockedLevel || levelNumber || 1}</span>
            </div>

            <div
              className="mobile-nav-item"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('/levels');
              }}
            >
              <Map size={20} color="#34d399" />
              <span>Adventure Map</span>
            </div>

            <div
              className="mobile-nav-item"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('/daily-challenge');
              }}
            >
              <Calendar size={20} color="#f43f5e" />
              <span>Daily Challenge Quest</span>
            </div>

            <div
              className="mobile-nav-item"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('/leaderboard');
              }}
            >
              <Trophy size={20} color="#fbbf24" />
              <span>Leaderboard</span>
            </div>

            <div
              className="mobile-nav-item"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('/achievements');
              }}
            >
              <Award size={20} color="#a855f7" />
              <span>Achievements</span>
            </div>

            <div
              className="mobile-nav-item"
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (user) navigateTo('/dashboard');
                else navigateTo('/login');
              }}
            >
              <User size={20} color="#38bdf8" />
              <span>{user ? user.name : 'Sign In / Register'}</span>
            </div>

            <div
              className="mobile-nav-item"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('/help');
              }}
            >
              <HelpCircle size={20} color="#38bdf8" />
              <span>Help & Rules</span>
            </div>

            <div
              className="mobile-nav-item"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigateTo('/settings');
              }}
            >
              <Settings size={20} color="#94a3b8" />
              <span>Settings & Audio</span>
            </div>
          </div>
        </div>
      )}

      {/* Main View Router */}
      {currentView === 'landing' ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
          <LandingPage
            onPlayNow={() => loadLevel(highestUnlockedLevel || levelNumber || 1)}
            onOpenLeaderboard={() => navigateTo('/leaderboard')}
            onOpenAchievements={() => navigateTo('/achievements')}
            onOpenLevelSelect={() => navigateTo('/levels')}
            onOpenDailyChallenge={() => navigateTo('/daily-challenge')}
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
              key={`canvas_${levelNumber}_${sessionInstanceId}`}
              initialBoard={levelConfig.boardLayout}
              restoreGrid={boardRestoreTrigger}
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

            {hintMessage && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  zIndex: 20,
                  padding: '0.35rem 0.8rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: '1.5px solid #f59e0b',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  animation: 'floatWobble 2s ease-in-out infinite'
                }}
              >
                💡 {hintMessage}
              </div>
            )}
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
        onClose={() => closeModal(setIsAuthOpen)}
        onAuthSuccess={(authedUser) => {
          setUser(authedUser);
          if (authedUser.currentLevel) {
            setHighestUnlockedLevel(authedUser.currentLevel);
            setLevelNumber(authedUser.currentLevel);
          }
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
        onClose={() => closeModal(setIsDashboardOpen)}
        onLogout={() => setUser(null)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => closeModal(setIsLeaderboardOpen)}
        currentUserName={user ? user.name : 'Guest Player'}
        currentUserScore={score}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => closeModal(setIsAchievementsOpen)}
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
        onClose={() => closeModal(setIsLevelSelectOpen)}
      />

      {/* Daily Challenge Modal (Section 74 - Bonus) */}
      <DailyChallengeModal
        isOpen={isDailyChallengeOpen}
        onClose={() => closeModal(setIsDailyChallengeOpen)}
        onPlayDaily={(dailyConfig) => {
          setIsDailyChallengeOpen(false);
          loadLevel(dailyConfig.levelNumber, dailyConfig);
        }}
        user={user}
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
        objective={levelConfig?.objective}
        rescuedCount={rescuedCount}
        onNextLevel={() => {
          if (levelConfig?.isDaily) {
            setIsLevelCompleteOpen(false);
            navigateTo('/daily-challenge');
          } else {
            loadLevel(typeof levelNumber === 'number' ? levelNumber + 1 : 1);
          }
        }}
        onReplay={() => {
          if (levelConfig?.isDaily) {
            loadLevel(levelNumber, levelConfig);
          } else {
            loadLevel(levelNumber);
          }
        }}
        onLevelSelect={() => {
          setIsLevelCompleteOpen(false);
          navigateTo('/levels');
        }}
      />

      <LevelFailedModal
        isOpen={isLevelFailedOpen}
        levelNumber={levelNumber}
        objectiveDescription={levelConfig.objective.description}
        hasExtraShotsBooster={boosterInventory.extra_shots > 0}
        onRetry={() => {
          if (levelConfig?.isDaily) {
            loadLevel(levelNumber, levelConfig);
          } else {
            loadLevel(levelNumber);
          }
        }}
        onUseExtraShots={() => handleUseBooster('extra_shots')}
        onLevelSelect={() => {
          setIsLevelFailedOpen(false);
          navigateTo('/levels');
        }}
      />

      <PauseModal
        isOpen={isPauseOpen}
        levelNumber={levelNumber}
        onResume={() => setIsPauseOpen(false)}
        onRestart={() => {
          setIsPauseOpen(false);
          if (levelConfig?.isDaily) {
            loadLevel(levelNumber, levelConfig);
          } else {
            loadLevel(levelNumber);
          }
        }}
        onLevelSelect={() => {
          setIsPauseOpen(false);
          navigateTo('/levels');
        }}
      />

      {/* Settings Modal (Section 58, 59, 89) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => closeModal(setIsSettingsOpen)}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        onToggleSound={toggleSound}
        onToggleMusic={toggleMusic}
      />

      {/* Help Modal (Section 10–21, 26, 38–40, 76) */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => closeModal(setIsHelpOpen)}
      />
    </div>
  );
}
