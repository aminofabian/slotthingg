import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { old_password, password } = body;

    // Get the auth token from the cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward the request to the external API
    const response = await fetch('https://serverhub.biz/users/change-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password,
        password
      })
    });

    const data = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(data);
    } catch (error) {
      // If the response is not JSON, return the raw text
      responseData = { message: data };
    }

    // Forward the status and response from the external API
    return NextResponse.json(
      responseData,
      { status: response.status }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 