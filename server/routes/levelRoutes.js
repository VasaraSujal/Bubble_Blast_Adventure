import express from 'express';
import Level from '../models/Level.js';
import { generateLevelData } from '../utils/levelGenerator.js';

const router = express.Router();

/**
 * @route   GET /api/levels
 * @desc    Get summary list of all playable levels (minimum 40 levels)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    let levels = await Level.find({ isPublished: true })
      .select('levelNumber difficulty objective shots targetScore starThresholds')
      .sort({ levelNumber: 1 });

    // If database has fewer than 40 levels, seed/generate them dynamically
    if (!levels || levels.length < 40) {
      const generatedList = [];
      for (let i = 1; i <= 40; i++) {
        const lvl = generateLevelData(i);
        generatedList.push({
          levelNumber: lvl.levelNumber,
          difficulty: lvl.difficulty,
          objective: lvl.objective,
          shots: lvl.shots,
          targetScore: lvl.targetScore,
          starThresholds: lvl.starThresholds
        });
      }
      return res.json({
        success: true,
        total: generatedList.length,
        levels: generatedList
      });
    }

    return res.json({
      success: true,
      total: levels.length,
      levels
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve levels',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/levels/:id
 * @desc    Get complete level configuration for gameplay
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const levelNumber = parseInt(req.params.id, 10);
    if (isNaN(levelNumber) || levelNumber < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level number provided.'
      });
    }

    // Try finding in DB
    let level = await Level.findOne({ levelNumber, isPublished: true });

    // If not found in DB, generate on-the-fly (allows 40+ and infinite levels)
    if (!level) {
      level = generateLevelData(levelNumber);
    }

    return res.json({
      success: true,
      level
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch level details',
      error: error.message
    });
  }
});

export default router;
