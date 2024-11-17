// components/auth/steam-button.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { authApi } from '@/lib/api/auth'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export function SteamButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSteamLogin() {
    if (isLoading) return
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[35px] bg-[#262626] rounded">
        <Loader2 className="h-5 w-5 animate-spin text-white" />
      </div>
    )
  }

  return (
    <button
      onClick={handleSteamLogin}
      className="w-full transition-opacity hover:opacity-90 focus:opacity-90"
      style={{ height: 35 }}
    >
      <Image
        src="https://steamcommunity.com/public/images/signinthroughsteam/sits_01.png"
        alt="Sign in through Steam"
        width={180}
        height={35}
        priority
        className="mx-auto"
      />
    </button>
  )
}