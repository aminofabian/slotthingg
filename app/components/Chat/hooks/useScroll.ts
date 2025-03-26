import { useState, useEffect, RefObject } from 'react';

interface UseScrollProps {
  chatContainerRef: RefObject<HTMLDivElement>;
  messagesEndRef: RefObject<HTMLDivElement>;
}

interface UseScrollReturn {
  showScrollToBottom: boolean;
  hasNewMessages: boolean;
  setHasNewMessages: (value: boolean) => void;
  handleScroll: () => void;
  scrollToBottom: () => void;
}

export const useScroll = ({
  chatContainerRef,
  messagesEndRef
}: UseScrollProps): UseScrollReturn => {
  const [showScrollToBottom, setShowScrollToBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollToBottom(isScrolledUp);
      
      if (!isScrolledUp) {
        setHasNewMessages(false);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      setTimeout(() => {
        scrollToBottom();
      }, 300);
      
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return {
    showScrollToBottom,
    hasNewMessages,
    setHasNewMessages,
    handleScroll,
    scrollToBottom
  };
}; 