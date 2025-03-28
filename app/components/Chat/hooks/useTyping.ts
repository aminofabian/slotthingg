import { useState, useRef, useEffect } from 'react';
import { sendTypingIndicator } from '@/app/lib/socket';

interface TypingHookProps {
  userId: string;
  userName: string;
  selectedAdmin: string | null;
}

interface UseTypingReturn {
  isTyping: boolean;
  isAdminTyping: boolean;
  setIsAdminTyping: (typing: boolean) => void;
  handleTyping: (message: string) => void;
}

export const useTyping = ({
  userId,
  userName,
  selectedAdmin
}: TypingHookProps): UseTypingReturn => {
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
      
      if (selectedAdmin) {
        try {
          // Send typing indicator via the unified socket implementation
          sendTypingIndicator(userId, userId, selectedAdmin);
        } catch (error) {
          console.error('Error sending typing indicator:', error);
        }
      }

      // Reset typing status after a delay
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
      
      typingIndicatorTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
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