'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { authApi } from '@/lib/api/auth'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AxiosError } from 'axios'

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

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              name="username"
              placeholder="Username"
              required
              disabled={isLoading}
              minLength={3}
              maxLength={20}
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
              disabled={isLoading}
              minLength={6}
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              disabled={isLoading}
              minLength={6}
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 