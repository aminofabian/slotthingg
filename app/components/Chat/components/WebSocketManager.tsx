'use client';
import React, { useEffect, useRef } from 'react';
import { initializeChatWebSocket, isWebSocketConnected } from '@/app/lib/socket';

interface WebSocketManagerProps {
  playerId: string;
  userId: string;
  userName: string;
  onMessageReceived: (data: any) => void;
}

const WebSocketManager = ({
  playerId,
  userId,
  userName,
  onMessageReceived
}: WebSocketManagerProps) => {
  // Create a ref to track initialization
  const wsInitialized = useRef(false);

  // Initialize WebSocket when props are available
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
    
    // Only check connection status every 10 seconds
    const connectionStatusInterval = setInterval(() => {
      // Only attempt to reconnect if explicitly disconnected
      if (!isWebSocketConnected && wsInitialized.current) {
        console.log('WebSocket disconnected, attempting to reconnect...');
        initializeChatWebSocket(playerId, userId, userName || 'User', handleIncomingMessage);
      }
    }, 10000);
    
    // Clean up function
    return () => {
      console.log(`Cleaning up WebSocket connection`);
      clearInterval(connectionStatusInterval);
      wsInitialized.current = false;
    };
  }, [playerId, userId, userName, onMessageReceived]);

  // This component doesn't render anything - it's just for WebSocket management
  return null;
};

export default WebSocketManager; 