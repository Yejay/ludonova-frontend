// utils/cookies.ts
import Cookies from 'js-cookie'
import type { AuthTokens, User } from '@/types/auth'

export const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth-tokens',
  USER: 'auth-user'
} as const

export const cookies = {
  setTokens: (tokens: AuthTokens) => {
    Cookies.set(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens), {
      expires: 30, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  },

  setUser: (user: User) => {
    Cookies.set(STORAGE_KEYS.USER, JSON.stringify(user), {
      expires: 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  },

  getTokens: (): AuthTokens | null => {
    const tokens = Cookies.get(STORAGE_KEYS.AUTH_TOKENS)
    return tokens ? JSON.parse(tokens) : null
  },

  getUser: (): User | null => {
    const user = Cookies.get(STORAGE_KEYS.USER)
    return user ? JSON.parse(user) : null
  },

  clearAuth: () => {
    Cookies.remove(STORAGE_KEYS.AUTH_TOKENS)
    Cookies.remove(STORAGE_KEYS.USER)
  }
}