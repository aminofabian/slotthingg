import { io as ClientIO } from 'socket.io-client';

// Create a shared message tracker that can be used across components
export const sharedMessageTracker = {
  processedIds: new Map<string, boolean>(),
  has: function(id: number | string): boolean {
    const strId = typeof id === 'number' ? id.toString() : id;
    return this.processedIds.has(strId);
  },
  set: function(id: number | string, value: boolean = true): void {
    const strId = typeof id === 'number' ? id.toString() : id;
    this.processedIds.set(strId, value);
  },
  clear: function(): void {
    this.processedIds.clear();
  },
  size: function(): number {
    return this.processedIds.size;
  },
  cleanup: function(): void {
    if (this.processedIds.size > 1000) {
      const idsArray = Array.from(this.processedIds.keys());
      idsArray.slice(0, idsArray.length - 1000).forEach(id => this.processedIds.delete(id));
    }
  }
};

// URL should match your WebSocket server endpoint
const SOCKET_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Create socket instance
export const socket = ClientIO(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// WebSocket reference for chat
let chatWs: WebSocket | null = null;
let isConnecting = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Track when the last heartbeat was sent to avoid too many requests
let lastHeartbeatTime = 0; 
const heartbeatInterval = 30000; // 30 seconds between heartbeats

// Connection status
export let connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
export let isWebSocketConnected = false;

// Store the latest callbacks to use for reconnections
let latestMessageCallback: ((message: any) => void) | null = null;
let activePlayerId: string | null = null;
let activeUserId: string | null = null;

// Connect to the main socket
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    
    socket.on('connect', () => {
      console.log('Main WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('Main WebSocket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Main WebSocket error:', error);
    });
  }
};

// Disconnect from the main socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
  
  // Also disconnect chat WebSocket if connected
  if (chatWs) {
    chatWs.close();
    chatWs = null;
  }
};

// Initialize the chat WebSocket
export const initializeChatWebSocket = (
  playerId: string, 
  userId: string, 
  userName: string,
  onMessageReceived: (message: any) => void
) => {
  // First check if we're already connected with the same player ID
  if (
    chatWs && 
    chatWs.readyState === WebSocket.OPEN && 
    activePlayerId === playerId && 
    activeUserId === userId && 
    isWebSocketConnected
  ) {
    console.log('Already connected with the same IDs, just updating callback');
    latestMessageCallback = onMessageReceived;
    return;
  }
  
  // Store the latest callback and IDs for reuse
  latestMessageCallback = onMessageReceived;
  activePlayerId = playerId;
  activeUserId = userId;
  
  // If we're already connecting, don't start another connection
  if (isConnecting) {
    console.log('Connection already in progress, skipping duplicate attempt');
    return;
  }

  // If we're already connected but with different IDs, close it first
  if (chatWs && chatWs.readyState === WebSocket.OPEN) {
    console.log('Connected with different IDs, closing existing connection first');
    chatWs.close();
    chatWs = null;
  }

  if (!playerId) {
    console.error('No player ID available for WebSocket connection');
    return;
  }

  console.log(`Initializing chat WebSocket connection, attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
  isConnecting = true;
  connectionStatus = 'connecting';

  try {
    // Close any existing connection first
    if (chatWs) {
      try {
        chatWs.close();
      } catch (e) {
        console.warn('Error closing existing WebSocket:', e);
      }
      chatWs = null;
    }

    const wsUrl = `wss://serverhub.biz/ws/cschat/P${playerId}Chat/?player_id=${playerId}`;
    console.log('Connecting to WebSocket:', wsUrl);

    chatWs = new WebSocket(wsUrl);

    chatWs.onopen = () => {
      console.log('Chat WebSocket connected successfully');
      isWebSocketConnected = true;
      connectionStatus = 'connected';
      reconnectAttempts = 0;
      isConnecting = false;

      // Send initial presence message
      try {
        chatWs?.send(JSON.stringify({
          type: 'presence',
          status: 'online',
          user_id: userId,
          player_id: playerId
        }));
        
        // Send initial heartbeat and update timestamp
        sendHeartbeat(userId, playerId);
      } catch (error) {
        console.error('Error sending initial message:', error);
      }
    };

    chatWs.onmessage = (event) => {
      try {
        // Less verbose logging to reduce console spam
        if (event.data.includes('"type":"heartbeat"') || event.data.includes('"type":"pong"')) {
          console.log('Received heartbeat/pong message');
        } else {
          console.log('[SOCKET] Message received:', event.data.substring(0, 100) + (event.data.length > 100 ? '...' : ''));
        }
        
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (parseError) {
          console.error('Failed to parse message data:', parseError);
          return;
        }
        
        // Skip processing if no callback is available
        if (!latestMessageCallback) {
          console.warn('No message callback available, message will not be processed');
          return;
        }
        
        // Handle different message types
        switch (data.type) {
          case 'pong':
            // Minimized logging for heartbeats/pongs
            console.log('Received pong from server');
            break;
            
          case 'typing':
            console.log('Received typing indicator');
            break;
            
          case 'message':
            console.log('[SOCKET] Received chat message');
            
            // ULTRA-AGGRESSIVE FILTERING - Check if this is a player message
            // If sent by this player, we've already displayed it in the UI
            const isPlayerMessage = (
              data.is_player_sender === true || 
              data.sender_id === activeUserId || 
              data.sender === activeUserId
            );
            
            // If real-time player message, reject it immediately - the UI already has it
            if (data.is_realtime !== false && isPlayerMessage) {
              console.log('[SOCKET] Player-sent message detected, dropping to prevent duplicates');
              return; // Don't process further - prevents ALL duplicates of outgoing messages
            }
            
            // Generate a message ID if one isn't provided
            const messageId = data.id ? 
              (typeof data.id === 'string' ? parseInt(data.id) : data.id) :
              Date.now() + Math.floor(Math.random() * 1000);
            
            // Create a unique message identifier that includes content
            const contentFingerprint = `${data.sender || data.sender_id}-${data.message}-${data.sent_time}`;
            
            // Debug real-time messages
            console.log(`[SOCKET] Processing real-time message: ID=${messageId}, Content="${data.message?.substring(0, 20)}${data.message?.length > 20 ? '...' : ''}"`);
            
            // Check if this message is already in our shared tracker
            // This likely means it's an echo of a message we sent ourselves
            let isEcho = false;
            if (sharedMessageTracker.has(messageId.toString())) {
              console.log(`[SOCKET] Message ID ${messageId} already in shared tracker, likely an echo`);
              isEcho = true;
            }
            
            // Also check for content-based echoes (same user sending same message)
            if (contentFingerprint && sharedMessageTracker.has(contentFingerprint)) {
              console.log(`[SOCKET] Content fingerprint match, likely an echo`);
              isEcho = true;
            }
            
            // Ensure the message has all required fields
            const enhancedMessage = {
              ...data,
              id: messageId,
              type: data.type || 'message',
              message: data.message || '',
              sender: data.sender_id || data.sender || '0',
              sender_name: data.sender_name || 'Unknown',
              sent_time: data.sent_time || new Date().toISOString(),
              is_file: !!data.is_file,
              file: data.file || null,
              is_player_sender: !!data.is_player_sender,
              is_admin_sender: !data.is_player_sender || !!data.is_admin_sender,
              status: data.status || 'delivered',
              // Add a flag to indicate this is a real-time message (not from history)
              is_realtime: true,
              // Add content fingerprint to help prevent duplicates
              _contentFingerprint: contentFingerprint,
              // Flag if this is likely an echo of our own message
              _isEcho: isEcho
            };
            
            // Always pass the message to the component and let it decide if it's a duplicate
            if (latestMessageCallback) {
              // Use setTimeout to ensure this doesn't block the main thread
              setTimeout(() => {
                try {
                  if (latestMessageCallback) {
                    latestMessageCallback(enhancedMessage);
                  }
                } catch (callbackError) {
                  console.error('Error in message callback:', callbackError);
                }
              }, 0);
            }
            break;

          case 'presence':
            console.log('Received presence update');
            break;

          default:
            console.log('Received unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };

    chatWs.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
      connectionStatus = 'disconnected';
      isWebSocketConnected = false;
      isConnecting = false;
    };

    chatWs.onclose = () => {
      console.log('Chat WebSocket connection closed');
      isWebSocketConnected = false;
      connectionStatus = 'disconnected';
      isConnecting = false;

      // Only attempt to reconnect a limited number of times
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts += 1;
        const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(`Scheduling reconnection attempt in ${backoffDelay}ms`);
        
        setTimeout(() => {
          if (latestMessageCallback && activePlayerId && activeUserId) {
            initializeChatWebSocket(activePlayerId, activeUserId, userName, latestMessageCallback);
          }
        }, backoffDelay);
      } else {
        console.log('Max reconnection attempts reached, manual reconnection required');
      }
    };

  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    connectionStatus = 'disconnected';
    isWebSocketConnected = false;
    isConnecting = false;
  }
};

// Function to send heartbeats efficiently
const sendHeartbeat = (userId: string, playerId: string) => {
  const now = Date.now();
  
  // Only send heartbeat if enough time has passed
  if (now - lastHeartbeatTime >= heartbeatInterval) {
    if (chatWs?.readyState === WebSocket.OPEN) {
      try {
        chatWs.send(JSON.stringify({
          type: 'heartbeat',
          user_id: userId,
          player_id: playerId,
          timestamp: new Date().toISOString()
        }));
        lastHeartbeatTime = now;
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    }
  }
  
  // Schedule next heartbeat
  if (chatWs?.readyState === WebSocket.OPEN) {
    setTimeout(() => {
      if (activeUserId && activePlayerId && chatWs?.readyState === WebSocket.OPEN) {
        sendHeartbeat(activeUserId, activePlayerId);
      }
    }, heartbeatInterval);
  }
};

// Send a chat message
export const sendChatMessage = (message: any) => {
  if (chatWs?.readyState === WebSocket.OPEN) {
    try {
      chatWs.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending chat message:', error);
      return false;
    }
  } else {
    console.error('Chat WebSocket is not connected');
    return false;
  }
};

// Utility to check if we need to reconnect
export const checkAndReconnectIfNeeded = () => {
  if (!isWebSocketConnected && activePlayerId && activeUserId && latestMessageCallback) {
    console.log('Reconnection check triggered, reconnecting WebSocket');
    initializeChatWebSocket(activePlayerId, activeUserId, '', latestMessageCallback);
    return true;
  }
  return false;
};

// Send typing indicator with rate limiting
let lastTypingTime = 0;
const typingThrottleTime = 2000; // Only send typing indicator every 2 seconds

export const sendTypingIndicator = (userId: string, playerId: string, recipientId?: string) => {
  const now = Date.now();
  if (now - lastTypingTime < typingThrottleTime) {
    return false; // Skip if we've sent too recently
  }
  
  if (chatWs?.readyState === WebSocket.OPEN) {
    try {
      chatWs.send(JSON.stringify({
        type: 'typing',
        user_id: userId,
        player_id: playerId,
        recipient_id: recipientId,
        timestamp: new Date().toISOString()
      }));
      lastTypingTime = now;
      return true;
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      return false;
    }
  }
  return false;
};