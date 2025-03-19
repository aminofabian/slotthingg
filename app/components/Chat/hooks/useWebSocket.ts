import { useRef, useState, useEffect } from 'react';
import { ChatMessageData } from '../components';

interface WebSocketHookProps {
  userId: string;
  userName: string;
  playerId: string;
  selectedAdmin: string | null;
}

interface WebSocketHookReturn {
  ws: React.RefObject<WebSocket>;
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
  selectedAdmin
}: WebSocketHookProps): WebSocketHookReturn => {
  const ws = useRef<WebSocket>(null) as React.RefObject<WebSocket>;
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [isUsingMockWebSocket, setIsUsingMockWebSocket] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [showConnectionToast, setShowConnectionToast] = useState(false);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const processedMessageIds = useRef(new Set<string | number>());

  const stopPingInterval = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
  };

  const startPingInterval = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
    }
    
    pingInterval.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        try {
          ws.current.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
        } catch (error) {
          console.warn('Error sending ping:', error);
        }
      } else if (ws.current?.readyState === WebSocket.CLOSED || ws.current?.readyState === WebSocket.CLOSING) {
        console.log('Connection appears to be closed during ping check. Attempting to reconnect...');
        initializeWebSocket();
      }
    }, 30000);
  };

  const initializeWebSocket = () => {
    try {
      const chatRoomId = `P${userId}Chat`;
      const wsUrl = `wss://serverhub.biz/ws/cschat/${chatRoomId}/?player_id=${playerId}`;
      
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }
      
      setIsWebSocketConnected(false);
      setConnectionStatus('connecting');
      
      ws.current = new WebSocket(wsUrl);

      const connectionTimeout = setTimeout(() => {
        if (ws.current && ws.current.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timeout. Falling back to mock WebSocket.');
          ws.current.close();
          initializeMockWebSocket();
        }
      }, 2000);

      ws.current.onopen = () => {
        console.log('WebSocket connection established');
        clearTimeout(connectionTimeout);
        setIsWebSocketConnected(true);
        setIsUsingMockWebSocket(false);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        startPingInterval();
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        clearTimeout(connectionTimeout);
        setConnectionStatus('disconnected');
        setShowConnectionToast(true);
        stopPingInterval();
        
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          initializeMockWebSocket();
        }
      };

      ws.current.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        clearTimeout(connectionTimeout);
        setIsWebSocketConnected(false);
        setConnectionStatus('disconnected');
        stopPingInterval();
        setShowConnectionToast(true);
        
        if (!isUsingMockWebSocket && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const backoffTime = Math.min(500 * Math.pow(1.5, reconnectAttempts.current - 1), 1000);
          setTimeout(initializeWebSocket, backoffTime);
        } else if (reconnectAttempts.current >= maxReconnectAttempts && !isUsingMockWebSocket) {
          initializeMockWebSocket();
        }
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setConnectionStatus('disconnected');
      setShowConnectionToast(true);
      initializeMockWebSocket();
    }
  };

  const initializeMockWebSocket = () => {
    console.log('Initializing mock WebSocket...');
    setIsUsingMockWebSocket(true);
    setConnectionStatus('connected');
    stopPingInterval();

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
        stopPingInterval();
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
      if (processedMessageIds.current.size > 100) {
        const idsArray = Array.from(processedMessageIds.current);
        processedMessageIds.current = new Set(idsArray.slice(idsArray.length - 100));
      }
    }, 60000);
    
    return () => {
      clearInterval(cleanupInterval);
      stopPingInterval();
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