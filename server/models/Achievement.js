import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  category: {
    type: String,
    enum: ['popping', 'progression', 'skill', 'rescue', 'score'],
    default: 'progression'
  },
  requirement: {
    metric: { type: String, required: true }, // e.g., 'bubblesPopped', 'levelsCompleted', 'totalStars', 'bestCombo'
    threshold: { type: Number, required: true }
  },
  rewardCoins: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

const userAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  achievementKey: {
    type: String,
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userAchievementSchema.index({ userId: 1, achievementKey: 1 }, { unique: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);
export const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

export default {
  Achievement,
  UserAchievement
};
