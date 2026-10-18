import User from '../models/User.js';
import { Achievement, UserAchievement } from '../models/Achievement.js';

export const INITIAL_ACHIEVEMENTS = [
  {
    key: 'first_pop',
    title: 'First Pop',
    description: 'Pop your very first bubble group.',
    icon: '🎈',
    category: 'popping',
    requirement: { metric: 'bubblesPopped', threshold: 1 },
    rewardCoins: 50
  },
  {
    key: 'bubble_beginner',
    title: 'Bubble Beginner',
    description: 'Complete 5 levels successfully.',
    icon: '🌱',
    category: 'progression',
    requirement: { metric: 'levelsCompleted', threshold: 5 },
    rewardCoins: 100
  },
  {
    key: 'combo_master',
    title: 'Combo Master',
    description: 'Achieve a consecutive combo multiplier of x10.',
    icon: '🔥',
    category: 'skill',
    requirement: { metric: 'bestCombo', threshold: 10 },
    rewardCoins: 200
  },
  {
    key: 'bubble_hunter',
    title: 'Bubble Hunter',
    description: 'Pop a total of 1,000 bubbles across all levels.',
    icon: '🏹',
    category: 'popping',
    requirement: { metric: 'bubblesPopped', threshold: 1000 },
    rewardCoins: 300
  },
  {
    key: 'rescue_hero',
    title: 'Rescue Hero',
    description: 'Free 25 baby dragons trapped behind bubbles.',
    icon: '🦕',
    category: 'rescue',
    requirement: { metric: 'rescuedObjects', threshold: 25 },
    rewardCoins: 350
  },
  {
    key: 'star_collector',
    title: 'Star Collector',
    description: 'Accumulate 50 stars across completed levels.',
    icon: '⭐',
    category: 'progression',
    requirement: { metric: 'totalStars', threshold: 50 },
    rewardCoins: 400
  },
  {
    key: 'bubble_legend',
    title: 'Bubble Legend',
    description: 'Surpass 100,000 total score across all levels.',
    icon: '👑',
    category: 'score',
    requirement: { metric: 'totalScore', threshold: 100000 },
    rewardCoins: 500
  },
  {
    key: 'level_master',
    title: 'Level Master',
    description: 'Conquer all 40 primary campaign levels!',
    icon: '🏆',
    category: 'progression',
    requirement: { metric: 'levelsCompleted', threshold: 40 },
    rewardCoins: 1000
  },
  {
    key: 'centurion_popper',
    title: 'Centurion Popper',
    description: 'Pop 250 bubbles in single sessions.',
    icon: '⚡',
    category: 'popping',
    requirement: { metric: 'bubblesPopped', threshold: 250 },
    rewardCoins: 150
  },
  {
    key: 'dragon_guardian',
    title: 'Dragon Guardian',
    description: 'Rescue 10 baby dragons.',
    icon: '🛡️',
    category: 'rescue',
    requirement: { metric: 'rescuedObjects', threshold: 10 },
    rewardCoins: 200
  }
];

/**
 * Seeds initial achievements into database if they do not exist
 */
export const seedAchievementsIfEmpty = async () => {
  try {
    const count = await Achievement.countDocuments();
    if (count === 0) {
      await Achievement.insertMany(INITIAL_ACHIEVEMENTS);
      console.log('Seeded 10 core achievements into database.');
    }
  } catch (error) {
    console.error('Error seeding achievements:', error.message);
  }
};

/**
 * Evaluates player metrics and unlocks achievements
 */
export const checkAndUnlockAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    // Ensure achievements are seeded
    await seedAchievementsIfEmpty();

    const allAchievements = await Achievement.find({});
    const unlockedList = await UserAchievement.find({ userId });
    const unlockedKeys = new Set(unlockedList.map(u => u.achievementKey));

    const newlyUnlocked = [];

    for (const ach of allAchievements) {
      if (unlockedKeys.has(ach.key)) continue;

      let playerMetricValue = 0;
      switch (ach.requirement.metric) {
        case 'bubblesPopped':
          playerMetricValue = user.bubblesPopped;
          break;
        case 'levelsCompleted':
          playerMetricValue = user.completedLevels.length;
          break;
        case 'totalStars':
          playerMetricValue = user.totalStars;
          break;
        case 'bestCombo':
          playerMetricValue = user.bestCombo;
          break;
        case 'rescuedObjects':
          playerMetricValue = user.rescuedObjects;
          break;
        case 'totalScore':
          playerMetricValue = user.totalScore;
          break;
        default:
          playerMetricValue = 0;
      }

      if (playerMetricValue >= ach.requirement.threshold) {
        await UserAchievement.create({
          userId: user._id,
          achievementKey: ach.key
        });
        newlyUnlocked.push({
          key: ach.key,
          title: ach.title,
          description: ach.description,
          icon: ach.icon,
          rewardCoins: ach.rewardCoins
        });
      }
    }

    return newlyUnlocked;
  } catch (err) {
    console.error('Achievement evaluation error:', err.message);
    return [];
  }
};

export default {
  INITIAL_ACHIEVEMENTS,
  seedAchievementsIfEmpty,
  checkAndUnlockAchievements
};
