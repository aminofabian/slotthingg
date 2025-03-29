'use client';
import React, { useEffect, useRef, useState } from 'react';
import { 
  initializeChatWebSocket, 
  isWebSocketConnected,
  isUsingMockWebSocket,
  resetMockMode,
  sendPendingMessages 
} from '@/app/lib/socket';
import { IoRefresh, IoWarning } from 'react-icons/io5';

interface WebSocketManagerProps {
  playerId: string;
  userId: string;
  userName: string;
  onMessageReceived: (data: any) => void;
  onConnectionStatusChange?: (status: 'connected' | 'connecting' | 'disconnected', isMockMode: boolean) => void;
}

const WebSocketManager = ({
  playerId,
  userId,
  userName,
  onMessageReceived,
  onConnectionStatusChange
}: WebSocketManagerProps) => {
  // Create a ref to track initialization
  const wsInitialized = useRef(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [is502Error, setIs502Error] = useState(false);
  const [is403Error, setIs403Error] = useState(false);
  
  // Track connection status changes
  useEffect(() => {
    // Report connection status to parent component
    if (onConnectionStatusChange) {
      let status: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
      
      if (isWebSocketConnected) {
        status = 'connected';
        // Try to send any pending messages when we reconnect
        sendPendingMessages();
      } else if (wsInitialized.current) {
        status = 'connecting';
      }
      
      onConnectionStatusChange(status, isUsingMockWebSocket);
    }
  }, [isWebSocketConnected, isUsingMockWebSocket, onConnectionStatusChange]);

  // First check if the server is available using our API
  useEffect(() => {
    // Only try to connect if we have the required data
    if (!playerId || !userId) {
      console.log('Missing player ID or user ID, skipping WebSocket initialization');
      return;
    }
    
    // First check if chat server is available via our API
    const checkServerAvailability = async () => {
      try {
        const response = await fetch(`/api/ws/chat?player_id=${playerId}`);
        
        if (!response.ok) {
          console.warn(`Server availability check returned ${response.status} ${response.statusText}`);
          // Still initialize to trigger fallback mode
          initializeWebSocket();
          return;
        }
        
        const data = await response.json();
        console.log('Server availability check response:', data);
        
        // Store diagnostic info for debugging
        if (data.diagnostics) {
          setDiagnosticInfo(data.diagnostics);
        }
        
        // With our simplified API, the server is always considered available
        // We'll just use the wsUrl provided by the API
        if (data.wsUrl) {
          console.log('Using WebSocket URL from API:', data.wsUrl);
          setConnectionError(null);
          setIs403Error(false);
          setIs502Error(false);
          initializeWebSocket(data.wsUrl);
        } else {
          console.warn('API did not return a WebSocket URL');
          // Initialize anyway to trigger fallback/offline mode
          initializeWebSocket();
        }
      } catch (error) {
        console.error('Error checking chat server availability:', error);
        setConnectionError('Unable to connect to chat server. Please check your internet connection and try again later.');
        // Still initialize to trigger fallback mode
        initializeWebSocket();
      }
    };
    
    // Initialize WebSocket connection
    const initializeWebSocket = (wsUrl?: string) => {
      // Prevent multiple initialization attempts
      if (wsInitialized.current) {
        console.log('WebSocket already initialized, skipping');
        return;
      }
      
      // Mark as initialized immediately to prevent multiple connections
      wsInitialized.current = true;
      
      // Create a unique identifier for this connection
      const connectionId = `conn-${Date.now()}`;
      console.log(`Creating WebSocket connection with ID: ${connectionId}`);
      
      console.log('Initializing chat WebSocket with:', { 
        playerId, 
        userId, 
        userName
      });
      
      // Create a direct message handler specifically for this connection
      const handleIncomingMessage = (message: any) => {
        // If this is a system message about connection issues, show it to the user
        if (message.is_system_message) {
          setConnectionError(message.message);
        }
        
        // Enhance the message with better sender name if available
        if (message.sender_name === "Unknown" && userName) {
          if (message.is_player_sender) {
            message.sender_name = userName;
          }
        }
        
        // Pass to the provided callback
        onMessageReceived(message);
      };
      
      // Initialize the connection with our handler
      initializeChatWebSocket(playerId, userId, userName || 'User', handleIncomingMessage);
    };
    
    // Check before initializing
    checkServerAvailability();
    
    // Only check connection status periodically
    const connectionStatusInterval = setInterval(() => {
      if (!isWebSocketConnected && wsInitialized.current) {
        console.log('WebSocket disconnected, updating status');
        setRetryCount(prev => prev + 1);
        
        // If we've tried several times, show an error to the user
        if (retryCount > 3 && !connectionError) {
          setConnectionError('Unable to establish connection to chat server. Messages will be stored locally.');
        }
        
        // Report status change
        if (onConnectionStatusChange) {
          onConnectionStatusChange('disconnected', isUsingMockWebSocket);
        }
      } else if (isWebSocketConnected) {
        // Clear error when connected
        setConnectionError(null);
        setRetryCount(0);
        setIs502Error(false);
        setIs403Error(false);
      }
    }, 10000); // Check every 10 seconds
    
    // Clean up function
    return () => {
      console.log(`Cleaning up WebSocket connection`);
      clearInterval(connectionStatusInterval);
      wsInitialized.current = false;
    };
  }, [playerId, userId, userName, onMessageReceived, connectionError, retryCount, onConnectionStatusChange, is502Error, is403Error]);

  // Manual reconnection function
  const handleManualReconnect = () => {
    if (wsInitialized.current) {
      // Reset mock mode to try a real connection again
      resetMockMode();
      
      // Clear the error
      setConnectionError(null);
      setRetryCount(0);
      setIs502Error(false);
      setIs403Error(false);
      
      // Reinitialize
      wsInitialized.current = false;
      if (playerId && userId) {
        initializeChatWebSocket(playerId, userId, userName || 'User', onMessageReceived);
      }
    }
  };

  // Handle refreshing auth
  const handleRefreshAuth = () => {
    // The actual implementation would depend on your auth system
    // This is a placeholder to trigger page refresh
    window.location.reload();
  };

  // Show connection error message if there is one
  if (connectionError && !isWebSocketConnected)
    return (
      <div className="p-3 bg-red-500/10 text-red-300 border border-red-500/30 rounded-lg mb-4 text-sm">
        <div className="flex items-start gap-2">
          <IoWarning className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p>{connectionError}</p>
            <div className="flex mt-3 gap-2 flex-wrap">
              {retryCount > 3 && (
                <button 
                  onClick={handleManualReconnect}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded text-red-200 transition-colors flex items-center gap-1"
                >
                  <IoRefresh className="w-4 h-4" />
                  <span>Try reconnecting</span>
                </button>
              )}
              
              {is403Error && (
                <button 
                  onClick={handleRefreshAuth}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-200 transition-colors flex items-center gap-1"
                >
                  <IoRefresh className="w-4 h-4" />
                  <span>Refresh Session</span>
                </button>
              )}
            </div>
            
            {(is502Error || is403Error) && diagnosticInfo && (
              <details className="mt-3 text-xs opacity-70">
                <summary className="cursor-pointer hover:text-white">Diagnostic Info</summary>
                <pre className="mt-1 p-2 bg-black/30 rounded overflow-x-auto max-w-full">
                  {JSON.stringify(diagnosticInfo, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    );

  // This component doesn't render anything when connected
  return null;
};

export default WebSocketManager; 