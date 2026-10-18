import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/player/progress
 * @desc    Get complete progress data for authenticated user dashboard (Section 61 & 70)
 * @access  Private
 */
router.get('/progress', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Player profile not found.'
      });
    }

    return res.json({
      success: true,
      player: {
        id: user._id,
        name: user.name,
        email: user.email,
        currentLevel: user.currentLevel,
        totalScore: user.totalScore,
        totalStars: user.totalStars,
        bubblesPopped: user.bubblesPopped,
        bestCombo: user.bestCombo,
        rescuedObjects: user.rescuedObjects,
        completedLevelsCount: user.completedLevels.length,
        completedLevels: user.completedLevels,
        boosterInventory: user.boosterInventory,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve player progress',
      error: error.message
    });
  }
});

export default router;
