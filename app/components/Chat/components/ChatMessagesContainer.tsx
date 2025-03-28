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
  const initialLoadDone = useRef<boolean>(false);
  
  // Track the previous messages length to detect new messages
  const [previousMessagesLength, setPreviousMessagesLength] = useState(0);
  
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