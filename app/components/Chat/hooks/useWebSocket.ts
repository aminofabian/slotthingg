import { useRef, useState, useEffect, useCallback } from 'react';
import { ChatMessageData } from '../components';

// Create a shared message tracker that can be used across components
export const sharedMessageTracker = {
  processedIds: new Map<number, boolean>(),
  has: function(id: number | string): boolean {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    return this.processedIds.has(numId);
  },
  set: function(id: number | string, value: boolean = true): void {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    this.processedIds.set(numId, value);
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

interface WebSocketHookProps {
  userId: string;
  userName: string;
  playerId: string;
  selectedAdmin: string;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageData[]>>;
}

interface WebSocketHookReturn {
  ws: React.RefObject<WebSocket | null>;
  isWebSocketConnected: boolean;
  isUsingMockWebSocket: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  showConnectionToast: boolean;
  setShowConnectionToast: (show: boolean) => void;
  initializeWebSocket: () => void;
  hasProcessedMessage: (messageId: string | number) => boolean;
  markMessageAsProcessed: (messageId: string | number) => void;
}

export const useWebSocket = ({
  userId,
  userName,
  playerId,
  selectedAdmin,
  setMessages
}: WebSocketHookProps): WebSocketHookReturn => {
  const ws = useRef<WebSocket | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [isUsingMockWebSocket, setIsUsingMockWebSocket] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [showConnectionToast, setShowConnectionToast] = useState(false);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const isConnecting = useRef(false);

  const initializeWebSocket = useCallback(() => {
    if (isConnecting.current || ws.current?.readyState === WebSocket.CONNECTING) {
      console.log('Connection already in progress, skipping...');
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (!playerId) {
      console.error('No player ID available for WebSocket connection');
      return;
    }

    console.log(`Initializing WebSocket connection, attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts}`);
    isConnecting.current = true;
    setConnectionStatus('connecting');

    try {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }

      const wsUrl = `wss://serverhub.biz/ws/cschat/P${playerId}Chat/?player_id=${playerId}`;
      console.log('Connecting to WebSocket:', wsUrl);

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsWebSocketConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        isConnecting.current = false;

        // Send initial presence message
        try {
          ws.current?.send(JSON.stringify({
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
        if (ws.current?.readyState === WebSocket.OPEN) {
          try {
            ws.current.send(JSON.stringify({
              type: 'heartbeat',
              user_id: userId,
              player_id: playerId,
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error('Error sending heartbeat:', error);
          }
        }
      }, 30000); // Send heartbeat every 30 seconds

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'pong') {
            console.log('Received pong from server');
            return;
          }
          
          // Check message ID only to prevent duplicates
          const messageId = typeof data.id === 'string' ? parseInt(data.id) : data.id;
          if (data.type === 'message') {
            // Create the message object
            const newMessage: ChatMessageData = {
              id: messageId,
              type: data.type,
              message: data.message,
              sender: parseInt(data.sender_id),
              sender_name: data.sender_name,
              sent_time: data.sent_time || new Date().toISOString(),
              is_file: data.is_file || false,
              file: data.file,
              is_player_sender: data.is_player_sender,
              is_tip: data.is_tip || false,
              is_comment: data.is_comment || false,
              status: 'delivered',
              attachments: data.attachments || [],
              recipient_id: data.recipient_id ? parseInt(data.recipient_id) : undefined,
              is_admin_recipient: data.is_admin_recipient
            };

            // Update messages while preventing duplicates
            setMessages(prev => {
              // Find if this message already exists in the state
              const existingMsgIndex = prev.findIndex(msg => msg.id === newMessage.id);
              
              if (existingMsgIndex >= 0) {
                // If message exists, update it with the server version
                const updatedMessages = [...prev];
                updatedMessages[existingMsgIndex] = {
                  ...updatedMessages[existingMsgIndex],
                  status: 'delivered' // Update status to delivered
                };
                return updatedMessages;
              }
              
              // If we already processed this message ID but it's not in the state,
              // it might be a duplicate from the server, so we'll add it to processedMessageIds
              if (sharedMessageTracker.has(messageId)) {
                return prev;
              }
              
              // Otherwise add the message and mark it as processed
              sharedMessageTracker.set(messageId);
              
              // Add new message and sort
              const updatedMessages = [...prev, newMessage].sort((a, b) => 
                new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
              );
              
              return updatedMessages;
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
        isConnecting.current = false;
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsWebSocketConnected(false);
        setConnectionStatus('disconnected');
        isConnecting.current = false;
        clearInterval(heartbeatInterval); // Clean up heartbeat interval

        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`Scheduling reconnection attempt in ${backoffDelay}ms`);
          setTimeout(initializeWebSocket, backoffDelay);
        } else {
          console.log('Max reconnection attempts reached');
          setShowConnectionToast(true);
        }
      };

    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setConnectionStatus('disconnected');
      isConnecting.current = false;
    }
  }, [playerId, setMessages]);

  useEffect(() => {
    if (playerId) {
      console.log('Initializing WebSocket due to playerId change:', playerId);
      
      // Clear processed message IDs when playerId changes to prevent stale references
      sharedMessageTracker.clear();
      
      initializeWebSocket();
    }

    return () => {
      console.log('Cleaning up WebSocket connection');
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      isConnecting.current = false;
      reconnectAttempts.current = 0;
    };
  }, [playerId, initializeWebSocket]);

  const initializeMockWebSocket = () => {
    console.log('Initializing mock WebSocket...');
    setIsUsingMockWebSocket(true);
    setConnectionStatus('connected');

    const mockWs = {
      readyState: WebSocket.OPEN,
      send: (data: string) => {
        console.log('Mock WebSocket sending:', data);
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.type === 'ping') {
            setTimeout(() => {
              if (ws.current === mockWs) {
                console.log('Mock WebSocket: Sending pong response');
              }
            }, 50);
            return;
          }
        } catch (error) {
          console.error('Error processing mock message:', error);
        }
      },
      close: () => {
        console.log('Mock WebSocket closed');
      }
    };
    
    ws.current = mockWs as unknown as WebSocket;
    setIsWebSocketConnected(true);
  };

  const hasProcessedMessage = (messageId: string | number): boolean => {
    return sharedMessageTracker.has(messageId);
  };

  const markMessageAsProcessed = (messageId: string | number): void => {
    sharedMessageTracker.set(messageId);
  };

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      sharedMessageTracker.cleanup();
    }, 300000);
    
    return () => {
      clearInterval(cleanupInterval);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    ws,
    isWebSocketConnected,
    isUsingMockWebSocket,
    connectionStatus,
    showConnectionToast,
    setShowConnectionToast,
    initializeWebSocket,
    hasProcessedMessage,
    markMessageAsProcessed
  };
};