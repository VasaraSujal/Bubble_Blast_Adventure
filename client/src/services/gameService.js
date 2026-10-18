import { apiRequest } from './apiClient';

export const gameService = {
  async startSession(levelNumber) {
    try {
      const data = await apiRequest('/games/start', {
        method: 'POST',
        body: JSON.stringify({ levelNumber })
      });
      return data;
    } catch (err) {
      // Graceful local fallback session if offline or backend cold
      return {
        sessionToken: 'local_session_' + Date.now(),
        startedAt: new Date().toISOString(),
        levelNumber
      };
    }
  },

  async completeSession(payload) {
    try {
      const data = await apiRequest('/games/complete', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return data;
    } catch (err) {
      return {
        success: true,
        offline: true,
        validatedResults: {
          score: payload.score,
          stars: payload.stars || 1,
          shotsUsed: payload.shotsUsed,
          completed: payload.completed
        }
      };
    }
  },

  async getHistory() {
    try {
      const data = await apiRequest('/games/history');
      return data.history || [];
    } catch {
      return [];
    }
  },

  async getPlayerProgress() {
    try {
      const data = await apiRequest('/player/progress');
      return data.player;
    } catch {
      return null;
    }
  }
};

export default gameService;
