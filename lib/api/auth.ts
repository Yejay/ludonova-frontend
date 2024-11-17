// lib/api/auth.ts
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
    const response = await api.get<AuthResponse>('/auth/steam/return', {
      params: Object.fromEntries(params)
    })
    return response.data
  }
}