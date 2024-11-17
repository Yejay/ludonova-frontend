// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define paths that don't require authentication
const publicPaths = ['/', '/login', '/steam-callback']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  if (publicPaths.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check for auth token
  const hasAuthTokens = request.cookies.has('auth-tokens')
  
  // If no token is present and the path isn't public, redirect to login
  if (!hasAuthTokens) {
    const loginUrl = new URL('/login', request.url)
    // Add the current path as a redirect parameter
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}