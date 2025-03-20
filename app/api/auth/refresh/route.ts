import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 401 }
      );
    }

    try {
      // Validate token with the server
      const validateResponse = await fetch('https://serverhub.biz/users/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If validation fails, clear token and return 401
      if (!validateResponse.ok) {
        const response = NextResponse.json(
          { error: 'Token validation failed' },
          { status: 401 }
        );
        response.cookies.set('token', '', { 
          maxAge: 0,
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        return response;
      }

      // If validation succeeds, return success
      return NextResponse.json({ 
        message: 'Token is valid',
        status: 'success'
      });
    } catch (error) {
      // On network errors, return 401 to trigger re-auth
      console.error('Token validation error:', error);
      return NextResponse.json(
        { error: 'Token validation failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Token validation failed' },
      { status: 401 }
    );
  }
} 