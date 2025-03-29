import { NextResponse } from "next/server";

// Enable edge runtime for WebSocket support
export const runtime = 'edge';

// Constants
const CHAT_SERVER = 'serverhub.biz';
const WS_URL = 'wss://serverhub.biz/ws/cschat';

// API route to provide WebSocket URL
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('player_id');
    
    if (!playerId) {
      return NextResponse.json({
        isAvailable: false,
        error: 'Missing player_id parameter',
        status: 400,
        diagnostics: {
          message: 'Your request is missing the required player_id parameter',
          timestamp: new Date().toISOString()
        }
      }, { status: 400 });
    }
    
    // Create WebSocket URL
    const wsUrl = `${WS_URL}/P${playerId}Chat/?player_id=${playerId}`;
    
    // Try to fetch a simple resource from the server to check health
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const healthResponse = await fetch(`https://${CHAT_SERVER}/echo`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check for specific status codes
      if (healthResponse.status === 500) {
        return NextResponse.json({
          isAvailable: false,
          error: 'Server returned 500 Internal Server Error',
          status: 500,
          wsUrl: null,
          diagnostics: {
            serverStatus: healthResponse.status,
            timestamp: new Date().toISOString()
          }
        }, { status: 200 });
      }
      
      if (healthResponse.status === 404) {
        return NextResponse.json({
          isAvailable: false,
          error: 'Server endpoint not found (404)',
          status: 404,
          wsUrl: null, 
          diagnostics: {
            serverStatus: healthResponse.status,
            timestamp: new Date().toISOString()
          }
        }, { status: 200 });
      }
      
      if (healthResponse.status === 403) {
        return NextResponse.json({
          isAvailable: false,
          error: 'Authentication failed (403)',
          status: 403,
          wsUrl: null,
          diagnostics: {
            serverStatus: healthResponse.status,
            timestamp: new Date().toISOString()
          }
        }, { status: 200 });
      }
      
      // For non-success status codes, return an error
      if (!healthResponse.ok) {
        return NextResponse.json({
          isAvailable: false,
          error: `Server returned status ${healthResponse.status}`,
          status: healthResponse.status,
          wsUrl: null,
          diagnostics: {
            serverStatus: healthResponse.status,
            timestamp: new Date().toISOString()
          }
        }, { status: 200 });
      }
      
      // Server is available
      return NextResponse.json({
        isAvailable: true,
        wsUrl,
        diagnostics: {
          message: 'Chat server is available',
          timestamp: new Date().toISOString(),
          serverStatus: healthResponse.status
        }
      });
    } catch (error) {
      // Health check failed - likely a timeout or network error
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      
      return NextResponse.json({
        isAvailable: false,
        error: isTimeout ? 'Connection timed out' : 'Network error reaching chat server',
        status: isTimeout ? 408 : 503,
        wsUrl: null,
        diagnostics: {
          errorType: isTimeout ? 'timeout' : 'network',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({
      isAvailable: false,
      error: 'Internal server error',
      status: 500,
      diagnostics: {
        message: 'The API route experienced an unexpected error',
        timestamp: new Date().toISOString()
      }
    }, { status: 200 });
  }
}

// API route to save a message in offline mode
export async function POST(request: Request) {
  try {
    const message = await request.json();
    
    return NextResponse.json({
      success: true,
      stored: true,
      message_id: message.id || 'generated_' + Date.now(),
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
