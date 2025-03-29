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
  
  // Load messages from localStorage (in case of page refresh)
  const storedMessages = loadPendingMessages();
  
  // Combine with in-memory queue
  const allPending = [...pendingMessages, ...storedMessages.filter(msg => 
    !pendingMessages.some(pending => pending.id === msg.id)
  )];
  
  if (allPending.length === 0) return;
  
  console.log(`Attempting to send ${allPending.length} pending messages`);
  
  let successCount = 0;
  
  // Try to send each message
  allPending.forEach(message => {
    try {
      if (chatWs && chatWs.readyState === WebSocket.OPEN) {
        chatWs.send(JSON.stringify(message));
        successCount++;
      }
    } catch (error) {
      console.error('Error sending pending message:', error);
    }
  });
  
  console.log(`Successfully sent ${successCount}/${allPending.length} pending messages`);
  
  // Clear pending messages if all sent successfully
  if (successCount === allPending.length) {
    pendingMessages.length = 0;
    savePendingMessages([]);
  } else {
    // Keep only the failed ones
    const remainingMessages = allPending.slice(successCount);
    pendingMessages.length = 0;
    pendingMessages.push(...remainingMessages);
    savePendingMessages(pendingMessages);
  }
  
  // If we have a callback, send a success message to the user
  if (successCount > 0 && latestMessageCallback) {
    setTimeout(() => {
      try {
        if (latestMessageCallback) {
          latestMessageCallback({
            id: Date.now(),
            type: 'message',
            message: `Successfully sent ${successCount} message${successCount === 1 ? '' : 's'} that ${successCount === 1 ? 'was' : 'were'} queued while offline.`,
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

  // If we're in mock mode, use that instead of real connection
  if (mockModeEnabled) {
    console.log('Using mock WebSocket mode due to previous connection failures');
    setupMockWebSocket(playerId, userId, userName, onMessageReceived);
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
    
    // Setup mock mode if no player ID
    mockModeEnabled = true;
    setupMockWebSocket(playerId || 'unknown', userId || 'unknown', userName, onMessageReceived);
    return;
  }

  console.log(`Initializing chat WebSocket connection, attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
  isConnecting = true;
  connectionStatus = 'connecting';

  try {
    // Track if the server is completely unavailable to avoid multiple connection attempts
    let serverUnavailable = false;
    
    // Before we try to connect directly, let's check server availability
    fetch(`/api/ws/chat?player_id=${playerId}`)
      .then(response => {
        if (!response.ok && response.status !== 200) {
          // If we get a bad status from our own endpoint (not the external server),
          // something is wrong with our API route
          console.error(`API route error: ${response.status}`);
          
          // Don't wait for the JSON, just try direct connection
          serverUnavailable = true;
          
          // If our own API returns 500, it's likely a deployment issue
          // Switch to mock mode after a short attempt delay  
          if (response.status === 500) {
            reconnectAttempts = maxReconnectAttempts - 1; // One more try
          }
          
          // Still try direct connection
          connectWebSocketDirectly();
          
          // We'll still read the response, but won't wait for it
          return response.json().catch(() => ({}));
        }
        
        return response.json();
      })
      .then(data => {
        // If we already triggered direct connection, don't do it again
        if (serverUnavailable) return;
        
        // With our simplified API, the server is always reported as available
        // Just use the WebSocket URL if provided
        if (data.wsUrl) {
          console.log('Using WebSocket URL from API:', data.wsUrl);
          connectWebSocketDirectly(data.wsUrl);
        } else {
          console.warn('API did not return a WebSocket URL, using default');
          connectWebSocketDirectly();
        }
      })
      .catch(error => {
        // Error checking availability, still try direct connection as fallback
        console.error('Error checking server availability:', error);
        connectWebSocketDirectly();
      });
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    connectionStatus = 'disconnected';
    isWebSocketConnected = false;
    isConnecting = false;
    
    // If we've hit max attempts, switch to mock mode
    if (reconnectAttempts >= maxReconnectAttempts) {
      mockModeEnabled = true;
      setupMockWebSocket(playerId, userId, userName, onMessageReceived, 'server_error');
    }
  }
  
  // Function to attempt direct WebSocket connection
  function connectWebSocketDirectly(suggestedUrl?: string) {
    // Close any existing connection first
    if (chatWs) {
      try {
        chatWs.close();
      } catch (e) {
        console.warn('Error closing existing WebSocket:', e);
      }
      chatWs = null;
    }

    // Try to use wss URL with host-relative path first if on HTTPS
    let wsUrl = '';
    if (suggestedUrl) {
      wsUrl = suggestedUrl;
    } else if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      wsUrl = `wss://${window.location.host}/api/ws/chat?player_id=${playerId}`;
    } else {
      // Direct connection as fallback
      wsUrl = `wss://serverhub.biz/ws/cschat/P${playerId}Chat/?player_id=${playerId}`;
    }
    
    console.log('Connecting to WebSocket:', wsUrl);

    try {
      chatWs = new WebSocket(wsUrl);
      
      // Set a timeout to prevent hanging connections
      const connectionTimeout = setTimeout(() => {
        if (chatWs && chatWs.readyState !== WebSocket.OPEN) {
          console.warn('WebSocket connection timed out');
          
          if (chatWs) {
            try {
              chatWs.close();
            } catch (e) {
              // Ignore
            }
            chatWs = null;
          }
          
          isConnecting = false;
          
          // If we've hit max attempts, switch to mock mode
          if (reconnectAttempts >= maxReconnectAttempts) {
            console.log('Max reconnection attempts reached, switching to mock mode');
            mockModeEnabled = true;
            setupMockWebSocket(playerId, userId, userName, onMessageReceived, 'server_error');
          }
        }
      }, 10000); // 10 second timeout

      chatWs.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('Chat WebSocket connected successfully');
        isWebSocketConnected = true;
        isUsingMockWebSocket = false;
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
          
          // Attempt to send any pending messages
          sendPendingMessages();
        } catch (error) {
          console.error('Error sending initial message:', error);
        }
      };

      chatWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'message':
              // Create an enhanced message object with additional properties
              const enhancedMessage = {
                ...data,
                // Ensure we have a valid status if it's missing
                status: data.status || 'delivered',
                // Add extra info missing in the server response
                is_player_sender: data.sender == userId || data.sent_by_player,
                is_admin_sender: !data.is_player_sender,
                // Add client-side timestamp for debugging
                client_receive_time: new Date().toISOString()
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
              
            case 'typing':
              // Handle typing indicator messages
              if (latestMessageCallback) {
                latestMessageCallback(data);
              }
              break;

            default:
              console.log('Received unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      };

      chatWs.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('Chat WebSocket error:', error);
        
        connectionStatus = 'disconnected';
        isWebSocketConnected = false;
        isConnecting = false;
        
        // If we have a callback, notify about the error
        if (latestMessageCallback && error instanceof ErrorEvent && error.message) {
          latestMessageCallback({
            id: Date.now(),
            type: 'message',
            message: `Connection error: ${error.message}`,
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
        
        // Increment reconnect attempts
        reconnectAttempts++;
        
        // If we've reached max attempts, switch to mock mode
        if (reconnectAttempts >= maxReconnectAttempts) {
          console.log('Max reconnection attempts reached, switching to mock mode');
          mockModeEnabled = true;
          setupMockWebSocket(playerId, userId, userName, onMessageReceived, 'server_error');
        }
      };

      chatWs.onclose = () => {
        clearTimeout(connectionTimeout);
        console.log('Chat WebSocket connection closed');
        isWebSocketConnected = false;
        connectionStatus = 'disconnected';
        isConnecting = false;

        // Only attempt to reconnect a limited number of times
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Scheduling reconnection attempt in ${backoffDelay}ms`);
          
          setTimeout(() => {
            if (latestMessageCallback && activePlayerId && activeUserId) {
              initializeChatWebSocket(activePlayerId, activeUserId, userName, latestMessageCallback);
            }
          }, backoffDelay);
        } else {
          console.log('Max reconnection attempts reached, switching to mock mode');
          mockModeEnabled = true;
          setupMockWebSocket(playerId, userId, userName, onMessageReceived, 'server_error');
        }
      };
    } catch (connectionError) {
      // Handle any errors during WebSocket creation
      console.error('Error creating WebSocket connection:', connectionError);
      isConnecting = false;
      
      // Increment reconnect attempts
      reconnectAttempts++;
        
      // If we've reached max attempts, switch to mock mode
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('Error creating WebSocket, switching to mock mode');
        mockModeEnabled = true;
        setupMockWebSocket(playerId, userId, userName, onMessageReceived, 'server_error');
      }
    }
  }
};

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