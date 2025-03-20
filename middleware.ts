import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isProtectedRoute, isAuthRoute, PROTECTED_ROUTES } from '@/lib/routes'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes and API routes
  if (pathname === '/check-email' || 
      pathname === '/forgot-password' ||
      pathname.startsWith('/api/') ||
      pathname.includes('_next') ||
      pathname.includes('favicon.ico') ||
      pathname.includes('static')) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get('token')?.value;

  // If user is not logged in and trying to access protected routes
  if (!token && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/login', request.url);
    // Only add redirect param if not already on an auth page
    if (!isAuthRoute(pathname)) {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and trying to access auth pages
  if (token && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/games/:path*',
    // Auth routes
    '/login',
    '/signup',
    '/reset-password',
    // API routes - excluding forgot-password
    '/api/auth/((?!forgot-password).)*'
  ]
}