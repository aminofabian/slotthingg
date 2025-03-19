import { useState, useRef, useEffect } from 'react';

interface UseTypingProps {
  ws: React.RefObject<WebSocket>;
  userId: string;
  userName: string;
  selectedAdmin: string | null;
  isWebSocketConnected: boolean;
  isUsingMockWebSocket: boolean;
}

interface UseTypingReturn {
  isTyping: boolean;
  isAdminTyping: boolean;
  setIsAdminTyping: (typing: boolean) => void;
  handleTyping: (message: string) => void;
}

export const useTyping = ({
  ws,
  userId,
  userName,
  selectedAdmin,
  isWebSocketConnected,
  isUsingMockWebSocket
}: UseTypingProps): UseTypingReturn => {
  const [isTyping, setIsTyping] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAdminTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsAdminTyping(false);
      }, 3000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isAdminTyping]);

  const handleTyping = (message: string) => {
    if (!isTyping && message.trim().length > 0) {
      setIsTyping(true);
      
      if ((ws.current?.readyState === WebSocket.OPEN || isUsingMockWebSocket) && selectedAdmin) {
        try {
          ws.current?.send(JSON.stringify({
            type: "typing",
            sender: userId,
            sender_name: userName || 'User',
            recipient_id: selectedAdmin ? parseInt(selectedAdmin) : undefined,
            is_admin_recipient: true
          }));
        } catch (error) {
          console.error('Error sending typing indicator:', error);
        }
      }
    }
    
    if (typingIndicatorTimeoutRef.current) {
      clearTimeout(typingIndicatorTimeoutRef.current);
    }
    
    typingIndicatorTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    isAdminTyping,
    setIsAdminTyping,
    handleTyping
  };
}; 