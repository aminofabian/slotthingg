import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isProtectedRoute, isAuthRoute, PROTECTED_ROUTES } from '@/lib/routes'

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  console.log('Middleware processing path:', pathname);

  // Skip middleware for public routes
  if (pathname === '/check-email' || 
      pathname === '/forgot-password' ||
      pathname.startsWith('/api/auth/forgot-password')) {
    console.log('Skipping middleware for public route:', pathname);
    return NextResponse.next();
  }

  // If user is not logged in and trying to access protected routes
  if (!token && isProtectedRoute(pathname)) {
    console.log('Redirecting to login from protected route:', pathname);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and trying to access auth pages
  if (token && isAuthRoute(pathname) && 
      pathname !== '/forgot-password' && 
      pathname !== '/check-email') {
    console.log('Redirecting to dashboard from auth route:', pathname);
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