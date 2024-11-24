// components/auth/auth-provider.tsx
'use client'
import { createContext, useCallback, useMemo, useState, useEffect } from 'react'
import { cookies } from '@/utils/cookies'
import type { User, AuthTokens } from '@/types/auth'

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  login: (user: User, tokens: AuthTokens) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(() => cookies.getUser())
  const [tokens, setTokens] = useState<AuthTokens | null>(() => cookies.getTokens())

  // Initialize state from cookies on mount
  useEffect(() => {
    const savedUser = cookies.getUser()
    const savedTokens = cookies.getTokens()
    
    if (savedUser && savedTokens) {
      setUser(savedUser)
      setTokens(savedTokens)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((user: User, tokens: AuthTokens) => {
    setUser(user)
    setTokens(tokens)
    cookies.setUser(user)
    cookies.setTokens(tokens)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setTokens(null)
    cookies.clearAuth()
  }, [])

  const value = useMemo(
    () => ({
      user,
      tokens,
      login,
      logout,
      isAuthenticated: !!user && !!tokens,
      isLoading,
    }),
    [user, tokens, login, logout, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}