import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Helper function to check if the error is a network error
function isNetworkError(error: any) {
  return error instanceof TypeError && 
    (error.message.includes('fetch') || error.message.includes('network'));
}

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

    // Forward the request to the external API with enhanced retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 3;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        // Add timeout to the fetch request
        const controller = new AbortController();
        let timeoutId: NodeJS.Timeout | null = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        response = await fetch('https://serverhub.biz/games/list', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          cache: 'no-store',
          signal: controller.signal
        });

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (response.ok) break;

        // If unauthorized or forbidden, no point in retrying
        if (response.status === 401 || response.status === 403) break;

        // Store the response for better error reporting
        lastError = await response.text();
        
        console.warn(`Attempt ${retryCount + 1}/${maxRetries} failed:`, {
          status: response.status,
          error: lastError
        });

        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount))); // Exponential backoff
        }
      } catch (fetchError: any) {
        console.error('Fetch error:', fetchError);
        
        // Store the error for better reporting
        lastError = fetchError;

        // If it's an abort error, treat it as a timeout
        if (fetchError.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Game service timeout - Please try again' },
            { status: 504 }
          );
        }

        retryCount++;
        if (retryCount === maxRetries) break;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }

    // Handle all possible error scenarios
    if (!response?.ok) {
      console.error('Final API Error:', {
        status: response?.status,
        error: lastError
      });
      
      if (response?.status === 403 || response?.status === 401) {
        return NextResponse.json(
          { error: 'Session expired. Please login again.' },
          { status: 403 }
        );
      }

      // Network or service errors
      if (!response || isNetworkError(lastError)) {
        return NextResponse.json(
          { error: 'Game service is currently unavailable - Please try again later' },
          { status: 503 }
        );
      }

      // Other HTTP errors
      const errorMessage = response.status === 404
        ? 'Game service not found - Please try again later'
        : response.status === 429
        ? 'Too many requests - Please wait a moment'
        : response.status >= 500
        ? 'Game service error - Please try again later'
        : 'Failed to fetch game data';

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status || 500 }
      );
    }

    const data = await response.json();
    
    // Validate the response data
    if (!data || !Array.isArray(data.games)) {
      console.error('Invalid API response format:', data);
      return NextResponse.json(
        { error: 'Invalid response from game service' },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Game balances error:', error);
    
    // Determine if it's a network error
    if (isNetworkError(error)) {
      return NextResponse.json(
        { error: 'Unable to connect to game service - Please check your connection' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error - Please try again later' },
      { status: 500 }
    );
  }
} 