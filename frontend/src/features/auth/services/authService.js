import apiClient from '../../../api/apiClient';

export const authService = {
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response;
    } finally {
      localStorage.removeItem('token');
    }
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
