'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { authApi } from '@/lib/api/auth'
import { GamepadIcon, Loader2, Dices, Trophy, Target, Sword, Gamepad2, Joystick } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AxiosError } from 'axios'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string

      if (password !== confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        })
        return
      }

      const response = await authApi.register({
        username: formData.get('username') as string,
        password: password,
        email: formData.get('email') as string,
      })
      
      // Log the user in after successful registration
      login(response.user, response.tokens)
      router.push('/dashboard')
    } catch (error) {
      const message = error instanceof AxiosError 
        ? error.response?.data?.message || 'Failed to register'
        : 'Failed to register'
        
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
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
              Join LudoNova
            </h1>
            <p className="text-xl text-muted-foreground">
              Create an account to start your gaming journey
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={onSubmit} className="space-y-4 bg-card/95 backdrop-blur-sm p-8 rounded-lg border shadow-lg">
            <div className="space-y-2">
              <Input
                name="username"
                placeholder="Username"
                required
                disabled={isLoading}
                minLength={3}
                maxLength={50}
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                required
                disabled={isLoading}
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
                disabled={isLoading}
                minLength={6}
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                required
                disabled={isLoading}
                minLength={6}
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>
            <Button 
              className="w-full bg-primary/90 hover:bg-primary" 
              type="submit" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="text-primary hover:text-primary/90 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 