import express from 'express';
import crypto from 'crypto';
import GameSession from '../models/GameSession.js';
import User from '../models/User.js';
import Leaderboard from '../models/Leaderboard.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validateGameCompletion } from '../middleware/antiCheat.js';
import { checkAndUnlockAchievements } from '../utils/achievementChecker.js';

const router = express.Router();

/**
 * @route   POST /api/games/start
 * @desc    Initialize a secure game session
 * @access  Public (Guest or Authenticated)
 */
router.post('/start', optionalAuth, async (req, res) => {
  try {
    const { levelNumber, guestId } = req.body;

    if (!levelNumber) {
      return res.status(400).json({
        success: false,
        message: 'levelNumber is required to start a game session.'
      });
    }

    // Generate secure random session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    const session = new GameSession({
      userId: req.user ? req.user._id : null,
      guestId: req.user ? null : (guestId || 'guest_' + crypto.randomBytes(8).toString('hex')),
      levelNumber: Number(levelNumber),
      sessionToken,
      startedAt: new Date(),
      status: 'active'
    });

    await session.save();

    return res.status(201).json({
      success: true,
      message: 'Game session initialized',
      sessionId: session._id,
      sessionToken,
      levelNumber: session.levelNumber,
      startedAt: session.startedAt
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to start game session',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/games/complete
 * @desc    Submit level completion with anti-cheat & server-side validation
 * @access  Public (Guest or Authenticated)
 */
router.post('/complete', optionalAuth, async (req, res) => {
  try {
    const {
      sessionToken,
      levelNumber,
      shotsUsed = 0,
      bubblesPopped = 0,
      score = 0,
      bestCombo = 0,
      rescuedObjects = 0,
      boostersUsed = [],
      completed = true
    } = req.body;

    if (!sessionToken || levelNumber === undefined) {
      return res.status(400).json({
        success: false,
        message: 'sessionToken and levelNumber are required.'
      });
    }

    // Run Anti-Cheat & Server Validation
    const validation = await validateGameCompletion({
      sessionToken,
      userId: req.user ? req.user._id : null,
      levelNumber: Number(levelNumber),
      score: Number(score),
      shotsUsed: Number(shotsUsed),
      bubblesPopped: Number(bubblesPopped),
      bestCombo: Number(bestCombo),
      boostersUsed,
      completed: Boolean(completed)
    });

    if (!validation.isValid) {
      // Flag session in DB
      if (validation.session) {
        validation.session.status = 'flagged';
        validation.session.flagReason = validation.reason;
        await validation.session.save();
      }
      return res.status(400).json({
        success: false,
        flagged: true,
        message: 'Anti-cheat validation failed.',
        reason: validation.reason
      });
    }

    const session = validation.session;
    session.completedAt = new Date();
    session.shotsUsed = Number(shotsUsed);
    session.bubblesPopped = Number(bubblesPopped);
    session.score = validation.validatedScore;
    session.stars = validation.validatedStars;
    session.bestCombo = Number(bestCombo);
    session.rescuedObjects = Number(rescuedObjects);
    session.boostersUsed = boostersUsed;
    session.completed = Boolean(completed);
    session.status = completed ? 'completed' : 'failed';

    await session.save();

    let unlockedAchievements = [];

    // If authenticated user, update persistent player profile & stats
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.bubblesPopped += Number(bubblesPopped);
        user.rescuedObjects += Number(rescuedObjects);
        if (Number(bestCombo) > user.bestCombo) {
          user.bestCombo = Number(bestCombo);
        }

        if (completed) {
          // Check if level was already completed before
          const existingLevelIndex = user.completedLevels.findIndex(
            lvl => lvl.levelNumber === Number(levelNumber)
          );

          if (existingLevelIndex >= 0) {
            // Update if better score or more stars
            const prev = user.completedLevels[existingLevelIndex];
            if (validation.validatedScore > prev.score) {
              user.totalScore += (validation.validatedScore - prev.score);
              prev.score = validation.validatedScore;
            }
            if (validation.validatedStars > prev.stars) {
              user.totalStars += (validation.validatedStars - prev.stars);
              prev.stars = validation.validatedStars;
            }
            prev.shotsUsed = Math.min(prev.shotsUsed, Number(shotsUsed));
            prev.bestCombo = Math.max(prev.bestCombo, Number(bestCombo));
          } else {
            // New level completion
            user.completedLevels.push({
              levelNumber: Number(levelNumber),
              stars: validation.validatedStars,
              score: validation.validatedScore,
              shotsUsed: Number(shotsUsed),
              bestCombo: Number(bestCombo),
              completedAt: new Date()
            });
            user.totalScore += validation.validatedScore;
            user.totalStars += validation.validatedStars;
            if (user.currentLevel <= Number(levelNumber)) {
              user.currentLevel = Number(levelNumber) + 1;
            }
          }

          await user.save();

          // Update Global Leaderboard record
          await Leaderboard.findOneAndUpdate(
            { userId: user._id },
            {
              playerName: user.name,
              totalScore: user.totalScore,
              totalStars: user.totalStars,
              levelsCompleted: user.completedLevels.length,
              bestCombo: user.bestCombo,
              lastActive: new Date()
            },
            { upsert: true, new: true }
          );

          // Evaluate achievement triggers
          unlockedAchievements = await checkAndUnlockAchievements(user._id);
        }
      }
    }

    return res.json({
      success: true,
      message: completed ? 'Level successfully completed!' : 'Level session ended.',
      validatedResults: {
        levelNumber: Number(levelNumber),
        score: validation.validatedScore,
        stars: validation.validatedStars,
        shotsUsed: Number(shotsUsed),
        bubblesPopped: Number(bubblesPopped),
        bestCombo: Number(bestCombo),
        completed: Boolean(completed),
        unlockedAchievements
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process game completion',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/games/history
 * @desc    Get user's past game sessions
 * @access  Private
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const history = await GameSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .select('levelNumber score stars shotsUsed bubblesPopped bestCombo completed createdAt');

    return res.json({
      success: true,
      history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve game history',
      error: error.message
    });
  }
});

export default router;
