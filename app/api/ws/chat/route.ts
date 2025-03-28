import { NextResponse } from 'next/server';

// Constants
const CHAT_SERVER = 'serverhub.biz';
const WS_URL = 'wss://serverhub.biz/ws/cschat';

// Helper function for timed fetch operations
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  
  clearTimeout(id);
  return response;
}

// API route to check server availability
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('player_id');
  
  if (!playerId) {
    return NextResponse.json({
      available: false,
      error: 'Missing player_id parameter',
      status: 400,
      diagnostics: {
        message: 'Your request is missing the required player_id parameter',
        timestamp: new Date().toISOString()
      }
    }, { status: 400 });
  }
  
  try {
    // Try to check if the server is available with a simple HTTP request
    const testUrl = `https://${CHAT_SERVER}/api/health`;
    const wsUrl = `${WS_URL}/P${playerId}Chat/?player_id=${playerId}`;
    
    try {
      const response = await fetchWithTimeout(testUrl, { method: 'GET' }, 3000);
      
      if (response.ok) {
        return NextResponse.json({
          available: true,
          wsUrl,
          diagnostics: {
            serverResponse: 'Server health check passed',
            status: response.status,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // Server responded but with error
        return NextResponse.json({
          available: false,
          error: `Server returned status ${response.status}`,
          status: response.status,
          wsUrl,
          diagnostics: {
            serverResponse: await response.text().catch(() => 'Could not read response body'),
            status: response.status,
            timestamp: new Date().toISOString()
          }
        }, { status: 200 }); // We return 200 even though availability check failed
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Network error or timeout - could be gateway error
      return NextResponse.json({
        available: false,
        error: `Connection error: ${errorMessage}`,
        status: 502,
        wsUrl, // Still provide the URL for direct connection attempt
        diagnostics: {
          message: 'Server availability check failed',
          error: errorMessage,
          connectionType: 'direct',
          timestamp: new Date().toISOString()
        }
      }, { status: 200 }); // We return 200 even though availability check failed
    }
  } catch (error) {
    console.error('Error in chat server availability check:', error);
    return NextResponse.json({
      available: false,
      error: 'Internal server error',
      status: 500,
      diagnostics: {
        message: 'Internal server error during availability check',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}

// API route to save a message in offline mode
export async function POST(request: Request) {
  try {
    const message = await request.json();
    
    // In a real implementation, this could attempt to send through HTTP API
    // or store in a server-side queue. Here we just acknowledge receipt
    
    return NextResponse.json({
      success: true,
      stored: true,
      message_id: message.id,
      diagnostics: {
        message: 'Message stored in offline mode',
        timestamp: new Date().toISOString(),
        offline_mode: true
      }
    });
  } catch (error) {
    console.error('Error storing offline message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to store message',
      diagnostics: {
        message: 'Error processing message data',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
} 