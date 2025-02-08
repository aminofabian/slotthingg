import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, whitelabel_admin_uuid } = body;

    const loginResponse = await fetch('https://serverhub.biz/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        whitelabel_admin_uuid
      })
    });

    const data = await loginResponse.json();

    if (!loginResponse.ok) {
      return NextResponse.json(
        { error: data.message || data.detail || 'Login failed' },
        { status: loginResponse.status }
      );
    }

    // Create response with user data
    const responseData = {
      success: true,
      user: {
        id: data.pk,
        username: data.username,
        role: data.role,
        last_login: data.last_login
      }
    };

    // Create response object
    const response = NextResponse.json(responseData);
    
    // Set the auth token in an HTTP-only cookie
    response.headers.set(
      'Set-Cookie',
      `token=${data.auth_token.access}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 