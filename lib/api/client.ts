// lib/api/client.ts
import axios from 'axios'
import type { AuthTokens } from '@/types/auth'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
  // Get tokens from where you store them (context, cookie, etc.)
  const tokens = localStorage.getItem('auth-tokens')
  if (tokens) {
    const { accessToken } = JSON.parse(tokens) as AuthTokens
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const tokens = localStorage.getItem('auth-tokens')
        if (!tokens) {
          throw new Error('No refresh token available')
        }

        const { refreshToken } = JSON.parse(tokens) as AuthTokens
        const response = await api.post<AuthTokens>('/auth/refresh', { refreshToken })
        
        // Save the new tokens
        localStorage.setItem('auth-tokens', JSON.stringify(response.data))

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
        
        return api(originalRequest)
      } catch (refreshError) {
        // Handle refresh token failure (e.g., redirect to login)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api