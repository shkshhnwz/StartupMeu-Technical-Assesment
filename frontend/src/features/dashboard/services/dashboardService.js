import apiClient from '../../../api/apiClient';

export const dashboardService = {
  /**
   * Fetch founder dashboard summary metrics and recent activity
   */
  async getFounderSummary() {
    const response = await apiClient.get('/dashboard/founder');
    return response.data;
  },

  /**
   * Fetch investor dashboard summary metrics and recent activity
   */
  async getInvestorSummary() {
    const response = await apiClient.get('/dashboard/investor');
    return response.data;
  }
};
