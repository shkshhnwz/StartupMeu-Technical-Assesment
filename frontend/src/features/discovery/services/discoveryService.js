import apiClient from '../../../api/apiClient';

export const discoveryService = {
  async getOpportunities(params = {}) {
    const response = await apiClient.get('/opportunities', { params });
    return response.data;
  },

  async getOpportunityById(id) {
    const response = await apiClient.get(`/opportunities/${id}`);
    return response.data.business;
  }
};
