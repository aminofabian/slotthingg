import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('Handling forgot password request...');
  
  try {
    const body = await request.json();
    const { email, whitelabel_admin_uuid } = body;

    console.log('Processing forgot password for email:', email);

    const response = await fetch('https://serverhub.biz/users/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email,
        whitelabel_admin_uuid
      })
    });

    console.log('Server response status:', response.status);
    
    const data = await response.text();
    console.log('Raw server response:', data);

    let responseData;
    try {
      responseData = JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse response:', data);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid server response' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (!response.ok) {
      console.error('Server returned error:', responseData);
      return new NextResponse(
        JSON.stringify({ 
          error: responseData.message || responseData.detail || 'Request failed',
          status: response.status 
        }),
        { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('Forgot password request successful');
    
    // Return success response
    return new NextResponse(
      JSON.stringify({ 
        success: true,
        message: 'Password reset instructions sent'
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 