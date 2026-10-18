import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  playerName: {
    type: String,
    required: true
  },
  totalScore: {
    type: Number,
    required: true,
    default: 0,
    index: -1
  },
  totalStars: {
    type: Number,
    default: 0
  },
  levelsCompleted: {
    type: Number,
    default: 0
  },
  bestCombo: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
export default Leaderboard;
