import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const whitelabel_admin_uuid = searchParams.get('whitelabel_admin_uuid');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

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

    // Build the URL with pagination parameters
    let apiUrl = `https://serverhub.biz/users/chat-room/?whitelabel_admin_uuid=${whitelabel_admin_uuid}&request_type=recent_messages`;
    
    // Add pagination parameters if provided
    if (page && page !== '1') {
      apiUrl += `&page=${page}`;
    }
    
    if (limit && limit !== '10') {
      apiUrl += `&limit=${limit}`;
    }

    console.log(`Proxying request to: ${apiUrl}`);

    // Forward the request to the external API
    const response = await fetch(
      apiUrl,
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
        { error: 'Failed to fetch chat history', status: response.status },
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