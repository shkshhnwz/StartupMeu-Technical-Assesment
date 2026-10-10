import apiClient from '../../../api/apiClient';

export const dashboardService = {
  async getFounderSummary() {
    const response = await apiClient.get('/dashboard/founder');
    return response.data;
  },

  async getInvestorSummary() {
    const response = await apiClient.get('/dashboard/investor');
    return response.data;
  }
};
