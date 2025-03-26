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
  // Always show the button but we'll auto-scroll too
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

  // Modified to ensure more reliable scrolling
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Force immediate scroll without animation for more reliability
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      
      // Then do a smooth scroll for better UX
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // Initial setup and scroll event listener
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      
      // Initial scroll with a slightly longer delay to ensure content is loaded
      setTimeout(() => {
        scrollToBottom();
      }, 500);
      
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