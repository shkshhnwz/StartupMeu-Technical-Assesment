import apiClient from '../../../api/apiClient';

export const interestService = {
  async submitInterest(businessId, message = '') {
    const response = await apiClient.post('/interests', {
      businessId,
      message
    });
    return response.data;
  },

  async getSentInterests() {
    const response = await apiClient.get('/interests/sent');
    return response.data.interests || [];
  },

  async getReceivedInterests() {
    const response = await apiClient.get('/interests/received');
    return response.data.interests || [];
  },

  async updateInterestStatus(interestId, status) {
    const response = await apiClient.patch(`/interests/${interestId}/status`, {
      status
    });
    return response.data;
  }
};
