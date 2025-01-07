// lib/api/client.ts
import axios from 'axios'
import https from 'https'
import type { AuthTokens } from '@/types/auth'
import { cookies } from '@/utils/cookies'

// Create custom HTTPS agent for development
const httpsAgent = process.env.NODE_ENV === 'development' 
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  httpsAgent // This will bypass SSL verification in development
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  // Don't add auth headers for Steam auth endpoints
  if (config.url?.includes('/auth/steam')) {
    return config;
  }

  const tokens = cookies.getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't attempt refresh for Steam auth endpoints
    if (originalRequest.url?.includes('/auth/steam')) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = cookies.getTokens();
        if (!tokens) throw new Error('No refresh token available');
        
        // Try to refresh the token
        const response = await api.post<AuthTokens>('/auth/refresh', {
          refreshToken: tokens.refreshToken
        });

        // Save new tokens
        cookies.setTokens(response.data);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth and redirect to login
        cookies.clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api