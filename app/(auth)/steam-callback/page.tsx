// app/(auth)/steam-callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { authApi } from '@/lib/api/auth'
import { useToast } from '@/hooks/use-toast'

export default function SteamCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    async function handleSteamCallback() {
      try {
        if (!searchParams?.size) {
          throw new Error('No parameters received from Steam')
        }

        const response = await authApi.handleSteamCallback(searchParams)
        login(response.user, response.tokens)
        router.push('/dashboard')
      } catch (error) {
        console.error('Steam authentication error:', error)
        toast({
          title: 'Authentication Failed',
          description: 'Failed to authenticate with Steam. Please try again.',
          variant: 'destructive',
        })
        router.push('/login')
      }
    }

    handleSteamCallback()
  }, [searchParams, login, router, toast])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Authenticating with Steam...</h1>
        <p className="text-muted-foreground">Please wait while we complete your sign in.</p>
      </div>
    </div>
  )
}