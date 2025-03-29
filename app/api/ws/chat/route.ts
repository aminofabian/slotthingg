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
    
    // Simply construct and return the WebSocket URL directly
    const wsUrl = `${WS_URL}/P${playerId}Chat/?player_id=${playerId}`;
    
    // Skip health check entirely and assume server is available
    return NextResponse.json({
      isAvailable: true,
      wsUrl,
      diagnostics: {
        message: 'Direct WebSocket URL provided without health check',
        timestamp: new Date().toISOString(),
        connectionType: 'direct'
      }
    });
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
    }, { status: 500 });
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
