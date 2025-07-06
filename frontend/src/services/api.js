// api.js
import axios from 'axios';
import axiosRetry from 'axios-retry';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 10000,
});

axiosRetry(api, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.code === 'ECONNABORTED' || error.response?.status >= 500,
});

// Function to set user headers dynamically
export const setUserHeaders = (user) => {
  api.interceptors.request.use((config) => {
    if (user?.id) {
      config.headers['user-id'] = user.id;
      config.headers['is-admin'] = user.role === 'admin' ? 'true' : 'false';
    }
    return config;
  });
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
