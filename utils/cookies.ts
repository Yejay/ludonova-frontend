// utils/cookies.ts
import Cookies from 'js-cookie'
import type { AuthTokens, User } from '@/types/auth'

export const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth-tokens',
  USER: 'auth-user'
} as const

function isValidJWT(token: string): boolean {
  return typeof token === 'string' && token.split('.').length === 3;
}

export const cookies = {
  setTokens: (tokens: AuthTokens) => {
    // Validate tokens before saving
    if (!tokens.accessToken || !isValidJWT(tokens.accessToken)) {
      console.error('Invalid access token format:', tokens.accessToken);
      return;
    }
    if (!tokens.refreshToken || !isValidJWT(tokens.refreshToken)) {
      console.error('Invalid refresh token format:', tokens.refreshToken);
      return;
    }

    console.debug('Saving tokens to cookies:', {
      accessTokenPreview: `${tokens.accessToken.substring(0, 10)}...`,
      refreshTokenPreview: `${tokens.refreshToken.substring(0, 10)}...`
    });

    Cookies.set(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens), {
      expires: 30, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  },

  setUser: (user: User) => {
    console.debug('Saving user to cookies:', { username: user.username });
    Cookies.set(STORAGE_KEYS.USER, JSON.stringify(user), {
      expires: 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  },

  getTokens: (): AuthTokens | null => {
    const tokensStr = Cookies.get(STORAGE_KEYS.AUTH_TOKENS)
    if (!tokensStr) {
      console.debug('No tokens found in cookies');
      return null;
    }

    try {
      const tokens = JSON.parse(tokensStr) as AuthTokens;
      if (!tokens.accessToken || !isValidJWT(tokens.accessToken)) {
        console.error('Invalid access token in cookies');
        return null;
      }
      return tokens;
    } catch (error) {
      console.error('Error parsing tokens from cookies:', error);
      return null;
    }
  },

  getUser: (): User | null => {
    const userStr = Cookies.get(STORAGE_KEYS.USER)
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from cookies:', error);
      return null;
    }
  },

  clearAuth: () => {
    console.debug('Clearing auth cookies');
    Cookies.remove(STORAGE_KEYS.AUTH_TOKENS)
    Cookies.remove(STORAGE_KEYS.USER)
  }
}