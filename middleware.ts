// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

const publicPaths = [
  '/', 
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/steam/callback'
]

interface JWTPayload {
  sub: string;
  role: string;
  exp: number;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's an admin route
  const isAdminRoute = pathname.startsWith('/admin')

  if (publicPaths.includes(pathname) || 
      pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  const authTokens = request.cookies.get('auth-tokens')?.value

  if (!authTokens) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Additional check for admin routes
  if (isAdminRoute) {
    try {
      const { accessToken } = JSON.parse(authTokens)
      const decoded = jwtDecode<JWTPayload>(accessToken)
      
      if (decoded.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}