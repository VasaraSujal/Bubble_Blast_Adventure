import { apiRequest } from './apiClient';

export const leaderboardService = {
  async getLeaderboard(limit = 50) {
    try {
      const data = await apiRequest(`/leaderboard?limit=${limit}`);
      return data.leaderboard || [];
    } catch {
      // Fallback demo rankings if backend is not yet populated
      return [
        { rank: 1, player: 'DragonSlayer', score: 982450, stars: 118, levelsCompleted: 40, bestCombo: 14 },
        { rank: 2, player: 'BubbleMaster', score: 914820, stars: 112, levelsCompleted: 38, bestCombo: 12 },
        { rank: 3, player: 'StarPopper', score: 882100, stars: 108, levelsCompleted: 36, bestCombo: 11 },
        { rank: 4, player: 'ArcadeHero', score: 745300, stars: 94, levelsCompleted: 32, bestCombo: 9 },
        { rank: 5, player: 'SwiftAim', score: 689200, stars: 85, levelsCompleted: 29, bestCombo: 8 }
      ];
    }
  },

  async getMyRank() {
    try {
      const data = await apiRequest('/leaderboard/me');
      return data;
    } catch {
      return { rank: null, entry: null };
    }
  }
};

export default leaderboardService;
