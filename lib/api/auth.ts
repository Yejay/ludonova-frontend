// lib/api/auth.ts
import { api } from './client'
import type { AuthResponse, LoginCredentials } from '@/types/auth'

export interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      login: credentials.username,
      password: credentials.password
    })
    return response.data
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials)
    return response.data
  },

  async verifyEmail(email: string, code: string): Promise<void> {
    await api.post('/auth/verify-email', null, {
      params: { email, code }
    })
  },

  async resendVerification(email: string): Promise<void> {
    await api.post('/auth/resend-verification', null, {
      params: { email }
    })
  },

  async getSteamAuthUrl(): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>('/auth/steam/login')
    return response.data
  },

  async handleSteamCallback(params: URLSearchParams): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/steam/return', {
      params: Object.fromEntries(params.entries())
    })
    return response.data
  }
}