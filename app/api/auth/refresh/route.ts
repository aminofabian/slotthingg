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

    // Create response with refreshed cookie
    const response = NextResponse.json({ message: 'Token refreshed successfully' });
    
    // Extend the token validity by setting a new cookie with the same value
    const cookieString = `token=${token}; Path=/; Max-Age=604800; SameSite=Lax`;
    response.headers.set('Set-Cookie', cookieString);

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 