import { NextRequest, NextResponse } from 'next/server';

// Set a reasonable timeout for the external API call
const FETCH_TIMEOUT = 15000; // 15 seconds

// Toggle this to true to use mock responses instead of calling the real API
// This helps test if the issue is with the external API or our implementation
const USE_MOCK_RESPONSE = true;

// Helper function to add timeout to fetch
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Mock response function for testing
const getMockResponse = (paymentMethod: string, amount: number) => {
  // Generate a random payment ID
  const paymentId = Math.random().toString(36).substring(2, 15);
  
  return {
    payment_id: paymentId,
    payment_url: `https://example.com/payment/${paymentId}?amount=${amount}&method=${paymentMethod}`,
    status: 'pending'
  };
};

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from the cookie
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.amount || !body.currency || !body.payment_method) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, or payment_method' },
        { status: 400 }
      );
    }

    console.log('Processing payment request:', {
      amount: body.amount,
      currency: body.currency,
      payment_method: body.payment_method
    });

    // Use mock response if enabled
    if (USE_MOCK_RESPONSE) {
      console.log('Using mock payment response');
      const mockResponse = getMockResponse(body.payment_method, body.amount);
      
      // Simulate a slight delay to mimic network latency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return NextResponse.json(mockResponse);
    }

    // Forward the request to the external API with timeout
    try {
      const response = await fetchWithTimeout(
        'https://serverhub.biz/payments/btcpay-payment/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            amount: body.amount,
            currency: body.currency,
            payment_method: body.payment_method
          }),
        },
        FETCH_TIMEOUT
      );

      // Get the response data
      const responseData = await response.json().catch(() => null);
      console.log('Payment API response status:', response.status);

      // If the response is not OK, return the error
      if (!response.ok) {
        console.error('Payment API error:', response.status, responseData);
        
        // Handle specific error cases
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json(
            { error: 'Authentication failed with payment provider' },
            { status: 401 }
          );
        }
        
        return NextResponse.json(
          { error: responseData?.error || responseData?.message || 'Payment processing failed' },
          { status: response.status || 500 }
        );
      }

      // Validate the response contains a payment_url
      if (!responseData || !responseData.payment_url) {
        console.error('Invalid payment response:', responseData);
        return NextResponse.json(
          { error: 'Invalid response from payment provider' },
          { status: 500 }
        );
      }

      console.log('Payment processed successfully');
      // Return the successful response
      return NextResponse.json(responseData);
    } catch (fetchError: any) {
      console.error('Fetch error:', fetchError);
      
      // Handle timeout specifically
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Payment service timed out. Please try again later.' },
          { status: 504 }
        );
      }
      
      // Handle other network errors
      return NextResponse.json(
        { error: 'Network error connecting to payment service: ' + (fetchError.message || 'Unknown error') },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error during payment processing: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
} 