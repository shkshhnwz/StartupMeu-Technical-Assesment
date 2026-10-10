import apiClient from '../../../api/apiClient';

export const businessService = {
  async create(listingData) {
    const response = await apiClient.post('/businesses', listingData);
    return response.data;
  },

  async getMine() {
    const response = await apiClient.get('/businesses/mine');
    return response.data.businesses;
  },

  async getById(id) {
    const response = await apiClient.get(`/businesses/${id}`);
    return response.data.business;
  },

  async update(id, listingData) {
    const response = await apiClient.patch(`/businesses/${id}`, listingData);
    return response.data.business;
  },

  async delete(id) {
    const response = await apiClient.delete(`/businesses/${id}`);
    return response;
  }
};
