import { useRef, useEffect } from 'react';
import { IoArrowDown, IoChatbubbleEllipses, IoSend } from 'react-icons/io5';
import ChatMessage, { ChatMessageData } from './ChatMessage';

interface ChatMessagesProps {
  messages: ChatMessageData[];
  isLoading: boolean;
  selectedAdmin: string | null;
  userName: string;
  availableAdmins: { id: string; name: string }[];
  retryMessage: (messageId: number) => void;
  showScrollToBottom: boolean;
  hasNewMessages: boolean;
  scrollToBottom: () => void;
  setNewMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages = ({
  messages,
  isLoading,
  selectedAdmin,
  userName,
  availableAdmins,
  retryMessage,
  showScrollToBottom,
  hasNewMessages,
  scrollToBottom,
  setNewMessage,
  messagesEndRef,
  chatContainerRef,
}: ChatMessagesProps) => {
  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#00ffff]/10 scrollbar-track-transparent
        bg-gradient-to-b from-black/10 to-transparent backdrop-blur-sm relative"
    >
      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={() => {
            scrollToBottom();
          }}
          className={`absolute bottom-4 right-4 p-2 rounded-full shadow-lg z-10
            ${hasNewMessages 
              ? 'bg-[#00ffff] text-black animate-bounce' 
              : 'bg-black/50 text-[#00ffff]/80'
            } transition-all duration-300`}
          aria-label="Scroll to bottom"
        >
          {hasNewMessages ? (
            <div className="flex items-center gap-1 px-2">
              <span className="text-xs font-medium">New messages</span>
              <IoArrowDown className="w-4 h-4" />
            </div>
          ) : (
            <IoArrowDown className="w-5 h-5" />
          )}
        </button>
      )}
      
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ffff]"></div>
          <p className="text-[#ff00ff]/70 mt-3 text-sm">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="p-4 rounded-full bg-[#00ffff]/10 mb-4 shadow-lg shadow-[#00ffff]/5">
            <IoChatbubbleEllipses className="w-8 h-8 text-[#00ffff]" />
          </div>
          <p className="text-[#00ffff]/80 text-lg font-medium mb-2">No messages yet</p>
          <p className="text-[#00ffff]/50 text-sm max-w-xs">
            {selectedAdmin 
              ? `Start a conversation with ${availableAdmins.find(a => a.id === selectedAdmin)?.name || 'the admin'}`
              : 'Select an admin to start chatting'}
          </p>
          {selectedAdmin && (
            <button 
              onClick={() => setNewMessage('Hello! I need some assistance.')}
              className="mt-4 bg-[#00ffff]/20 hover:bg-[#00ffff]/30 text-[#00ffff] px-4 py-2 rounded-lg 
                transition-all duration-300 flex items-center gap-2 shadow-lg"
            >
              <IoSend className="w-4 h-4" />
              <span>Start Conversation</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Render only visible messages for better performance */}
          <div className="space-y-1">
            {messages.map((message, index) => {
              // Determine if this message is part of the current admin conversation
              const isRelevantMessage = !selectedAdmin || 
                !message.is_admin_recipient || 
                (message.recipient_id === parseInt(selectedAdmin)) ||
                (message.sender === parseInt(selectedAdmin));
              
              if (!isRelevantMessage) return null;
              
              const isPlayerMessage = message.is_player_sender;
              const isAdminMessage = !isPlayerMessage && message.sender === parseInt(selectedAdmin || '0');
              
              // Group consecutive messages from the same sender
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const isConsecutive = prevMessage && 
                prevMessage.sender === message.sender && 
                Math.abs(new Date(message.sent_time).getTime() - new Date(prevMessage.sent_time).getTime()) < 60000; // Within 1 minute
              
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isPlayerMessage={isPlayerMessage}
                  isAdminMessage={isAdminMessage}
                  userName={userName}
                  selectedAdmin={selectedAdmin}
                  availableAdmins={availableAdmins}
                  retryMessage={retryMessage}
                  isConsecutive={Boolean(isConsecutive)}
                />
              );
            })}
          </div>
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default ChatMessages; 