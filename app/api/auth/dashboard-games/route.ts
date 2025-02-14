import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get all possible token variations from cookies
    const cookieStore = await cookies();
    const possibleTokens = [
      cookieStore.get('access_token')?.value,
      cookieStore.get('token')?.value,
      cookieStore.get('auth_token')?.value,
      cookieStore.get('authToken')?.value
    ];

    // Find first valid token
    const authToken = possibleTokens.find(token => token);

    if (!authToken) {
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
        response = await fetch('https://serverhub.biz/games/list', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        if (response.ok) break;

        // If unauthorized or forbidden, no point in retrying
        if (response.status === 401 || response.status === 403) break;

        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        retryCount++;
        if (retryCount === maxRetries) throw fetchError;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!response?.ok) {
      const text = await response?.text();
      console.error('API Error Response:', text);
      
      if (response?.status === 403 || response?.status === 401) {
        return NextResponse.json(
          { error: 'Session expired. Please login again.' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch game balances' },
        { status: response?.status || 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Game balances error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 