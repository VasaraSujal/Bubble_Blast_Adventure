import express from 'express';
import Leaderboard from '../models/Leaderboard.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/leaderboard
 * @desc    Get global top leaderboard rankings
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const leaders = await Leaderboard.find({})
      .sort({ totalScore: -1, totalStars: -1, levelsCompleted: -1 })
      .limit(limit)
      .select('playerName totalScore totalStars levelsCompleted bestCombo updatedAt');

    const formattedLeaders = leaders.map((entry, index) => ({
      rank: index + 1,
      id: entry._id,
      player: entry.playerName,
      score: entry.totalScore,
      stars: entry.totalStars,
      levelsCompleted: entry.levelsCompleted,
      bestCombo: entry.bestCombo
    }));

    return res.json({
      success: true,
      count: formattedLeaders.length,
      leaderboard: formattedLeaders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/leaderboard/me
 * @desc    Get authenticated player's current rank and standing
 * @access  Private
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const myEntry = await Leaderboard.findOne({ userId: req.user._id });
    if (!myEntry) {
      return res.json({
        success: true,
        rank: null,
        entry: null,
        message: 'No games recorded yet.'
      });
    }

    // Calculate rank: count how many players have a higher score
    const higherCount = await Leaderboard.countDocuments({
      totalScore: { $gt: myEntry.totalScore }
    });

    return res.json({
      success: true,
      rank: higherCount + 1,
      entry: {
        player: myEntry.playerName,
        score: myEntry.totalScore,
        stars: myEntry.totalStars,
        levelsCompleted: myEntry.levelsCompleted,
        bestCombo: myEntry.bestCombo
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve personal rank',
      error: error.message
    });
  }
});

export default router;
