/**
 * API Client — base HTTP client for all backend requests.
 *
 * Wraps the native Fetch API with:
 *  - Base URL injection from app config
 *  - Automatic JSON serialisation / deserialisation
 *  - Auth token attachment (reads from localStorage)
 *  - Consistent error handling — always throws an Error with `message`
 *
 * Usage:
 *   import { apiClient } from '@/services/apiClient';
 *   const data = await apiClient.get('/users/me');
 *   const result = await apiClient.post('/auth/login', { email, password });
 */
import appConfig from '../config/app.config';

const BASE_URL = appConfig.apiBaseUrl;

function getAuthHeaders() {
  const token = localStorage.getItem('portify-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }

  return data;
}

export const apiClient = {
  get:    (path)              => request('GET',    path),
  post:   (path, body)        => request('POST',   path, body),
  put:    (path, body)        => request('PUT',    path, body),
  patch:  (path, body)        => request('PATCH',  path, body),
  delete: (path)              => request('DELETE', path),
};
