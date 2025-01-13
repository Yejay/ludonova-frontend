// app/(auth)/steam-callback/page.tsx
'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { authApi } from '@/lib/api/auth'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

function SteamCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    async function handleSteamCallback() {
      try {
        // Log the search params
        console.log('Steam callback params:', 
          Object.fromEntries(searchParams.entries()))
        
        const response = await authApi.handleSteamCallback(searchParams)
        console.log('Steam auth response:', response)
        
        if (!response.tokens || !response.tokens.refreshToken) {
          throw new Error('Invalid authentication response')
        }

        login(response.user, response.tokens)
        router.replace('/dashboard')
      } catch (error) {
        console.error('Steam authentication error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        
        toast({
          title: 'Authentication Failed',
          description: error instanceof Error 
            ? error.message 
            : 'Failed to authenticate with Steam. Please try again.',
          variant: 'destructive',
        })
        setTimeout(() => router.replace('/auth/login'), 2000)
      }
    }

    if (searchParams.size > 0) {
      handleSteamCallback()
    } else {
      router.replace('/auth/login')
    }
  }, [searchParams, login, router, toast])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-lg">Authenticating with Steam...</p>
        <p className="text-sm text-muted-foreground">Please wait while we complete your login</p>
      </div>
    </div>
  )
}

export default function SteamCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <SteamCallbackContent />
    </Suspense>
  )
}