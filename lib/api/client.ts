// lib/api/client.ts
import axios from 'axios'
import https from 'https'
import { cookies } from '@/utils/cookies'

// Create custom HTTPS agent for development
const httpsAgent = process.env.NODE_ENV === 'development' 
  ? new https.Agent({ 
      rejectUnauthorized: false, // Allow self-signed certificates in development
    })
  : undefined;

// Ensure the API URL is set
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  console.error('NEXT_PUBLIC_API_URL is not set in environment variables');
}

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  httpsAgent,
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
  }

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
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't attempt refresh for Steam auth endpoints
    if (originalRequest.url?.includes('/auth/steam')) {
      console.error('Steam auth error:', error);
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = cookies.getTokens();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await api.post('/auth/refresh', {
          refreshToken: tokens.refreshToken,
        });

        // Save new tokens
        cookies.setTokens(response.data);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        // Clear auth and redirect to login
        cookies.clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Log detailed error information in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Response error details:', {
        status: error.response?.status,
        data: error.response?.data,
        url: originalRequest.url,
        method: originalRequest.method,
        headers: originalRequest.headers,
      });
    }

    return Promise.reject(error);
  }
);

export default api