import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const whitelabel_admin_uuid = searchParams.get('whitelabel_admin_uuid');

    if (!whitelabel_admin_uuid) {
      return NextResponse.json(
        { error: 'Missing whitelabel admin UUID' },
        { status: 400 }
      );
    }

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
    const response = await fetch(
      `https://serverhub.biz/users/chat-room/?whitelabel_admin_uuid=${whitelabel_admin_uuid}&request_type=recent_messages`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat history fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 