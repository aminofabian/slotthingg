'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend, IoChatbubbleEllipses, IoAttach, IoCheckmarkDone, IoAlert, IoRefresh, IoDocument, IoArrowDown } from 'react-icons/io5';
import { format } from 'date-fns';
import {
  ChatHeader,
  ChatInput,
  ChatMessages,
  ConnectionStatus,
  TypingIndicator,
  ChatMessageData
} from './components';
import { useWebSocket } from './hooks/useWebSocket';
import { useTyping } from './hooks/useTyping';
import { useScroll } from './hooks/useScroll';

interface ChatMessage {
  id: number;
  type: 'message' | 'join';
  message: string;
  sender: number;
  sender_name?: string;
  sent_time: string;
  is_file: boolean;
  file: string | null;
  is_player_sender: boolean;
  is_tip: boolean;
  is_comment: boolean;
  status: 'sent' | 'delivered' | 'seen' | 'error';
  attachments?: Attachment[];
  recipient_id?: number;
  is_admin_recipient?: boolean;
}

interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
}

interface UserStatus {
  id: number;
  isOnline: boolean;
  lastSeen: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  // State declarations
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<UserStatus[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string>('14');
  const [playerId, setPlayerId] = useState<string>('9');
  const [userName, setUserName] = useState<string>('');
  const [selectedAdmin] = useState<string>('1'); // Default admin ID
  const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set());

  // Create properly typed refs
  const messagesEndRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const chatContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks
  const {
    ws,
    isWebSocketConnected,
    isUsingMockWebSocket,
    connectionStatus,
    showConnectionToast: wsShowConnectionToast,
    setShowConnectionToast: wsSetShowConnectionToast,
    initializeWebSocket,
    processedMessageIds,
    hasProcessedMessage,
    markMessageAsProcessed
  } = useWebSocket({
    userId,
    userName,
    playerId,
    selectedAdmin
  });

  const {
    isTyping,
    isAdminTyping,
    setIsAdminTyping,
    handleTyping: handleTypingIndicator
  } = useTyping({
    ws,
    userId,
    userName,
    selectedAdmin,
    isWebSocketConnected,
    isUsingMockWebSocket
  });

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

  useEffect(() => {
    if (isOpen) {
      loadUserInfo();
      fetchChatHistory();
      
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user and player IDs from localStorage
  useEffect(() => {
    // Check if localStorage is available (for SSR compatibility)
    const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
    
    if (isLocalStorageAvailable) {
      // Get player ID first since this determines the chat room
      const storedPlayerId = localStorage.getItem('player_id');
      if (storedPlayerId) {
        console.log('Setting player ID:', storedPlayerId);
        setPlayerId(storedPlayerId);
      } else {
        // If no player_id, try to get it from user profile
        try {
          const userProfileStr = localStorage.getItem('user_profile');
          if (userProfileStr) {
            const userProfile = JSON.parse(userProfileStr);
            if (userProfile && userProfile.player_id) {
              console.log('Setting player ID from profile:', userProfile.player_id);
              setPlayerId(String(userProfile.player_id));
            }
          }
        } catch (error) {
          console.warn('Error parsing user profile:', error);
        }
      }

      // Get user ID (this is for message sending)
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        console.log('Setting user ID:', storedUserId);
        setUserId(storedUserId);
      }
    }
  }, []);

  // Load user information from localStorage
  const loadUserInfo = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // First try to get the name from the auth token or user session
        const userSession = localStorage.getItem('user_session');
        const authToken = localStorage.getItem('auth_token');
        
        if (userSession) {
          try {
            const session = JSON.parse(userSession);
            if (session.user?.name || session.user?.username) {
              setUserName(session.user.name || session.user.username);
              return; // Exit if we found the name
            }
          } catch (e) {
            console.warn('Failed to parse user session');
          }
        }

        // Then try the user profile
        const userProfile = localStorage.getItem('user_profile');
        if (userProfile) {
          try {
            const profile = JSON.parse(userProfile);
            if (profile.name || profile.username) {
              setUserName(profile.name || profile.username);
              return; // Exit if we found the name
            }
          } catch (e) {
            console.warn('Failed to parse user profile');
          }
        }

        // Finally, try individual keys in a specific order of priority
        const nameKeys = [
          'current_username',    // Add this as highest priority
          'username',           // Then check username
          'user_name',         // Then user_name
          'display_name',      // Then display_name
          'name',             // Then just name
          'player_name'       // Finally player_name
        ];

        for (const key of nameKeys) {
          const storedName = localStorage.getItem(key);
          if (storedName) {
            setUserName(storedName);
            return; // Exit once we find a valid name
          }
        }

        // If we still don't have a name, log a warning
        console.warn('No user name found in localStorage');
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
      
      // Check if the endpoint is accessible
      try {
      const response = await fetch(`/api/chat/history?whitelabel_admin_uuid=${whitelabel_admin_uuid}`, {
        credentials: 'include'
      });

        if (response.ok) {
          const data = await response.json();
          setMessages(data.results);
        } else {
          // If the endpoint returns an error, use empty messages array
          console.warn(`Chat history endpoint returned ${response.status}. Using empty chat history.`);
          setMessages([]);
        }
      } catch (error) {
        // If the endpoint is not accessible, use empty messages array
        console.warn('Chat history endpoint not accessible. Using empty chat history.');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

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
      // In a production environment, you would implement the file upload endpoint
      console.warn('Using mock file URL. Implement /api/chat/upload endpoint for production.');
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  };

  // Function to retry sending a failed message
  const retryMessage = (messageId: number) => {
    const failedMessage = messages.find(msg => msg.id === messageId);
    if (!failedMessage) return;
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sent' as const } 
          : msg
      )
    );
    
    if (ws.current?.readyState === WebSocket.OPEN || isUsingMockWebSocket) {
      try {
        processedMessageIds.current.add(messageId);
        
        ws.current?.send(JSON.stringify({
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
        }));
      } catch (error) {
        console.error('Error retrying message:', error);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'error' as const } 
              : msg
          )
        );
      }
    } else {
      console.error('WebSocket is not connected');
      if (!isUsingMockWebSocket) {
        initializeWebSocket();
      }
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'error' as const } 
            : msg
        )
      );
      wsSetShowConnectionToast(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      // Add this debug logging
      console.log('Current user name:', userName);
      console.log('localStorage contents:', {
        user_session: localStorage.getItem('user_session'),
        user_profile: localStorage.getItem('user_profile'),
        username: localStorage.getItem('username'),
        current_username: localStorage.getItem('current_username'),
        user_name: localStorage.getItem('user_name')
      });

      let isFile = false;
      let fileUrl = null;
      let attachments: Attachment[] = [];
      
      if (selectedFile) {
        try {
          fileUrl = await uploadFile(selectedFile);
          isFile = true;
        attachments.push({
          id: Date.now().toString(),
          type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
          url: fileUrl,
          name: selectedFile.name,
          size: selectedFile.size
        });
        } catch (error) {
          console.error('Error uploading file:', error);
          wsSetShowConnectionToast(true);
          return;
        }
      }

      // Generate a unique message ID
      const messageId = Date.now();
      const messageText = newMessage.trim();
      const messageTimestamp = new Date().toISOString();

      // Skip if we've already processed this message
      if (hasProcessedMessage(messageId)) {
        console.log('Preventing duplicate message send:', messageText);
        return;
      }

      // Clear input fields first to prevent double-sending if the user types quickly
      const currentMessage = messageText;
      const currentFile = selectedFile;
      setNewMessage('');
      setSelectedFile(null);

      // Mark this message as processed immediately
      markMessageAsProcessed(messageId);

      // Create a message object for the local state
      const localMessage: ChatMessage = {
        id: messageId,
        type: 'message',
        message: currentMessage,
        sender: parseInt(userId),
        sender_name: userName || 'User',
        sent_time: messageTimestamp,
        is_file: isFile,
        file: fileUrl,
        is_player_sender: true,
        is_tip: false,
        is_comment: false,
        status: 'sent',
        attachments,
        recipient_id: selectedAdmin ? parseInt(selectedAdmin) : undefined,
        is_admin_recipient: !!selectedAdmin
      };

      // Add the message to the local state
      setMessages(prev => [...prev, localMessage]);
      scrollToBottom();

      // Send the message via WebSocket
      if (ws.current?.readyState === WebSocket.OPEN || isUsingMockWebSocket) {
        try {
          ws.current?.send(JSON.stringify({
            type: "message",
            id: messageId,
            message: currentMessage,
            sender_id: userId,
            sender_name: userName || localStorage.getItem('current_username') || 'Unknown User',
            sent_time: messageTimestamp,
            is_player_sender: true,
            is_file: isFile,
            file: fileUrl,
            recipient_id: selectedAdmin,
            is_admin_recipient: !!selectedAdmin
          }));
        } catch (error) {
          console.error('Error sending message via WebSocket:', error);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, status: 'error' as const } 
                : msg
            )
          );
          wsSetShowConnectionToast(true);
        }
      } else {
        console.error('WebSocket is not connected');
        initializeWebSocket();
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'error' as const } 
              : msg
          )
        );
        wsSetShowConnectionToast(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      wsSetShowConnectionToast(true);
    }
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  // Create a wrapper for handleTypingIndicator to match the expected type
  const handleTypingWrapper = () => {
    if (newMessage) {
      handleTypingIndicator(newMessage);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:bg-black/20"
          />
          
          {/* Connection Status Toast */}
          <ConnectionStatus 
            showConnectionToast={wsShowConnectionToast}
            connectionStatus={connectionStatus}
            onClose={() => wsSetShowConnectionToast(false)}
            onRetry={() => {
              initializeWebSocket();
              wsSetShowConnectionToast(false);
            }}
          />
          
          {/* Chat Modal */}
          <motion.div
            initial={{ x: '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-full sm:w-[400px] md:w-[450px] lg:w-[500px] 
              bg-gradient-to-br from-[#001a1a] to-[#002f2f]
              shadow-2xl shadow-[#00ffff]/5 border-r border-[#00ffff]/10 
              overflow-hidden flex flex-col z-[61]"
          >
            {/* Chat Header */}
            <ChatHeader 
              isWebSocketConnected={isWebSocketConnected}
              isUsingMockWebSocket={isUsingMockWebSocket}
              onClose={onClose}
            />

            {/* Messages */}
            <ChatMessages 
              messages={messages}
              isLoading={isLoading}
              selectedAdmin={selectedAdmin}
              userName={userName}
              retryMessage={retryMessage}
              showScrollToBottom={showScrollToBottom}
              hasNewMessages={hasNewMessages}
              scrollToBottom={scrollToBottom}
              setNewMessage={setNewMessage}
              messagesEndRef={messagesEndRef}
              chatContainerRef={chatContainerRef}
              availableAdmins={[{ id: selectedAdmin, name: 'Support' }]}
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
              isUsingMockWebSocket={isUsingMockWebSocket}
              selectedAdmin={selectedAdmin}
              handleTyping={handleTypingWrapper}
              availableAdmins={[{ id: selectedAdmin, name: 'Support' }]}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatModal; 