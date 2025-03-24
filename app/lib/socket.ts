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

// Connection status
export let connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
export let isWebSocketConnected = false;

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
  if (isConnecting || (chatWs && chatWs.readyState === WebSocket.CONNECTING)) {
    console.log('Chat connection already in progress, skipping...');
    return;
  }

  if (chatWs && chatWs.readyState === WebSocket.OPEN) {
    console.log('Chat WebSocket already connected');
    return;
  }

  if (!playerId) {
    console.error('No player ID available for WebSocket connection');
    return;
  }

  console.log(`Initializing chat WebSocket connection, attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
  isConnecting = true;
  connectionStatus = 'connecting';

  try {
    if (chatWs) {
      chatWs.close();
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
      } catch (error) {
        console.error('Error sending presence message:', error);
      }
    };

    // Set up heartbeat interval
    const heartbeatInterval = setInterval(() => {
      if (chatWs?.readyState === WebSocket.OPEN) {
        try {
          chatWs.send(JSON.stringify({
            type: 'heartbeat',
            user_id: userId,
            player_id: playerId,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
        }
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // Send heartbeat every 30 seconds

    chatWs.onmessage = (event) => {
      try {
        console.log('Raw message received:', event.data);
        const data = JSON.parse(event.data);
        console.log('Parsed message data:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'pong':
            console.log('Received pong from server');
            break;
            
          case 'typing':
            console.log('Received typing indicator:', data);
            break;
            
          case 'message':
            console.log('Processing chat message:', data);
            // Generate a message ID if one isn't provided
            const messageId = data.id ? 
              (typeof data.id === 'string' ? parseInt(data.id) : data.id) :
              Date.now() + Math.floor(Math.random() * 1000);
            
            // Create a unique key for this message to check for duplicates
            const messageKey = `${messageId}`;
            
            // Skip if we've already processed this exact message
            if (sharedMessageTracker.has(messageKey)) {
              console.log('Skipping duplicate message with key:', messageKey);
              return;
            }
            
            // Mark message as processed
            sharedMessageTracker.set(messageKey);
            
            // Pass the message to the callback
            onMessageReceived(data);
            break;

          case 'presence':
            console.log('Received presence update:', data);
            break;

          default:
            console.log('Received unknown message type:', data.type, data);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        console.error('Raw message that caused error:', event.data);
      }
    };

    chatWs.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
      connectionStatus = 'disconnected';
      isConnecting = false;
    };

    chatWs.onclose = () => {
      console.log('Chat WebSocket connection closed');
      isWebSocketConnected = false;
      connectionStatus = 'disconnected';
      isConnecting = false;
      clearInterval(heartbeatInterval); // Clean up heartbeat interval

      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts += 1;
        const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        console.log(`Scheduling reconnection attempt in ${backoffDelay}ms`);
        setTimeout(() => initializeChatWebSocket(playerId, userId, userName, onMessageReceived), backoffDelay);
      } else {
        console.log('Max reconnection attempts reached');
      }
    };

  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    connectionStatus = 'disconnected';
    isConnecting = false;
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

// Send typing indicator
export const sendTypingIndicator = (userId: string, playerId: string, recipientId?: string) => {
  if (chatWs?.readyState === WebSocket.OPEN) {
    try {
      chatWs.send(JSON.stringify({
        type: 'typing',
        user_id: userId,
        player_id: playerId,
        recipient_id: recipientId,
        timestamp: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      return false;
    }
  }
  return false;
};