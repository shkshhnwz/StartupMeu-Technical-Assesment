import axios from 'axios';

const rawUrl = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '').trim();
const normalizedUrl = rawUrl.replace(/\/+$/, '');
const baseURL = normalizedUrl ? (normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`) : '/api';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to server. Please check your connection.'
    };
    return Promise.reject(errorData);
  }
);

export default apiClient;
