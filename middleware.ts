// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/', 
  '/auth/login',
  '/auth/steam/callback'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.includes(pathname) || 
      pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  const hasAuthTokens = request.cookies.has('auth-tokens')

  if (!hasAuthTokens) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}