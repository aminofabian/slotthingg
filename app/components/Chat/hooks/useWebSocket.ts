import { useRef, useState, useEffect, useCallback } from 'react';
import { ChatMessageData } from '../components';

interface WebSocketHookProps {
  userId: string;
  userName: string;
  playerId: string;
  selectedAdmin: string | null;
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
  processedMessageIds: React.RefObject<Set<string | number>>;
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
  const processedMessageIds = useRef(new Set<string | number>());
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
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'pong') {
            console.log('Received pong from server');
            return;
          }
          
          // Check both message ID and timestamp to prevent duplicates
          const messageKey = `${data.id}-${data.sent_time}`;
          if (data.type === 'message' && !processedMessageIds.current.has(messageKey)) {
            processedMessageIds.current.add(messageKey);
            
            const newMessage: ChatMessageData = {
              id: typeof data.id === 'string' ? parseInt(data.id) : data.id,
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

            // Always add messages from others, and update status for own messages
            setMessages(prev => {
              // Check if this is an update to an existing message
              const existingMessageIndex = prev.findIndex(msg => msg.id === newMessage.id);
              
              if (existingMessageIndex !== -1) {
                // Update existing message status
                const updatedMessages = [...prev];
                updatedMessages[existingMessageIndex] = {
                  ...updatedMessages[existingMessageIndex],
                  status: newMessage.status
                };
                return updatedMessages;
              }
              
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
    return processedMessageIds.current.has(messageId);
  };

  const markMessageAsProcessed = (messageId: string | number): void => {
    processedMessageIds.current.add(messageId);
  };

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (processedMessageIds.current.size > 1000) {
        const idsArray = Array.from(processedMessageIds.current);
        processedMessageIds.current = new Set(idsArray.slice(idsArray.length - 1000));
      }
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
    processedMessageIds,
    hasProcessedMessage,
    markMessageAsProcessed
  };
}; 