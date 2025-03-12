import { NextRequest, NextResponse } from 'next/server';

// Increase timeout for the external API call
const FETCH_TIMEOUT = 25000; // 25 seconds
const MAX_RETRIES = 2; // Maximum number of retry attempts

// IMPORTANT: Set this to false to use the real payment API
// Set to true for testing without making real payment requests
const USE_FALLBACK = true;

// Payment API endpoint - The real endpoint to use when USE_FALLBACK is false
const PAYMENT_API_ENDPOINT = 'https://serverhub.biz/payments/btcpay-payment/';

// Helper function to add timeout to fetch with retry logic
const fetchWithTimeoutAndRetry = async (url: string, options: RequestInit, timeout: number, maxRetries: number) => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      console.log(`Payment API request attempt ${attempt + 1}/${maxRetries + 1}`);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      
      console.error(`Attempt ${attempt + 1} failed:`, error.message || 'Unknown error');
      
      // If it's not a timeout error or we've reached max retries, don't retry
      if (error.name !== 'AbortError' || attempt >= maxRetries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const backoffTime = Math.min(1000 * Math.pow(2, attempt), 5000);
      console.log(`Retrying in ${backoffTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError || new Error('Failed to fetch after multiple attempts');
};

// Fallback payment method for testing
const generateFallbackPayment = (amount: number, currency: string, paymentMethod: string) => {
  console.log('Using fallback payment method for testing');
  
  // Generate a random payment ID that looks like the real one (21 characters)
  const generatePaymentId = () => {
    // Create a random string of letters and numbers, similar to the sample "4mQWfK8MknnyP9h4KnZKGX"
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 21; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const paymentId = generatePaymentId();
  
  // Create a mock payment URL that matches the expected format from the real API
  const paymentUrl = `https://btcpay.serverhub.biz/i/${paymentId}`;
  
  // Simulate network delay
  return new Promise<{ payment_id: string; payment_url: string }>(resolve => {
    setTimeout(() => {
      resolve({
        payment_id: paymentId,
        payment_url: paymentUrl
      });
    }, 2000); // 2 second delay to simulate network
  });
};

export async function POST(request: NextRequest) {
  console.log('Payment process request received');
  
  try {
    // Get the auth token from the cookie
    const token = request.cookies.get('token')?.value;

    if (!token) {
      console.log('Authentication token missing');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.amount || !body.currency || !body.payment_method) {
      console.log('Missing required fields in payment request');
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, or payment_method' },
        { status: 400 }
      );
    }

    // Validate payment method is one of the supported types
    const validPaymentMethods = ['BTC-LN', 'BTC-CHAIN', 'LTC-CHAIN'];
    if (!validPaymentMethods.includes(body.payment_method)) {
      console.log('Invalid payment method:', body.payment_method);
      return NextResponse.json(
        { error: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('Payment request validation passed, preparing to call external API');
    console.log('Payment details:', {
      amount: body.amount,
      currency: body.currency,
      payment_method: body.payment_method
    });

    // PAYMENT PROCESSING LOGIC
    // There are two paths here:
    // 1. If USE_FALLBACK is true, we generate a mock payment response for testing
    // 2. If USE_FALLBACK is false, we call the real payment API endpoint
    // Both paths return the same response format: { payment_id: string, payment_url: string }
    
    // Use fallback payment method if enabled
    if (USE_FALLBACK) {
      try {
        const fallbackResponse = await generateFallbackPayment(
          body.amount,
          body.currency,
          body.payment_method
        );
        
        console.log('Fallback payment processed successfully:', fallbackResponse);
        return NextResponse.json(fallbackResponse);
      } catch (fallbackError) {
        console.error('Fallback payment error:', fallbackError);
        return NextResponse.json(
          { error: 'Fallback payment processing failed' },
          { status: 500 }
        );
      }
    }

    // Try a direct fetch first with a shorter timeout
    try {
      console.log('Attempting direct payment API call to:', PAYMENT_API_ENDPOINT);
      
      // Forward the request to the external API with retry logic
      const response = await fetchWithTimeoutAndRetry(
        PAYMENT_API_ENDPOINT,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: body.amount,
            currency: body.currency,
            payment_method: body.payment_method
          }),
        },
        FETCH_TIMEOUT,
        MAX_RETRIES
      );

      console.log('Payment API response received, status:', response.status);

      // Get the response data
      const responseData = await response.json().catch(() => {
        console.error('Failed to parse JSON response from payment API');
        return null;
      });

      // If the response is not OK, return the error
      if (!response.ok) {
        console.error('Payment API error response:', response.status, responseData);
        
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

      // Validate the response contains required fields
      if (!responseData || !responseData.payment_id || !responseData.payment_url) {
        console.error('Invalid payment response - missing required fields:', responseData);
        return NextResponse.json(
          { error: 'Invalid response from payment provider' },
          { status: 500 }
        );
      }

      console.log('Payment processed successfully, returning payment data');
      // Return the successful response
      return NextResponse.json(responseData);
    } catch (fetchError: any) {
      console.error('Payment API fetch error:', fetchError);
      
      // Handle timeout specifically
      if (fetchError.name === 'AbortError') {
        console.error('Payment API request timed out after retries');
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
    console.error('General payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error during payment processing: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// USAGE INSTRUCTIONS:
// To switch from fallback to real payment processing:
// 1. Set USE_FALLBACK = false at the top of this file
// 2. Ensure your server has access to https://serverhub.biz
// 3. Make sure your authentication token is valid for the payment API
// 
// The response format is the same for both fallback and real payment methods:
// {
//   payment_id: string,  // Example: "4mQWfK8MknnyP9h4KnZKGX"
//   payment_url: string  // Example: "https://btcpay.serverhub.biz/i/4mQWfK8MknnyP9h4KnZKGX"
// } 