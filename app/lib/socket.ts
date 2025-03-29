import { io as ClientIO } from 'socket.io-client';

// Create a shared message tracker that can be used across components
export const sharedMessageTracker = {
  processedIds: new Map<string, boolean>(),
  playerId: null as string | null,
  userId: null as string | null,
  userName: null as string | null,
  has: (id: string | number): boolean => {
    return sharedMessageTracker.processedIds.has(String(id));
  },
  set: (id: string | number, value: boolean = true): void => {
    sharedMessageTracker.processedIds.set(String(id), value);
  },
  clear: (): void => {
    sharedMessageTracker.processedIds.clear();
  },
  size: (): number => {
    return sharedMessageTracker.processedIds.size;
  },
  cleanup: (): void => {
    if (sharedMessageTracker.processedIds.size > 1000) {
      const keys = Array.from(sharedMessageTracker.processedIds.keys());
      const toRemove = keys.slice(0, 500);
      
      for (const key of toRemove) {
        sharedMessageTracker.processedIds.delete(key);
      }
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
const maxReconnectAttempts = 10;
const initialReconnectDelay = 1000; // 1 second
const maxReconnectDelay = 30000; // 30 seconds
let reconnectTimer: NodeJS.Timeout | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

// Track when the last heartbeat was sent to avoid too many requests
let lastHeartbeatTime = 0; 
const heartbeatIntervalOriginal = 30000; // 30 seconds between heartbeats

// Fallback mode flags
let mockModeEnabled = false;
export let isUsingMockWebSocket = false;
let mockModeReportedToUser = false;

// Pending messages for offline mode
const PENDING_MESSAGES_KEY = 'chat_pending_messages';
const pendingMessages: any[] = [];

// Connection status
export let connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
export let isWebSocketConnected = false;

// Store the latest callbacks to use for reconnections
let latestMessageCallback: ((message: any) => void) | null = null;
let activePlayerId: string | null = null;
let activeUserId: string | null = null;

// Reconnection configuration with exponential backoff
let hasStartedHeartbeat = false;

// Connection quality metrics
const connectionMetrics = {
  latency: [] as number[],
  disconnects: 0,
  messagesSent: 0,
  messagesReceived: 0,
  lastMessageTime: 0
};

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

// Reset mock mode to try direct connection again
export const resetMockMode = () => {
  console.log('Resetting mock WebSocket mode');
  mockModeEnabled = false;
  isUsingMockWebSocket = false;
  mockModeReportedToUser = false;
  reconnectAttempts = 0;
};

// Load any pending messages from localStorage
const loadPendingMessages = (): any[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedMessages = localStorage.getItem(PENDING_MESSAGES_KEY);
    if (storedMessages) {
      return JSON.parse(storedMessages);
    }
  } catch (error) {
    console.error('Error loading pending messages:', error);
  }
  return [];
};

// Save pending messages to localStorage
const savePendingMessages = (messages: any[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PENDING_MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving pending messages:', error);
  }
};

// Add a message to the pending queue
const addPendingMessage = (message: any): void => {
  // Add to in-memory queue
  pendingMessages.push(message);
  
  // Save to localStorage for persistence
  savePendingMessages(pendingMessages);
  
  console.log(`Added message to pending queue. Queue size: ${pendingMessages.length}`);
};

// Send all pending messages once connection is restored
export const sendPendingMessages = (): void => {
  if (!isWebSocketConnected || isUsingMockWebSocket) return;
  
  const pendingMessages = loadPendingMessages();
  if (pendingMessages.length === 0) {
    console.log('No pending messages to send');
    return;
  }
  
  console.log(`Sending ${pendingMessages.length} pending messages`);
  
  // Send messages in batches to avoid flooding the connection
  const sendMessageBatch = (batch: any[], startIndex: number) => {
    // Process up to 5 messages at a time
    const batchSize = 5;
    const endIndex = Math.min(startIndex + batchSize, batch.length);
    const currentBatch = batch.slice(startIndex, endIndex);
    
    // Send each message in the current batch
    currentBatch.forEach(message => {
      try {
        if (chatWs && chatWs.readyState === WebSocket.OPEN) {
          chatWs.send(JSON.stringify(message));
          connectionMetrics.messagesSent++;
          console.log('Sent pending message:', message.id);
        }
      } catch (error) {
        console.error('Error sending pending message:', error);
      }
    });
    
    // Continue with next batch if there are more messages
    if (endIndex < batch.length) {
      setTimeout(() => {
        sendMessageBatch(batch, endIndex);
      }, 300); // Small delay between batches
    } else {
      // All messages processed, clear the pending queue
      savePendingMessages([]);
    }
  };
  
  // Start sending the first batch
  sendMessageBatch(pendingMessages, 0);
  
  // If we have a callback, send a success message to the user
  if (connectionMetrics.messagesSent > 0 && latestMessageCallback) {
    setTimeout(() => {
      try {
        if (latestMessageCallback) {
          latestMessageCallback({
            id: Date.now(),
            type: 'message',
            message: `Successfully sent ${connectionMetrics.messagesSent} message${connectionMetrics.messagesSent === 1 ? '' : 's'} that ${connectionMetrics.messagesSent === 1 ? 'was' : 'were'} queued while offline.`,
            sender: 0,
            sender_name: 'System',
            sent_time: new Date().toISOString(),
            is_file: false,
            file: null,
            is_player_sender: false,
            is_system_message: true,
            status: 'delivered'
          });
        }
      } catch (error) {
        console.error('Error sending success message:', error);
      }
    }, 1000);
  }
};

// Initialize the chat WebSocket
export const initializeChatWebSocket = (
  playerId: string, 
  userId: string, 
  userName: string,
  onMessageReceived: (message: any) => void
) => {
  if (chatWs) {
    console.log('WebSocket already initialized, reusing existing connection');
    return chatWs;
  }
  
  sharedMessageTracker.playerId = playerId;
  sharedMessageTracker.userId = userId;
  sharedMessageTracker.userName = userName;
  
  // Store the latest callback for reuse
  latestMessageCallback = onMessageReceived;
  activePlayerId = playerId;
  activeUserId = userId;
  
  // Use a direct connection without health check
  return connectWebSocketDirectly();
  
  // Define the function properly outside of the calling scope
  function connectWebSocketDirectly(suggestedUrl?: string): WebSocket | null {
    // Don't attempt to reconnect if we're already in mock mode
    if (isUsingMockWebSocket) {
      console.log('Using mock WebSocket, skipping direct connection attempt');
      return null;
    }
    
    try {
      // Clear any existing heartbeat
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    
      // Construct the WebSocket URL directly or use API-provided URL
      const url = suggestedUrl || `wss://serverhub.biz/ws/cschat/P${playerId}Chat/?player_id=${playerId}`;
      console.log('Connecting to WebSocket:', url);

      chatWs = new WebSocket(url);
      hasStartedHeartbeat = false;

      chatWs.onopen = (event) => {
        console.log('WebSocket connected successfully');
        isWebSocketConnected = true;
        isUsingMockWebSocket = false;
        connectionStatus = 'connected';
        
        // Reset reconnection attempts on successful connection
        reconnectAttempts = 0;
        
        // Start heartbeat to keep connection alive
        startHeartbeat();
        hasStartedHeartbeat = true;
        
        // Send any pending messages
        sendPendingMessages();
      };

      chatWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Track metrics
          connectionMetrics.messagesReceived++;
          connectionMetrics.lastMessageTime = Date.now();
          
          // Handle heartbeat response
          if (message.type === 'pong') {
            handlePongResponse(message);
            return;
          }
          
          console.log('Received message:', message);
          
          if (message.type === 'typing') {
            // Handle typing indicator
            if (latestMessageCallback) {
              latestMessageCallback(message);
            }
          } 
          
          // Forward the message to the handler
          if (onMessageReceived) {
            onMessageReceived(message);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      chatWs.onerror = (event) => {
        console.error('WebSocket error:', event);
        isWebSocketConnected = false;
        connectionStatus = 'disconnected';
        
        // Track metrics
        connectionMetrics.disconnects++;
      };

      chatWs.onclose = (event) => {
        console.log(`WebSocket closed with code: ${event.code}`);
        isWebSocketConnected = false;
        connectionStatus = 'disconnected';
        
        // Don't attempt to reconnect if we intentionally closed
        if (event.code === 1000) {
          console.log('WebSocket closed normally');
          return;
        }
        
        // Reconnect with exponential backoff
        reconnectWithBackoff();
      };
      
      return chatWs;
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      isWebSocketConnected = false;
      connectionStatus = 'disconnected';
      
      // Fallback to mock mode after all reconnection attempts
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('Maximum reconnection attempts reached, switching to offline mode');
        mockModeEnabled = true;
        setupMockWebSocket(playerId, userId, userName, onMessageReceived);
      } else {
        reconnectWithBackoff();
      }
      
      return null;
    }
  }
};

function reconnectWithBackoff() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (reconnectAttempts < maxReconnectAttempts) {
    // Calculate backoff delay using exponential strategy
    const backoffTime = Math.min(
      initialReconnectDelay * Math.pow(2, reconnectAttempts), 
      maxReconnectDelay
    );
    
    console.log(`Reconnecting in ${backoffTime}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
    
    reconnectTimer = setTimeout(() => {
      reconnectAttempts++;
      
      if (activePlayerId && activeUserId && activePlayerId === sharedMessageTracker.playerId) {
        // Call the exported function directly to ensure we're using the correct function
        initializeChatWebSocket(
          activePlayerId, 
          activeUserId, 
          sharedMessageTracker.userName || 'User', 
          latestMessageCallback || (() => {})
        );
      }
    }, backoffTime);
  } else {
    console.log('Maximum reconnection attempts reached, switching to offline mode');
    mockModeEnabled = true;
    
    if (activePlayerId && activeUserId && latestMessageCallback) {
      setupMockWebSocket(
        activePlayerId, 
        activeUserId, 
        sharedMessageTracker.userName || 'User', 
        latestMessageCallback
      );
    }
  }
}

function startHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  
  heartbeatInterval = setInterval(() => {
    if (chatWs && chatWs.readyState === WebSocket.OPEN) {
      const pingMessage = {
        type: 'ping',
        timestamp: Date.now(),
        user_id: activeUserId,
        player_id: activePlayerId
      };
      
      try {
        chatWs.send(JSON.stringify(pingMessage));
        connectionMetrics.messagesSent++;
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    } else {
      // Connection issues detected
      console.warn('Heartbeat failed - WebSocket not open');
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      
      if (isWebSocketConnected) {
        isWebSocketConnected = false;
        connectionStatus = 'disconnected';
        reconnectWithBackoff();
      }
    }
  }, 15000); // Send heartbeat every 15 seconds
}

function handlePongResponse(pongMessage: any) {
  const now = Date.now();
  const pingTime = pongMessage.timestamp;
  const latency = now - pingTime;
  
  // Track latency metrics (keep last 10 measurements)
  connectionMetrics.latency.push(latency);
  if (connectionMetrics.latency.length > 10) {
    connectionMetrics.latency.shift();
  }
  
  // Calculate average latency
  const avgLatency = connectionMetrics.latency.reduce((sum, val) => sum + val, 0) / 
                    Math.max(1, connectionMetrics.latency.length);
                    
  // Log connection quality
  console.log(`WebSocket connection quality: ${avgLatency}ms average latency`);
}

// Set up a mock WebSocket for offline/fallback mode
function setupMockWebSocket(
  playerId: string,
  userId: string,
  userName: string,
  onMessageReceived: (message: any) => void,
  errorType?: 'not_found' | 'server_error' | 'auth_error'
) {
  console.log('Setting up mock WebSocket');
  isUsingMockWebSocket = true;
  isWebSocketConnected = true; // Pretend we're connected
  connectionStatus = 'connected';
  isConnecting = false;
  
  // If we haven't warned the user yet, send a special message
  if (!mockModeReportedToUser && onMessageReceived) {
    mockModeReportedToUser = true;
    
    // Send a system message to inform the user
    setTimeout(() => {
      try {
        // Provide different messages based on the error type
        let errorMessage = "We're having trouble connecting to the chat server. Messages will be stored locally until connection is restored.";
        
        if (errorType === 'not_found') {
          errorMessage = "The chat server appears to be unavailable (404 error). Your messages will be stored locally and sent when the server is back online.";
        } else if (errorType === 'server_error') {
          errorMessage = "We encountered a server error (500) when trying to connect to chat. Your messages will be stored locally until the server issue is resolved.";
        } else if (errorType === 'auth_error') {
          errorMessage = "Authentication failed when connecting to chat. Please try refreshing the page. Your messages will be stored locally in the meantime.";
        }
        
        onMessageReceived({
          id: Date.now(),
          type: 'message',
          message: errorMessage,
          sender: 0,
          sender_name: 'System',
          sent_time: new Date().toISOString(),
          is_file: false,
          file: null,
          is_player_sender: false,
          is_system_message: true,
          status: 'delivered'
        });
        
        // After a short delay, send a follow-up message about reconnecting
        setTimeout(() => {
          onMessageReceived({
            id: Date.now() + 1,
            type: 'message',
            message: "You can send messages while offline, and we'll try to deliver them when connection is restored. You may need to refresh the page if issues persist.",
            sender: 0,
            sender_name: 'System',
            sent_time: new Date().toISOString(),
            is_file: false,
            file: null,
            is_player_sender: false,
            is_system_message: true,
            status: 'delivered'
          });
        }, 2000);
      } catch (error) {
        console.error('Error sending mock system message:', error);
      }
    }, 1000);
  }
}

// Function to send heartbeats efficiently
const sendHeartbeat = (userId: string, playerId: string) => {
  const now = Date.now();
  
  // Only send heartbeat if enough time has passed
  if (now - lastHeartbeatTime >= heartbeatIntervalOriginal) {
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
    }, heartbeatIntervalOriginal);
  }
};

// Send a chat message
export const sendChatMessage = (message: any) => {
  if (isUsingMockWebSocket) {
    console.log('Using mock WebSocket, storing message for later delivery');
    
    // Add to pending queue
    addPendingMessage(message);
    
    // Create a fake "sent" message for the UI
    if (latestMessageCallback) {
      setTimeout(() => {
        try {
          if (latestMessageCallback) {
            latestMessageCallback({
              ...message,
              status: 'delivered',
              client_receive_time: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error updating message status:', error);
        }
      }, 500);
    }
    
    return true;
  } else if (chatWs?.readyState === WebSocket.OPEN) {
    try {
      chatWs.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending chat message:', error);
      
      // Add to pending queue on error
      addPendingMessage(message);
      
      return false;
    }
  } else {
    console.error('Chat WebSocket is not connected');
    
    // Add to pending queue when not connected
    addPendingMessage(message);
    
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
  
  // Throttle sending typing indicators
  if (now - lastTypingTime < typingThrottleTime) {
    return;
  }
  
  lastTypingTime = now;
  
  // Skip in mock mode
  if (isUsingMockWebSocket) {
    return;
  }
  
  if (chatWs && chatWs.readyState === WebSocket.OPEN) {
    try {
      chatWs.send(JSON.stringify({
        type: 'typing',
        user_id: userId,
        player_id: playerId,
        recipient_id: recipientId,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }
};

// Check if the chat server is available
export async function checkServerAvailability(
  playerId: string,
  onMessageReceived?: (message: any) => void,
): Promise<boolean> {
  if (!playerId) {
    console.log('Missing player ID for server availability check');
    // If we have an onMessageReceived handler, set up mock WebSocket
    if (onMessageReceived) {
      setupMockWebSocket(playerId, 'unknown', 'Guest', onMessageReceived, 'auth_error');
    }
    return false;
  }

  const checkUrl = `/api/ws/chat?player_id=${playerId}`;
  
  try {
    console.log(`Checking server availability: ${checkUrl}`);
    const response = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Server check status: ${response.status}`);
    
    // If we get a 403, clear retry attempts and switch to mock mode
    if (response.status === 403) {
      console.error('Authentication error (403) during server check');
      reconnectAttempts = maxReconnectAttempts; // Prevent further reconnection attempts
      
      // Only set up mock if we have a message handler
      if (onMessageReceived) {
        setupMockWebSocket(playerId, 'unknown', 'Guest', onMessageReceived, 'auth_error');
      }
      return false;
    }
    
    // If we get a 404, the server is completely unavailable
    if (response.status === 404) {
      console.error('Server endpoint not found (404)');
      
      // Reduce connection attempts for faster fallback
      reconnectAttempts = Math.max(reconnectAttempts, Math.floor(maxReconnectAttempts * 0.7));
      
      // Set up mock mode if we have a message handler
      if (onMessageReceived) {
        setupMockWebSocket(playerId, 'unknown', 'Guest', onMessageReceived, 'not_found');
      }
      return false;
    }
    
    // If we get a 500, there's a server error
    if (response.status === 500) {
      console.error('Server error (500) during availability check');
      
      // Reduce connection attempts for faster fallback
      reconnectAttempts = Math.max(reconnectAttempts, Math.floor(maxReconnectAttempts * 0.7));
      
      // Set up mock mode if we have a message handler
      if (onMessageReceived) {
        setupMockWebSocket(playerId, 'unknown', 'Guest', onMessageReceived, 'server_error');
      }
      return false;
    }

    // Parse response to check for reported availability
    const data = await response.json();
    const isServerAvailable = data.isAvailable === true;
    
    if (!isServerAvailable && onMessageReceived) {
      console.log('Server reported as unavailable, switching to mock mode');
      setupMockWebSocket(playerId, 'unknown', 'Guest', onMessageReceived);
    }
    
    return isServerAvailable;
  } catch (error) {
    console.error('Error checking server availability:', error);
    
    // Set up mock mode if we have a message handler
    if (onMessageReceived) {
      setupMockWebSocket(playerId, 'unknown', 'Guest', onMessageReceived);
    }
    
    return false;
  }
}