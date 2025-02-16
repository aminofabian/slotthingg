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

    console.log('Login response data:', {
      success: true,
      auth_token: data.auth_token ? {
        access: data.auth_token.access ? data.auth_token.access.substring(0, 10) + '...' : 'missing',
        type: typeof data.auth_token
      } : 'missing',
      user: {
        id: data.pk,
        username: data.username
      }
    });

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
    
    if (!data.auth_token?.access) {
      console.error('No access token in login response:', data);
      return NextResponse.json(
        { error: 'No access token received' },
        { status: 500 }
      );
    }

    // Set the auth token cookie with client-accessible settings
    const cookieValue = data.auth_token.access;
    const cookieString = `token=${cookieValue}; Path=/; Max-Age=604800; SameSite=Lax`;

    // Set cookie using headers for better client-side accessibility
    response.headers.set('Set-Cookie', cookieString);

    console.log('Setting auth token cookie:', {
      value: cookieValue.substring(0, 10) + '...',
      header: cookieString.substring(0, 50) + '...'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 