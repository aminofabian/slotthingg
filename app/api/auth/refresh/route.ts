import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Maximum number of retries for API calls
const MAX_RETRIES = 2;

// Helper function to handle API calls with retries
async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries > 0) {
      // Wait for a short time before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 500 * (MAX_RETRIES - retries + 1)));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 401 }
      );
    }

    try {
      // Validate token with the server with retry mechanism
      const validateResponse = await fetchWithRetry(
        'https://serverhub.biz/users/profile/', 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            // Prevent caching
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      );

      // If validation fails, clear token and return 401
      if (!validateResponse.ok) {
        // Only clear the token cookie if we're sure it's an auth issue
        // For 401/403 responses, it's clearly an auth issue
        if (validateResponse.status === 401 || validateResponse.status === 403) {
          const response = NextResponse.json(
            { error: 'Token validation failed' },
            { status: 401 }
          );
          response.cookies.set('token', '', { 
            maxAge: 0,
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
          return response;
        }
        
        // For other status codes (e.g., 500, 503), it could be a temporary server issue
        // Return a specific error so the client knows not to log the user out
        return NextResponse.json(
          { error: 'Temporary server error', temporary: true },
          { status: validateResponse.status }
        );
      }

      // If validation succeeds, return success
      return NextResponse.json({ 
        message: 'Token is valid',
        status: 'success'
      });
    } catch (error) {
      console.error('Token validation error:', error);
      
      // Differentiate between network errors and auth errors
      const isNetworkError = error instanceof TypeError && 
        (error.message.includes('network') || 
         error.message.includes('fetch') || 
         error.message.includes('timeout') ||
         error.message.includes('abort'));
      
      if (isNetworkError) {
        // For network errors, return a 503 to indicate service unavailability
        // rather than an auth error
        return NextResponse.json(
          { error: 'Network error, unable to validate token', temporary: true },
          { status: 503 }
        );
      }
      
      // For other errors, treat as auth failure but log it
      return NextResponse.json(
        { error: 'Token validation failed' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Token validation failed' },
      { status: 401 }
    );
  }
} 