import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null indicates anonymous / guest session
  },
  guestId: {
    type: String,
    default: null
  },
  levelNumber: {
    type: Number,
    required: true
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  startedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  shotsUsed: {
    type: Number,
    default: 0
  },
  bubblesPopped: {
    type: Number,
    default: 0
  },
  rescuedObjects: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  stars: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  bestCombo: {
    type: Number,
    default: 0
  },
  boostersUsed: {
    type: [String],
    default: []
  },
  completed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'abandoned', 'flagged'],
    default: 'active'
  },
  flagReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const GameSession = mongoose.model('GameSession', gameSessionSchema);
export default GameSession;
