import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './src/auth'

export default async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard, /login)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register']
  const isPublicPath = publicPaths.includes(path)

  // Get session
  const session = await auth()

  // If user is not authenticated and trying to access protected route
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  // If user is authenticated and trying to access login/register pages
  if (session && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  // If user is authenticated and on landing page, redirect to dashboard
  if (session && path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  // Add pathname to headers for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-next-pathname', path)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}