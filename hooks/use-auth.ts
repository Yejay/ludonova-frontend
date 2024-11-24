// hooks/use-auth.ts
'use client'

import { useContext } from 'react'
import { AuthContext } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const context = useContext(AuthContext)
  const router = useRouter()
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  // Wrap the original logout with the redirect
  const enhancedLogout = async () => {
    await context.logout()
    router.push('/') // Redirect to landing page
  }

  return {
    ...context,
    logout: enhancedLogout
  }
}