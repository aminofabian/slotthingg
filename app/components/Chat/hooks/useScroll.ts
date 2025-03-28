import React, { useState, useEffect, RefObject, useRef } from 'react';

interface UseScrollProps {
  chatContainerRef: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>;
  messagesEndRef: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>;
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
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false);
  const [hasNewMessages, setHasNewMessages] = useState<boolean>(false);
  const [userHasScrolled, setUserHasScrolled] = useState<boolean>(false);
  const lastUserInteraction = useRef<number>(0);
  const preventAutoScroll = useRef<boolean>(false);
  
  // Handler for user-initiated scroll events
  const handleScroll = React.useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      
      // Record this as a user interaction
      lastUserInteraction.current = Date.now();
      
      // Prevent auto-scrolling for the next 2 seconds after user scrolls
      preventAutoScroll.current = true;
      
      // Is user scrolled away from bottom?
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      
      // Only show button when scrolled up
      setShowScrollToBottom(isScrolledUp);
      
      // If user has scrolled up significantly, mark it 
      if (isScrolledUp && !userHasScrolled) {
        console.log('User has scrolled up - disabling auto-scroll');
        setUserHasScrolled(true);
      }
      
      // If scrolled back to bottom, clear new messages flag
      if (!isScrolledUp) {
        setHasNewMessages(false);
      }
    }
  }, [chatContainerRef, userHasScrolled]);

  // Scroll to bottom - but only if user initiated or it's been a while since last interaction
  const scrollToBottom = React.useCallback((force = false) => {
    // Skip auto-scrolling if user recently scrolled, unless force=true
    const now = Date.now();
    const timeSinceLastInteraction = now - lastUserInteraction.current;
    
    if (!force && preventAutoScroll.current && timeSinceLastInteraction < 2000) {
      console.log('Skipping auto-scroll: user recently scrolled');
      return;
    }
    
    // Allow auto-scrolling again after delay
    if (timeSinceLastInteraction > 2000) {
      preventAutoScroll.current = false;
    }
    
    if (messagesEndRef.current) {
      console.log('Executing scrollToBottom' + (force ? ' (forced)' : ''));
      
      // Use the appropriate behavior based on whether this is forced
      const behavior = force ? 'auto' : 'smooth';
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, [messagesEndRef]);

  // Set up scroll event listener only once
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      // Add scroll listener
      chatContainer.addEventListener('scroll', handleScroll);
      
      // Initial scroll after content is loaded
      setTimeout(() => {
        // Initial scroll is forced
        scrollToBottom(true);
      }, 500);
      
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [chatContainerRef, handleScroll, scrollToBottom]);

  return {
    showScrollToBottom,
    hasNewMessages,
    setHasNewMessages,
    handleScroll,
    scrollToBottom: (force = true) => scrollToBottom(force) // Force scroll when button clicked
  };
}; 