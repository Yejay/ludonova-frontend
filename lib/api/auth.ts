// lib/api/auth.ts
import axios from 'axios';
import { api } from './client'
import type { AuthResponse, LoginCredentials } from '@/types/auth'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  getSteamAuthUrl: async (): Promise<{ url: string }> => {
    const response = await api.get<{ url: string }>('/auth/steam/login')
    return response.data
  },

  handleSteamCallback: async (params: URLSearchParams): Promise<AuthResponse> => {
    try {
      console.log('Steam callback params:', Object.fromEntries(params))
      const response = await api.get<AuthResponse>('/auth/steam/return', {
        params: Object.fromEntries(params)
      })
      console.log('Steam auth response:', response.data)
      return response.data
    } catch (error) {
      // Better error logging
      if (axios.isAxiosError(error)) {
        console.error('Steam API error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })
      } else {
        console.error('Steam callback error:', error)
      }
      throw error
    }
  }
}