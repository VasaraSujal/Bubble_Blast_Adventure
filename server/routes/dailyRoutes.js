import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @route   GET /api/daily-challenge
 * @desc    Fetch today's date-seeded daily challenge definition and player status
 * @access  Public (Guest or Authenticated)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const challenge = {
      dayNumber: dayOfYear,
      levelNumber: `Daily #${dayOfYear}`,
      date: today.toISOString().split('T')[0],
      difficulty: 'Special Event',
      targetGoal: 'Rescue 4 Dragons',
      shots: 22,
      targetScore: 2400,
      rewardCoins: 500,
      rewardBooster: 'Rainbow Bubble'
    };

    let userProgress = null;
    if (req.user) {
      userProgress = {
        userId: req.user._id,
        currentStreak: req.user.dailyStreak || 1,
        completedToday: req.user.lastDailyDate === challenge.date
      };
    }

    return res.status(200).json({
      success: true,
      challenge,
      userProgress
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch daily challenge',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/daily-challenge/complete
 * @desc    Validate and record completion of daily challenge
 * @access  Public (Guest or Authenticated)
 */
router.post('/complete', optionalAuth, async (req, res) => {
  try {
    const { score = 0, shotsRemaining = 0, rescuedCount = 0 } = req.body;
    const todayKey = new Date().toISOString().split('T')[0];

    let awardedBounty = {
      coins: 500,
      booster: 'rainbow'
    };

    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (user.lastDailyDate === yesterday) {
          user.dailyStreak = (user.dailyStreak || 0) + 1;
        } else if (user.lastDailyDate !== todayKey) {
          user.dailyStreak = 1;
        }
        user.lastDailyDate = todayKey;
        user.totalScore = (user.totalScore || 0) + 500 + score;

        if (!user.boosterInventory) {
          user.boosterInventory = { extra_shots: 3, aim_guide: 3, bomb: 2, rainbow: 2, shuffle: 3 };
        }
        user.boosterInventory.rainbow = (user.boosterInventory.rainbow || 0) + 1;

        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Daily challenge completed and bounty awarded!',
      reward: awardedBounty,
      score,
      date: todayKey
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to complete daily challenge',
      error: error.message
    });
  }
});

export default router;
