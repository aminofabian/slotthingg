import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await fetch('https://serverhub.biz/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
    } catch (error) {
      console.error('Server logout error:', error);
    }

    // Always clear the cookie and redirect to login, regardless of server response
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // Clear the auth cookie by setting it to expire immediately
    response.headers.set(
      'Set-Cookie',
      'token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    );

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Even on error, try to clear the cookie and redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set(
      'Set-Cookie',
      'token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    );
    return response;
  }
} 