import mongoose from 'mongoose';

const completedLevelSchema = new mongoose.Schema({
  levelNumber: { type: Number, required: true },
  stars: { type: Number, required: true, min: 0, max: 3 },
  score: { type: Number, required: true, min: 0 },
  shotsUsed: { type: Number, required: true },
  bestCombo: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now }
}, { _id: false });

const boosterInventorySchema = new mongoose.Schema({
  aim_guide: { type: Number, default: 3 },
  bomb: { type: Number, default: 2 },
  rainbow: { type: Number, default: 2 },
  extra_shots: { type: Number, default: 3 },
  shuffle: { type: Number, default: 3 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email format']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  currentLevel: {
    type: Number,
    default: 1
  },
  totalScore: {
    type: Number,
    default: 0
  },
  totalStars: {
    type: Number,
    default: 0
  },
  bubblesPopped: {
    type: Number,
    default: 0
  },
  bestCombo: {
    type: Number,
    default: 0
  },
  rescuedObjects: {
    type: Number,
    default: 0
  },
  completedLevels: [completedLevelSchema],
  boosterInventory: {
    type: boosterInventorySchema,
    default: () => ({})
  },
  dailyStreak: {
    type: Number,
    default: 1
  },
  lastDailyDate: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Helper method to safely strip password hash before returning user object
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
