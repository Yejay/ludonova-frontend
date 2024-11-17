// components/auth/auth-provider.tsx
'use client'

import { createContext, useCallback, useMemo, useState } from 'react'
import type { User, AuthTokens } from '@/types/auth'

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  login: (user: User, tokens: AuthTokens) => void
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)

  const login = useCallback((user: User, tokens: AuthTokens) => {
    setUser(user)
    setTokens(tokens)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setTokens(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      tokens,
      login,
      logout,
      isAuthenticated: !!user && !!tokens,
    }),
    [user, tokens, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}