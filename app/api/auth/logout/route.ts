import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    const response = await fetch('https://serverhub.biz/users/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.message || data.detail || 'Logout failed' },
        { status: response.status }
      );
    }

    // Create response
    const apiResponse = NextResponse.json({ success: true });
    
    // Clear the auth cookie by setting it to expire immediately
    apiResponse.headers.set(
      'Set-Cookie',
      'token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    );

    return apiResponse;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 