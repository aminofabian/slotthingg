'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoArrowDown } from 'react-icons/io5';
import MessagesList from './MessagesList';
import { useScroll } from '../hooks/useScroll';
import { sendChatMessage, isWebSocketConnected, sendTypingIndicator, sharedMessageTracker } from '@/app/lib/socket';
import { ChatMessageData } from '.';

interface ChatMessagesContainerProps {
  messages: ChatMessageData[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  userName: string;
  userId: string;
  playerId: string;
  selectedAdmin: string;
  retryMessage: (messageId: number) => void;
  isMobileView: boolean;
  loadMoreMessages?: () => Promise<boolean>;
  hasMoreMessages?: boolean;
}

const ChatMessagesContainer = ({
  messages,
  isLoading,
  isLoadingMore = false,
  userName,
  userId,
  playerId,
  selectedAdmin,
  retryMessage,
  isMobileView,
  loadMoreMessages,
  hasMoreMessages = false
}: ChatMessagesContainerProps) => {
  // Create properly typed refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef<boolean>(false);
  const scrollPositionRef = useRef<number | null>(null);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  
  // Track the previous messages length to detect new messages
  const [previousMessagesLength, setPreviousMessagesLength] = useState(0);
  
  // Use scrolling logic from the useScroll hook
  const {
    showScrollToBottom,
    hasNewMessages,
    setHasNewMessages,
    handleScroll: baseHandleScroll,
    scrollToBottom
  } = useScroll({
    chatContainerRef,
    messagesEndRef
  });

  // Custom scroll handler to detect when user scrolls to the top
  const handleScroll = useCallback(() => {
    // Call the base scroll handler from useScroll
    baseHandleScroll();
    
    // Check if user is near the top and we should load more messages
    if (chatContainerRef.current && loadMoreMessages && hasMoreMessages && !isLoadingOlderMessages) {
      const { scrollTop } = chatContainerRef.current;
      
      // If user has scrolled close to the top (within 50px), load more messages
      if (scrollTop < 50) {
        // Save current scroll position to restore after loading more messages
        scrollPositionRef.current = chatContainerRef.current.scrollHeight;
        
        // Load more messages
        setIsLoadingOlderMessages(true);
        
        // Add error handling and timeout
        const loadingTimeout = setTimeout(() => {
          if (isLoadingOlderMessages) {
            console.warn('Loading more messages timed out');
            setIsLoadingOlderMessages(false);
          }
        }, 10000); // 10 second timeout
        
        loadMoreMessages()
          .then(success => {
            clearTimeout(loadingTimeout);
            if (!success) {
              console.warn('Failed to load more messages');
            }
          })
          .catch(err => {
            console.error('Error loading more messages:', err);
          })
          .finally(() => {
            setIsLoadingOlderMessages(false);
            clearTimeout(loadingTimeout);
          });
      }
    }
  }, [baseHandleScroll, loadMoreMessages, hasMoreMessages, isLoadingOlderMessages]);

  // Maintain scroll position when new messages are loaded at the top
  useEffect(() => {
    // Only run if we're loading more messages and have a saved position
    if (chatContainerRef.current && scrollPositionRef.current && isLoadingOlderMessages === false) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      
      // Restore position, maintaining the same relative position
      // This is necessary because when we prepend messages, the scroll jumps to top
      if (scrollPositionRef.current && newScrollHeight > scrollPositionRef.current) {
        const scrollDifference = newScrollHeight - scrollPositionRef.current;
        chatContainerRef.current.scrollTop = scrollDifference;
        console.log(`Restoring scroll position after loading more messages (offset: ${scrollDifference}px)`);
      }
      
      // Clear the saved position
      scrollPositionRef.current = null;
    }
  }, [messages.length, isLoadingOlderMessages]);

  // Only scroll to bottom for the initial load of messages
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !initialLoadDone.current) {
      // Only scroll on initial load
      initialLoadDone.current = true;
      scrollToBottom();
    }
  }, [isLoading, messages.length, scrollToBottom]);

  // Handle auto-scrolling and new message indicators when messages update
  useEffect(() => {
    // Only run this for message updates, not initial load
    if (messages.length > 0 && !isLoading && initialLoadDone.current) {
      // Check if new messages were added
      const hasReceivedNewMessages = messages.length > previousMessagesLength;
      setPreviousMessagesLength(messages.length);
      
      // Only if new messages arrived
      if (hasReceivedNewMessages && chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 100;
        
        // Only auto-scroll if user is already at the bottom
        if (isScrolledToBottom) {
          // If user is at the bottom, scroll to show new messages
          setTimeout(() => scrollToBottom(), 100);
        } else {
          // If user has scrolled up and new messages arrived, show new message indicator
          setHasNewMessages(true);
        }
      }
    }
  }, [messages, isLoading, scrollToBottom, setHasNewMessages, previousMessagesLength]);

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Loading indicator for older messages */}
      {isLoadingOlderMessages && (
        <div className="absolute top-0 left-0 right-0 py-2 bg-[#00ffff]/10 text-center text-xs z-10 flex items-center justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#00ffff]/70 animate-ping"></div>
          <span className="text-[#00ffff] font-medium">Loading older messages...</span>
        </div>
      )}
      
      <MessagesList
        ref={chatContainerRef}
        messages={messages}
        isLoading={isLoading}
        userName={userName}
        selectedAdmin={selectedAdmin}
        retryMessage={retryMessage}
        onScroll={handleScroll}
        messagesEndRef={messagesEndRef}
        isMobileView={isMobileView}
        isLoadingMore={isLoadingOlderMessages}
      />
      
      {/* Show scroll to bottom button when needed */}
      {showScrollToBottom && (
        <button
          className="absolute bottom-4 right-4 bg-[#00ffff]/90 text-black p-2 rounded-full shadow-lg border border-[#00ffff]/30 hover:opacity-90 transition-all z-50 backdrop-blur-sm hover:bg-[#00ffff]"
          onClick={scrollToBottom}
        >
          <IoArrowDown className="w-5 h-5" />
          {hasNewMessages && (
            <span className="absolute -top-1 -right-1 bg-[#ff00ff]/90 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full shadow-sm" />
          )}
        </button>
      )}
    </div>
  );
};

export default ChatMessagesContainer; 