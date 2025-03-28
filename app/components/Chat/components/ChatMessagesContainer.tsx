'use client';
import { useState, useEffect, useRef } from 'react';
import { IoArrowDown } from 'react-icons/io5';
import MessagesList from './MessagesList';
import { useScroll } from '../hooks/useScroll';
import { sendChatMessage, isWebSocketConnected, sendTypingIndicator, sharedMessageTracker } from '@/app/lib/socket';
import { ChatMessageData } from '.';

interface ChatMessagesContainerProps {
  messages: ChatMessageData[];
  isLoading: boolean;
  userName: string;
  userId: string;
  playerId: string;
  selectedAdmin: string;
  retryMessage: (messageId: number) => void;
  isMobileView: boolean;
}

const ChatMessagesContainer = ({
  messages,
  isLoading,
  userName,
  userId,
  playerId,
  selectedAdmin,
  retryMessage,
  isMobileView
}: ChatMessagesContainerProps) => {
  // Create properly typed refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Use scrolling logic from the useScroll hook
  const {
    showScrollToBottom,
    hasNewMessages,
    setHasNewMessages,
    handleScroll,
    scrollToBottom
  } = useScroll({
    chatContainerRef,
    messagesEndRef
  });

  // Handle auto-scrolling and new message indicators when messages update
  useEffect(() => {
    // Only run if we have messages and not loading
    if (messages.length > 0 && !isLoading) {
      // Check if user has scrolled up
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 100;
        
        if (isScrolledToBottom) {
          // If user is at the bottom, scroll to show new messages
          setTimeout(() => scrollToBottom(), 100);
        } else {
          // If user has scrolled up, show new message indicator
          setHasNewMessages(true);
        }
      }
    }
  }, [messages, isLoading, scrollToBottom, setHasNewMessages]);

  // Scroll to bottom when component mounts or on refresh
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 300);
    }
  }, [isLoading, messages.length, scrollToBottom]);

  return (
    <div className="relative flex-1 flex flex-col">
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