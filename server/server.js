import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { GAME_NAME, PORT, NODE_ENV } from './config/config.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import levelRoutes from './routes/levelRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import dailyRoutes from './routes/dailyRoutes.js';
import { seedAchievementsIfEmpty } from './utils/achievementChecker.js';
import { seedLevelsIfEmpty } from './utils/levelGenerator.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/daily-challenge', dailyRoutes);

// Health check / API Info
app.get('/api/info', (req, res) => {
  res.json({
    gameName: GAME_NAME,
    status: 'online',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me',
      '/api/levels',
      '/api/levels/:id',
      '/api/games/start',
      '/api/games/complete',
      '/api/games/history',
      '/api/leaderboard',
      '/api/leaderboard/me',
      '/api/achievements',
      '/api/achievements/me',
      '/api/player/progress'
    ]
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.send(`🚀 ${GAME_NAME} Backend API is running successfully.`);
});

// Centralized Error Handler (Never expose server stack traces in production - Section 82)
app.use((err, req, res, next) => {
  console.error(`[${GAME_NAME} Error]`, err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

// Initialize DB and launch server
const startServer = async () => {
  await connectDB();
  await seedAchievementsIfEmpty();
  await seedLevelsIfEmpty();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`[${GAME_NAME}] Backend API live at http://localhost:${PORT}`);
    });
  }
};

startServer();

export default app;
