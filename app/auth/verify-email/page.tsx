'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GamepadIcon, Loader2, Dices, Trophy, Target, Sword, Gamepad2, Joystick, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { authApi } from '@/lib/api/auth'
import { cn } from '@/lib/utils'
import { AxiosError } from 'axios'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'input' | 'verifying' | 'success' | 'error'>('input')
  const [message, setMessage] = useState('')
  const [code, setCode] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const email = searchParams.get('email')

  useEffect(() => {
    if (!email) {
      setStatus('error')
      setMessage('No email provided')
    }
  }, [email])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email) return

    setStatus('verifying')
    try {
      await authApi.verifyEmail(email, code)
      setStatus('success')
      setMessage('Email verified successfully')
      
      toast({
        title: 'Success',
        description: 'Your email has been verified. You can now log in.',
        variant: 'default',
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error) {
      setStatus('error')
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || 'Verification failed'
        : 'Verification failed'
      
      setMessage(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    }
  }

  async function handleResendVerification() {
    if (!email) return
    
    setStatus('verifying')
    try {
      await authApi.resendVerification(email)
      setStatus('input')
      setCode('')
      toast({
        title: 'Success',
        description: 'A new verification code has been sent to your email.',
        variant: 'default',
      })
    } catch (error) {
      setStatus('error')
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || 'Failed to resend verification code'
        : 'Failed to resend verification code'
      
      setMessage(message)
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    }
  }

  // Array of background icons to create pattern
  const backgroundIcons = [
    GamepadIcon, Dices, Trophy, Target, Sword, Gamepad2, Joystick
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.02]">
        <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-6 gap-8 p-8">
          {Array.from({ length: 48 }).map((_, index) => {
            const Icon = backgroundIcons[index % backgroundIcons.length]
            const rotation = (index * 45) % 360
            const opacity = 0.5 + ((index % 3) * 0.2)
            
            return (
              <div 
                key={index}
                className={cn(
                  "transition-transform duration-1000 ease-in-out",
                  index % 2 === 0 ? "animate-pulse" : "animate-none"
                )}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  opacity
                }}
              >
                <Icon className="w-12 h-12" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full py-6">
        <div className="container">
          <Link href="/" className="flex items-center space-x-2">
            <GamepadIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              LudoNova
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Verify Your Email
            </h1>
            <p className="text-xl text-muted-foreground">
              Enter the verification code sent to your email
            </p>
          </div>

          <div className="text-center space-y-4 bg-card/95 backdrop-blur-sm p-8 rounded-lg border shadow-lg">
            {status === 'input' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    We&apos;ve sent a verification code to:
                    <br />
                    <span className="font-medium">{email}</span>
                  </p>
                  <Input
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                      setCode(value)
                    }}
                    placeholder="Enter 6-digit code"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="text-center text-2xl tracking-wider letter-spacing-1"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                  <p className="text-sm text-muted-foreground">
                    The code will expire in 15 minutes
                  </p>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Verify Email
                </Button>
              </form>
            )}

            {status === 'verifying' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <h2 className="text-2xl font-semibold">Verifying your email</h2>
                <p className="text-muted-foreground">Please wait while we verify your email address...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                <h2 className="text-2xl font-semibold text-green-500">Email Verified!</h2>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-destructive" />
                <h2 className="text-2xl font-semibold text-destructive">Verification Failed</h2>
                <p className="text-muted-foreground">{message}</p>
                <div className="space-y-4 pt-4">
                  <Button 
                    onClick={() => {
                      setStatus('input')
                      setCode('')
                    }}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={handleResendVerification}
                    variant="outline"
                    className="w-full"
                  >
                    Resend Code
                  </Button>
                  <Button 
                    onClick={() => router.push('/auth/login')}
                    variant="ghost"
                    className="w-full"
                  >
                    Return to Login
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 