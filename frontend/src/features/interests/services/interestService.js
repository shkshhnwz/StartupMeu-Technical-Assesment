import apiClient from '../../../api/apiClient';

export const interestService = {
  /**
   * Express interest in a business opportunity (Investor only)
   */
  async submitInterest(businessId, message = '') {
    const response = await apiClient.post('/interests', {
      businessId,
      message
    });
    return response.data;
  },

  /**
   * Get expressions of interest sent by the current investor
   */
  async getSentInterests() {
    const response = await apiClient.get('/interests/sent');
    return response.data.interests || [];
  },

  /**
   * Get incoming interest requests for listings owned by current founder
   */
  async getReceivedInterests() {
    const response = await apiClient.get('/interests/received');
    return response.data.interests || [];
  },

  /**
   * Accept or decline a received interest request (Founder only)
   */
  async updateInterestStatus(interestId, status) {
    const response = await apiClient.patch(`/interests/${interestId}/status`, {
      status
    });
    return response.data;
  }
};
