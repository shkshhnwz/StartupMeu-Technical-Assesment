import apiClient from '../../../api/apiClient';

export const authService = {
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response;
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  },

  async testRoleAccess(role) {
    const response = await apiClient.get(`/auth/test/${role}`);
    return response.data;
  }
};
