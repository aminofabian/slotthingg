'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, LazyMotion, domMax, m } from 'framer-motion';
import { IoRefresh } from 'react-icons/io5';
import { ChatHeader, ChatInput, TypingIndicator, ChatMessageData } from './components';
import ChatMessagesContainer from './components/ChatMessagesContainer';
import WebSocketManager from './components/WebSocketManager';
import { useUserInfo } from './hooks/useUserInfo';
import { useMessages } from './hooks/useMessages';
import { useTyping } from './hooks/useTyping';
import { sendChatMessage, isWebSocketConnected, sharedMessageTracker } from '@/app/lib/socket';
import { MotionDiv } from '@/app/types/motion';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Main ChatModal component
const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  // Get user info
  const { userId, playerId, userName, loadUserInfo } = useUserInfo();
  
  // State for UI
  const [showConnectionToast, setShowConnectionToast] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAdmin] = useState<string>('1'); // Default admin ID
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get message handling functions
  const {
    messages,
    setMessages,
    isLoading,
    isLoadingMore,
    hasMoreMessages,
    fetchChatHistory,
    handleMessageReceived,
    retryMessage,
    trackSentMessage,
    sentMessageIds,
    loadMoreMessages
  } = useMessages({
    userId,
    userName, 
    selectedAdmin
  });

  // Get typing indicator functionality
  const {
    isTyping,
    isAdminTyping,
    setIsAdminTyping,
    handleTyping: handleTypingIndicator
  } = useTyping({
    userId,
    userName,
    selectedAdmin
  });

  // Detect mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobileView();
    
    // Add resize listener
    window.addEventListener('resize', checkMobileView);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  // Load history when chat is opened
  useEffect(() => {
    if (isOpen) {
      // Load user info
      loadUserInfo();
      
      // Set a flag to track initial load
      const initialLoadFlag = 'chat_initial_load_complete';
      const hasInitiallyLoaded = localStorage.getItem(initialLoadFlag);
      
      // Only load history if we haven't already loaded it during this session
      if (!hasInitiallyLoaded) {
        console.log('Performing initial history load');
        fetchChatHistory();
        localStorage.setItem(initialLoadFlag, 'true');
      } else {
        console.log('Initial load already complete, skipping duplicate fetch');
      }
      
      document.body.style.overflow = 'hidden';
      
      // When the drawer closes, clear the initial load flag
      return () => {
        document.body.style.overflow = 'unset';
        localStorage.removeItem(initialLoadFlag);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, loadUserInfo, fetchChatHistory]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // Upload file function
  const uploadFile = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Try to use the upload endpoint
      try {
        const response = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          return data.url;
        }
      } catch (error) {
        console.warn('File upload endpoint not accessible.');
      }
      
      // If the endpoint fails, return a mock URL
      console.warn('Using mock file URL. Implement /api/chat/upload endpoint for production.');
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  };

  // Retry failed message
  const handleRetryMessage = (messageId: number) => {
    const failedMessage = retryMessage(messageId);
    if (!failedMessage) return;
    
    if (isWebSocketConnected) {
      try {
        sharedMessageTracker.set(messageId.toString());
        
        sendChatMessage({
          type: "message",
          id: failedMessage.id,
          message: failedMessage.message,
          sender_id: userId,
          sender_name: userName || failedMessage.sender_name || 'User',
          sent_time: failedMessage.sent_time,
          is_player_sender: true,
          is_file: failedMessage.is_file,
          file: failedMessage.file,
          recipient_id: failedMessage.recipient_id,
          is_admin_recipient: failedMessage.is_admin_recipient
        });
      } catch (error) {
        console.error('Error retrying message:', error);
        setShowConnectionToast(true);
      }
    } else {
      console.error('WebSocket is not connected');
      setShowConnectionToast(true);
    }
  };

  // Send message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      // Debug logging - keep this minimal to reduce console spam
      console.log('Sending message');

      let isFile = false;
      let fileUrl = null;
      let attachments: { 
        id: string; 
        type: 'image' | 'file'; 
        url: string; 
        name: string; 
        size: number; 
      }[] = [];
      
      if (selectedFile) {
        try {
          fileUrl = await uploadFile(selectedFile);
          isFile = true;
          attachments.push({
            id: Date.now().toString(),
            type: selectedFile.type.startsWith('image/') ? 'image' : 'file' as 'image' | 'file',
            url: fileUrl,
            name: selectedFile.name,
            size: selectedFile.size
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          setShowConnectionToast(true);
          return;
        }
      }

      // Generate a unique message ID
      const messageId = Date.now();
      const messageText = newMessage.trim();
      const messageTimestamp = new Date().toISOString();

      // Skip if we've already processed this message
      if (sharedMessageTracker.has(messageId.toString())) {
        console.log('Preventing duplicate message send');
        return;
      }
      
      // TEMPORARY: Extra check for very recent duplicate outgoing message with same content
      // This prevents duplicates that happen within the same second
      const duplicateExists = messages.some(msg => 
        msg.message === messageText && 
        msg.is_player_sender && 
        Math.abs(new Date().getTime() - new Date(msg.sent_time).getTime()) < 1000
      );
      
      if (duplicateExists) {
        console.log('Detected very recent duplicate outgoing message, skipping');
        return;
      }

      // Clear input fields first to prevent double-sending if the user types quickly
      setNewMessage('');
      setSelectedFile(null);

      // Generate a content fingerprint to prevent echoes
      const contentFingerprint = `${userId}-${messageText}-${messageTimestamp}`;
      
      // Track this message locally
      trackSentMessage(messageId, contentFingerprint);
      sharedMessageTracker.set(messageId.toString());
      sharedMessageTracker.set(contentFingerprint);

      // Create a message object for the local state
      const localMessage: ChatMessageData = {
        id: messageId,
        type: 'message',
        message: messageText,
        sender: parseInt(userId),
        sender_name: userName || 'User',
        sent_time: messageTimestamp,
        is_file: isFile,
        file: fileUrl,
        is_player_sender: true,
        is_tip: false,
        is_comment: false,
        status: 'sent' as const,
        attachments,
        recipient_id: selectedAdmin ? parseInt(selectedAdmin) : undefined,
        is_admin_recipient: !!selectedAdmin
      };

      // IMPORTANT: Create a direct state update rather than using the functional update pattern
      // This avoids race conditions that can cause duplicate messages
      const updatedMessages = [...messages, localMessage].sort((a, b) => 
        new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
      );
      setMessages(updatedMessages);

      // Create the message payload
      const messagePayload = {
        type: "message",
        id: messageId,
        message: messageText,
        sender_id: userId,
        sender_name: userName || localStorage.getItem('current_username') || 'Unknown User',
        sent_time: messageTimestamp,
        is_player_sender: true,
        is_file: isFile,
        file: fileUrl,
        recipient_id: selectedAdmin,
        is_admin_recipient: !!selectedAdmin,
        attachments
      };

      // Send the message via WebSocket
      if (isWebSocketConnected) {
        try {
          sendChatMessage(messagePayload);
        } catch (error) {
          console.error('Error sending message via WebSocket:', error);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, status: 'error' as const } 
                : msg
            )
          );
          setShowConnectionToast(true);
        }
      } else {
        console.error('WebSocket is not connected');
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'error' as const } 
              : msg
          )
        );
        setShowConnectionToast(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setShowConnectionToast(true);
    }
  };

  // Handler for typing wrapper function with throttling
  const handleTypingWrapper = useCallback((message: string) => {
    // Only send typing indicators for messages with content
    if (message) {
      handleTypingIndicator(message);
    }
  }, [handleTypingIndicator]);

  return (
    <LazyMotion features={domMax}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* WebSocket Manager - invisible utility component */}
            <WebSocketManager
              playerId={playerId}
              userId={userId}
              userName={userName}
              onMessageReceived={handleMessageReceived}
            />
            
            {/* Overlay that covers the rest of the screen and closes the drawer when clicked */}
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={onClose}
            />
            
            {/* Modal */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
              <div 
                className="w-full max-w-2xl h-[80vh] bg-gray-900 shadow-xl flex flex-col rounded-xl overflow-hidden border border-[#00ffff]/20"
                onClick={(e) => e.stopPropagation()}
              >
                <ChatHeader
                  isWebSocketConnected={isWebSocketConnected}
                  isUsingMockWebSocket={false}
                  onClose={onClose}
                  onRefresh={() => {
                    console.log('Manual refresh requested');
                    localStorage.setItem('last_manual_refresh', Date.now().toString());
                    fetchChatHistory();
                  }}
                  isMobileView={isMobileView}
                />

                {/* Messages container with scroll handling */}
                <ChatMessagesContainer
                  messages={messages}
                  isLoading={isLoading}
                  isLoadingMore={isLoadingMore}
                  userName={userName}
                  userId={userId}
                  playerId={playerId}
                  selectedAdmin={selectedAdmin}
                  retryMessage={handleRetryMessage}
                  isMobileView={isMobileView}
                  loadMoreMessages={loadMoreMessages}
                  hasMoreMessages={hasMoreMessages}
                />

                {/* Typing Indicator */}
                <TypingIndicator 
                  isAdminTyping={isAdminTyping}
                  selectedAdmin={selectedAdmin}
                />

                {/* Chat Input */}
                <ChatInput 
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  handleSendMessage={handleSendMessage}
                  isWebSocketConnected={isWebSocketConnected}
                  isUsingMockWebSocket={false}
                  selectedAdmin={selectedAdmin}
                  handleTyping={handleTypingWrapper}
                  availableAdmins={[{ id: selectedAdmin, name: 'Support' }]}
                  isMobileView={isMobileView}
                />
                
                {/* File input (hidden) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
};

export default ChatModal; 