import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, whitelabel_admin_uuid } = body;

    // Get the auth token from the cookie
    const token = (await cookies()).get('token')?.value;

    console.log('Request payload:', { email, whitelabel_admin_uuid, hasToken: !!token });

    const response = await fetch('https://serverhub.biz/users/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        email,
        whitelabel_admin_uuid
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('Raw response:', data);

    let responseData;
    try {
      responseData = JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse response:', data);
      return NextResponse.json(
        { error: 'Invalid server response' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.message || responseData.detail || 'Request failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 