import axios from 'axios';
import { STORAGE_KEYS } from '@/lib/constants';

// Compute the base URL: ensure no trailing slash, and ensure /api is present if not already in URL
const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseURL = cleanBaseUrl.endsWith('/api')
  ? cleanBaseUrl
  : `${cleanBaseUrl}/api`;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors & 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and user on 401
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      // Dispatch custom event for auth provider to respond cleanly
      window.dispatchEvent(new CustomEvent('bloodbridge:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
