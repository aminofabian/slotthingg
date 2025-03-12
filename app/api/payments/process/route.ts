import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

    // Forward the request to the external API
    const response = await fetch('https://serverhub.biz/payments/btcpay-payment/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // Add any other required headers here
      },
      body: JSON.stringify({
        amount: body.amount,
        currency: body.currency,
        payment_method: body.payment_method
      }),
    });

    // Get the response data
    const responseData = await response.json().catch(() => null);

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

    // Return the successful response
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error during payment processing' },
      { status: 500 }
    );
  }
} 