import { apiRequest } from './apiClient';

export const authService = {
  async register({ name, email, password, confirmPassword }) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword })
    });

    if (data.token) {
      localStorage.setItem('bubble_auth_token', data.token);
      localStorage.setItem('bubble_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login({ email, password }) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.token) {
      localStorage.setItem('bubble_auth_token', data.token);
      localStorage.setItem('bubble_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe() {
    try {
      const data = await apiRequest('/auth/me');
      if (data.user) {
        localStorage.setItem('bubble_user', JSON.stringify(data.user));
      }
      return data.user;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('bubble_auth_token');
    localStorage.removeItem('bubble_user');
  },

  getCurrentUser() {
    const stored = localStorage.getItem('bubble_user');
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem('bubble_auth_token'));
  }
};

export default authService;
