import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['tutorial', 'beginner', 'easy', 'medium', 'hard', 'expert'],
    default: 'easy'
  },
  objective: {
    type: {
      type: String,
      enum: ['clear_all', 'rescue', 'score', 'color_hunt', 'drop'],
      default: 'clear_all'
    },
    target: { type: Number, default: 0 },
    targetColor: { type: String, default: null },
    description: { type: String, default: 'Clear all bubbles on the board' }
  },
  shots: {
    type: Number,
    required: true,
    default: 25,
    min: 5
  },
  colors: {
    type: [String],
    default: ['red', 'blue', 'green', 'yellow']
  },
  boardLayout: {
    type: [[mongoose.Schema.Types.Mixed]], // Array of rows with bubble color strings or null/object
    required: true
  },
  bubbleQueue: {
    type: [String],
    default: []
  },
  targetScore: {
    type: Number,
    default: 1000
  },
  starThresholds: {
    type: [Number],
    default: [500, 1000, 1500] // [1 Star, 2 Stars, 3 Stars]
  },
  availableBoosters: {
    type: [String],
    default: ['aim_guide', 'bomb', 'rainbow', 'extra_shots', 'shuffle']
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Level = mongoose.model('Level', levelSchema);
export default Level;
