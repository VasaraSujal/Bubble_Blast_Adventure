import express from 'express';
import { Achievement, UserAchievement } from '../models/Achievement.js';
import { requireAuth } from '../middleware/auth.js';
import { seedAchievementsIfEmpty, INITIAL_ACHIEVEMENTS } from '../utils/achievementChecker.js';

const router = express.Router();

/**
 * @route   GET /api/achievements
 * @desc    Get all available game achievements
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    await seedAchievementsIfEmpty();
    let achievements = await Achievement.find({}).sort({ category: 1, 'requirement.threshold': 1 });

    if (!achievements || achievements.length === 0) {
      achievements = INITIAL_ACHIEVEMENTS;
    }

    return res.json({
      success: true,
      total: achievements.length,
      achievements
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve achievements',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/achievements/me
 * @desc    Get unlocked achievements for authenticated player
 * @access  Private
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const unlocked = await UserAchievement.find({ userId: req.user._id });
    const unlockedMap = {};
    unlocked.forEach(u => {
      unlockedMap[u.achievementKey] = u.unlockedAt;
    });

    const all = await Achievement.find({});

    const result = all.map(ach => ({
      key: ach.key,
      title: ach.title,
      description: ach.description,
      icon: ach.icon,
      category: ach.category,
      rewardCoins: ach.rewardCoins,
      isUnlocked: Boolean(unlockedMap[ach.key]),
      unlockedAt: unlockedMap[ach.key] || null
    }));

    return res.json({
      success: true,
      unlockedCount: unlocked.length,
      totalCount: all.length,
      achievements: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user achievements',
      error: error.message
    });
  }
});

export default router;
