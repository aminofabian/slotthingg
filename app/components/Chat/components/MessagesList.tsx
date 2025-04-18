'use client';
import React, { useRef, useEffect, forwardRef } from 'react';
import { ChatMessageData } from '.';
import ChatMessage from './ChatMessage';
import { AnimatePresence, m } from 'framer-motion';
import { IoChatbubbleEllipses } from 'react-icons/io5';
import { MotionDiv } from '@/app/types/motion';

interface MessagesListProps {
  messages: ChatMessageData[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  userName: string;
  selectedAdmin: string;
  retryMessage: (messageId: number) => void;
  onScroll: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isMobileView: boolean;
}

// Use forwardRef to properly handle ref forwarding
const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(({
  messages,
  isLoading,
  isLoadingMore = false,
  userName,
  selectedAdmin,
  retryMessage,
  onScroll,
  messagesEndRef,
  isMobileView
}, ref) => {
  return (
    <div 
      ref={ref}
      className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 
        bg-gradient-to-b from-black/30 via-transparent to-transparent
        scrollbar-thin scrollbar-thumb-[#00ffff]/10 scrollbar-track-transparent
        flex flex-col"
      style={{ 
        maxHeight: isMobileView ? 'calc(100vh - 160px)' : 'calc(100vh - 140px)',
        overscrollBehavior: 'contain' // Prevent scroll chaining
      }}
      onScroll={onScroll}
    >
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-[#00ffff]/70">Loading messages...</div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/50 text-center">
            <IoChatbubbleEllipses className="mx-auto w-12 h-12 mb-3 text-[#00ffff]/30 animate-pulse" />
            <p className="font-light tracking-wide">No messages yet.</p>
            <p className="text-sm mt-1 opacity-70 font-light">Start a conversation!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Add padding to allow scrolling to top */}
          <div className="pt-2"></div>
          
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              // Check if this message is part of a consecutive group from the same sender
              const previousMsg = index > 0 ? messages[index - 1] : null;
              const isConsecutive = !!previousMsg && 
                previousMsg.sender === msg.sender &&
                new Date(msg.sent_time).getTime() - new Date(previousMsg.sent_time).getTime() < 60000; // 1 minute
              
              return (
                <MotionDiv
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <ChatMessage
                    message={msg}
                    isPlayerMessage={msg.is_player_sender}
                    isAdminMessage={!msg.is_player_sender}
                    userName={userName}
                    selectedAdmin={selectedAdmin}
                    availableAdmins={[{ id: selectedAdmin, name: 'Support' }]}
                    retryMessage={retryMessage}
                    isConsecutive={isConsecutive}
                  />
                </MotionDiv>
              );
            })}
          </AnimatePresence>
          
          {/* This div is the target for scrollToBottom */}
          <div ref={messagesEndRef} className="h-1" />
          
          {/* Add padding at bottom to allow space for scroll */}
          <div className="pb-2"></div>
        </>
      )}
    </div>
  );
});

// Display name for debugging
MessagesList.displayName = 'MessagesList';

export default MessagesList; 