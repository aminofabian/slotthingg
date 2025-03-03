import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 401 }
      );
    }

    try {
      // Try to validate token with the server
      const validateResponse = await fetch('https://serverhub.biz/users/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // If validation succeeds, extend token lifetime
      if (validateResponse.ok) {
        const response = NextResponse.json({ message: 'Token refreshed successfully' });
        const cookieString = `token=${token}; Path=/; Max-Age=1209600; SameSite=Lax; Secure; HttpOnly`;
        response.headers.set('Set-Cookie', cookieString);
        return response;
      }

      // If validation fails with auth error, clear token
      if (validateResponse.status === 401 || validateResponse.status === 403) {
        const response = NextResponse.json(
          { error: 'Token validation failed' },
          { status: 401 }
        );
        response.headers.set('Set-Cookie', 'token=; Path=/; Max-Age=0; SameSite=Lax');
        return response;
      }

      // For other status codes, keep existing token
      return NextResponse.json({ message: 'Token refresh skipped' });
    } catch (error) {
      // On network errors, keep the token
      console.error('Token validation error:', error);
      return NextResponse.json({ message: 'Token refresh skipped due to network error' });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ message: 'Token refresh failed' }, { status: 500 });
  }
} 