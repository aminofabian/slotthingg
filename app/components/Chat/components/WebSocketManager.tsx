'use client';
import { useEffect, useRef } from 'react';
import { 
  initializeChatWebSocket, 
  isWebSocketConnected 
} from '@/app/lib/socket';

interface WebSocketManagerProps {
  playerId: string;
  userId: string;
  userName: string;
  onMessageReceived: (message: any) => void;
}

const WebSocketManager = ({ 
  playerId, 
  userId, 
  userName, 
  onMessageReceived 
}: WebSocketManagerProps) => {
  // Prevent multiple initialization attempts
  const wsInitialized = useRef(false);

  // Initialize WebSocket when user info is available
  useEffect(() => {
    // Only try to connect if we have the required data
    if (!playerId || !userId) {
      console.log('Missing player ID or user ID, skipping WebSocket initialization');
      return;
    }
    
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
      console.log(`WebSocket message received:`, message);
      
      // Force execution on the next tick to avoid React state update issues
      setTimeout(() => {
        // Enhance the message with better sender name if available
        if (message.sender_name === "Unknown" && userName) {
          if (message.is_player_sender) {
            message.sender_name = userName;
          }
        }
        
        onMessageReceived(message);
      }, 0);
    };
    
    // Initialize the connection with our handler
    initializeChatWebSocket(playerId, userId, userName || 'User', handleIncomingMessage);
    
    // Only check connection status every 10 seconds to reduce server load
    const connectionStatusInterval = setInterval(() => {
      const status = isWebSocketConnected ? 'connected' : 'disconnected';
      console.log(`[Status Check] WebSocket connection status: ${status}`);
      
      // Only attempt to reconnect if we're explicitly disconnected
      if (!isWebSocketConnected && wsInitialized.current) {
        console.log('WebSocket disconnected, attempting to reconnect...');
        initializeChatWebSocket(playerId, userId, userName || 'User', handleIncomingMessage);
      }
    }, 10000); // Check every 10 seconds
    
    // Clean up function
    return () => {
      console.log(`Cleaning up WebSocket connection`);
      clearInterval(connectionStatusInterval);
    };
  }, [playerId, userId, userName, onMessageReceived]);

  // This is a utility component that doesn't render anything
  return null;
};

export default WebSocketManager; 