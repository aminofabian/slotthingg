'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  initializeChatWebSocket, 
  isWebSocketConnected, 
  checkServerAvailability, 
  isUsingMockWebSocket, 
  resetMockMode,
  sendPendingMessages
} from '@/app/lib/socket';
import { IoWarning, IoRefresh, IoInformationCircle } from 'react-icons/io5';

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
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState(0);
  const [shouldShowRefreshButton, setShouldShowRefreshButton] = useState(false);

  // Function to initialize the WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (!playerId) {
      setConnectionError('Missing player ID. Please refresh the page.');
      return;
    }

    try {
      // Directly initialize WebSocket connection without health check
      console.log('Initializing WebSocket connection directly');
      setConnectionError(null);
      
      // This will handle reconnection internally
      initializeChatWebSocket(playerId, userId, userName, onMessageReceived);
      
      // Record connection attempt time
      setLastConnectionAttempt(Date.now());
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setConnectionError(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [playerId, userId, userName, onMessageReceived]);

  // Initial connection setup
  useEffect(() => {
    console.log('Setting up WebSocket connection');
    initializeWebSocket();
    
    // Update connection status
    const statusInterval = setInterval(() => {
      if (onConnectionStatusChange) {
        onConnectionStatusChange(
          isWebSocketConnected ? 'connected' : isUsingMockWebSocket ? 'disconnected' : 'connecting',
          isUsingMockWebSocket
        );
      }
      
      // If we're in mock mode and it's been more than a minute since last try, show refresh
      if (isUsingMockWebSocket && Date.now() - lastConnectionAttempt > 60000) {
        setShouldShowRefreshButton(true);
      }
    }, 2000);
    
    return () => {
      clearInterval(statusInterval);
    };
  }, [initializeWebSocket, onConnectionStatusChange, lastConnectionAttempt]);

  // Handle manual reconnection
  const handleManualReconnect = useCallback(() => {
    console.log('Manual reconnection initiated');
    setRetryCount(prev => prev + 1);
    setLastConnectionAttempt(Date.now());
    setShouldShowRefreshButton(false);
    
    // Reset the mock mode flag to try a real connection again
    resetMockMode();
    
    // Reinitialize the connection
    initializeWebSocket();
  }, [initializeWebSocket]);
  
  // Handle session refresh for auth errors
  const handleRefreshAuth = useCallback(() => {
    console.log('Auth refresh initiated');
    
    // Redirect to auth page or refresh token
    try {
      if (typeof window !== 'undefined') {
        // Try to refresh the page to get a new session
        window.location.reload();
      }
    } catch (error) {
      console.error('Error refreshing auth:', error);
    }
  }, []);

  // Show connection error if there is one
  return (
    <>
      {connectionError && (
        <div className="bg-red-500/20 p-3 m-3 rounded-lg border border-red-500/30 text-white">
          <div className="flex items-center mb-2">
            <IoWarning className="text-red-400 mr-2 w-5 h-5" />
            <h3 className="font-semibold">Connection Error</h3>
          </div>
          <p className="text-sm mb-3 text-white/80">{connectionError}</p>
          
          {shouldShowRefreshButton && (
            <button 
              onClick={handleManualReconnect}
              className="bg-[#00ffff]/20 hover:bg-[#00ffff]/30 text-[#00ffff] py-1.5 px-3 rounded flex items-center justify-center w-full"
            >
              <IoRefresh className="mr-1.5" /> Try Reconnecting
            </button>
          )}
          
          {connectionError.includes('403') && (
            <button 
              onClick={handleRefreshAuth}
              className="mt-2 bg-[#ff00ff]/20 hover:bg-[#ff00ff]/30 text-[#ff00ff] py-1.5 px-3 rounded flex items-center justify-center w-full"
            >
              <IoRefresh className="mr-1.5" /> Refresh Session
            </button>
          )}
        </div>
      )}
      
      {isUsingMockWebSocket && !connectionError && (
        <div className="bg-yellow-500/20 p-3 m-3 rounded-lg border border-yellow-500/30 text-white">
          <div className="flex items-center mb-2">
            <IoInformationCircle className="text-yellow-400 mr-2 w-5 h-5" />
            <h3 className="font-semibold">Offline Mode</h3>
          </div>
          <p className="text-sm mb-3 text-white/80">
            You are currently using the app in offline mode. Messages will be stored locally and sent when you reconnect.
          </p>
          
          {shouldShowRefreshButton && (
            <button 
              onClick={handleManualReconnect}
              className="bg-[#00ffff]/20 hover:bg-[#00ffff]/30 text-[#00ffff] py-1.5 px-3 rounded flex items-center justify-center w-full"
            >
              <IoRefresh className="mr-1.5" /> Try Reconnecting
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default WebSocketManager; 