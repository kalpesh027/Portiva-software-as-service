/**
 * API Client — base HTTP client for all backend requests.
 *
 * Wraps Axios with:
 *  - Base URL injection from app config
 *  - Automatic JSON serialisation / deserialisation
 *  - Auth token attachment (reads from localStorage)
 *  - Consistent error handling — always throws an Error with `message`
 *
 * Usage:
 *   import apiClient from '@/services/apiClient';
 *   const data = await apiClient.get('/users/me');
 *   const result = await apiClient.post('/auth/login', { email, password });
 */
import axios from 'axios';
import appConfig from '../config/app.config';

const BASE_URL = appConfig.apiBaseUrl;

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('portify-token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  (err) => {
    const message = err?.response?.data?.message || err?.message || 'Request failed';
    const error = new Error(message);
    error.response = {
      status: err?.response?.status || null,
      data: err?.response?.data || null,
    };

    if (error.response.status === 401) {
      localStorage.removeItem('portify-token');
    }

    return Promise.reject(error);
  }
);

export default {
  get:    (path, config)       => http.get(path, config),
  post:   (path, body, config) => http.post(path, body, config),
  put:    (path, body, config) => http.put(path, body, config),
  patch:  (path, body, config) => http.patch(path, body, config),
  delete: (path, config)       => http.delete(path, config),
};

export const rawHttpClient = http;
