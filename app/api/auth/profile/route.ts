import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get the auth token from the cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward the request to the external API with retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        response = await fetch('https://serverhub.biz/users/profile/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (response.ok) break;

        // If unauthorized or forbidden, no point in retrying
        if (response.status === 401 || response.status === 403) break;

        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      } catch (error) {
        console.error(`Profile fetch attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!response?.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: response?.status || 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 