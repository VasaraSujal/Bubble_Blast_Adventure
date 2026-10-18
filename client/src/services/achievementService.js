import { apiRequest } from './apiClient';

export const achievementService = {
  async getAchievements() {
    try {
      const data = await apiRequest('/achievements');
      return data.achievements || [];
    } catch {
      return [];
    }
  },

  async getMyAchievements() {
    try {
      const data = await apiRequest('/achievements/me');
      return data;
    } catch {
      return { unlockedCount: 0, totalCount: 10, achievements: [] };
    }
  }
};

export default achievementService;
