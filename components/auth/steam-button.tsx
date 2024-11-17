// components/auth/steam-button.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { authApi } from '@/lib/api/auth'
import { useToast } from '@/hooks/use-toast'

export function SteamButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSteamLogin() {
    setIsLoading(true)
    try {
      const { url } = await authApi.getSteamAuthUrl()
      window.location.href = url
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate Steam login',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="secondary"
      className="w-full"
      onClick={handleSteamLogin}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Sign in with Steam'}
    </Button>
  )
}