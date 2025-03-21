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
  const [userId, setUserId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
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
    selectedAdmin,
    setMessages
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
      try {
        // Try to get user info from user_profile first
        const userProfileStr = localStorage.getItem('user_profile');
        if (userProfileStr) {
          const userProfile = JSON.parse(userProfileStr);
          if (userProfile) {
            // Get the user's actual ID
            const id = String(userProfile.id || userProfile.user_id);
            console.log('Setting user info from profile:', { id, name: userProfile.username });
            
            setUserId(id);
            setPlayerId(id); // Use the same ID for both
            setUserName(userProfile.username || userProfile.name || '');
            return; // Exit if we found the info
          }
        }

        // Fallback to individual storage items if profile not found
        const storedUserId = localStorage.getItem('user_id');
        const storedPlayerId = localStorage.getItem('player_id');
        
        if (storedUserId) {
          console.log('Setting user ID from storage:', storedUserId);
          setUserId(storedUserId);
        }
        
        if (storedPlayerId) {
          console.log('Setting player ID from storage:', storedPlayerId);
          setPlayerId(storedPlayerId);
        } else if (storedUserId) {
          // If no player_id but we have user_id, use that
          console.log('Using user ID as player ID:', storedUserId);
          setPlayerId(storedUserId);
        }
      } catch (error) {
        console.error('Error loading user/player IDs:', error);
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
      
      console.log('Fetching chat history with params:', {
        whitelabel_admin_uuid,
        userId,
        playerId,
        userName
      });
      
      try {
        const response = await fetch(`/api/chat/history?whitelabel_admin_uuid=${whitelabel_admin_uuid}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Chat history response:', data);
          // Sort messages by timestamp before setting state
          const sortedMessages = data.results.sort((a: ChatMessageData, b: ChatMessageData) => 
            new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
          );
          setMessages(sortedMessages);
        } else {
          console.warn('Chat history response error:', {
            status: response.status,
            statusText: response.statusText
          });
          setMessages([]);
        }
      } catch (error) {
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
      // Debug logging for user context
      console.log('Sending message with context:', {
        userId,
        playerId,
        userName,
        selectedAdmin,
        localStorage: {
          user_session: localStorage.getItem('user_session'),
          user_profile: localStorage.getItem('user_profile'),
          username: localStorage.getItem('username'),
          current_username: localStorage.getItem('current_username'),
          user_name: localStorage.getItem('user_name'),
          whitelabel_admin_uuid: localStorage.getItem('whitelabel_admin_uuid')
        }
      });

      let isFile = false;
      let fileUrl = null;
      let attachments: Attachment[] = [];
      
      if (selectedFile) {
        try {
          console.log('Uploading file:', {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size
          });
          fileUrl = await uploadFile(selectedFile);
          isFile = true;
          attachments.push({
            id: Date.now().toString(),
            type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
            url: fileUrl,
            name: selectedFile.name,
            size: selectedFile.size
          });
          console.log('File upload successful:', { fileUrl, attachments });
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
      if (hasProcessedMessage(messageId.toString())) {
        console.log('Preventing duplicate message send:', messageText);
        return;
      }

      // Clear input fields first to prevent double-sending if the user types quickly
      const currentMessage = messageText;
      const currentFile = selectedFile;
      setNewMessage('');
      setSelectedFile(null);

      // Mark this message as processed immediately
      const messageKey = `${messageId}-${messageTimestamp}`;
      markMessageAsProcessed(messageKey);

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

      // Add the message to the local state, checking for duplicates
      setMessages(prev => {
        // Check if message already exists
        const messageExists = prev.some(msg => 
          msg.id === messageId || 
          (msg.sent_time === messageTimestamp && msg.message === currentMessage)
        );
        
        if (messageExists) {
          return prev;
        }
        
        // Sort messages by timestamp to maintain order
        const updatedMessages = [...prev, localMessage].sort((a, b) => 
          new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
        );
        return updatedMessages;
      });
      scrollToBottom();

      // Create the message payload
      const messagePayload = {
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
        is_admin_recipient: !!selectedAdmin,
        attachments
      };

      console.log('Sending WebSocket message:', messagePayload);

      // Send the message via WebSocket
      if (ws.current?.readyState === WebSocket.OPEN || isUsingMockWebSocket) {
        try {
          ws.current?.send(JSON.stringify(messagePayload));
          console.log('WebSocket message sent successfully');
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
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 
                bg-gradient-to-b from-black/20 via-transparent to-transparent
                scrollbar-thin scrollbar-thumb-[#00ffff]/10 scrollbar-track-transparent
                flex flex-col"
              style={{ maxHeight: 'calc(100vh - 160px)' }}
            >
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={msg.id}
                  className={`flex ${msg.is_player_sender ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'message' ? (
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] relative group ${
                        msg.is_player_sender
                          ? 'bg-gradient-to-br from-[#00ffff]/20 to-[#00ffff]/10 text-white shadow-lg shadow-[#00ffff]/20 rounded-t-2xl rounded-bl-2xl rounded-br-md before:content-[""] before:absolute before:-right-2 before:bottom-0 before:border-8 before:border-transparent before:border-b-[#00ffff]/20'
                          : 'bg-gradient-to-br from-[#ff00ff]/20 to-[#9400d3]/20 text-white shadow-lg shadow-[#ff00ff]/20 rounded-t-2xl rounded-br-2xl rounded-bl-md before:content-[""] before:absolute before:-left-2 before:bottom-0 before:border-8 before:border-transparent before:border-b-[#9400d3]/20'
                      } px-4 py-2.5 backdrop-blur-sm border border-white/5
                      transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}
                    >
                      {/* Sender name - only show for admin messages */}
                      {!msg.is_player_sender && (
                        <div className="text-xs text-[#ff00ff]/80 mb-1 font-medium">
                          {msg.sender_name || 'Admin'}
                        </div>
                      )}
                      
                      <div className="text-sm sm:text-base break-words leading-relaxed">
                        {msg.message}
                      </div>

                      {/* Time and status */}
                      <div className={`flex items-center gap-1.5 mt-1 text-[0.65rem] ${
                        msg.is_player_sender ? 'text-[#00ffff]/70' : 'text-[#ff00ff]/70'
                      }`}>
                        <span>{formatTime(msg.sent_time)}</span>
                        {msg.is_player_sender && (
                          <div className="flex items-center gap-1">
                            {msg.status === 'error' ? (
                              <button
                                onClick={() => retryMessage(msg.id)}
                                className="flex items-center gap-1 text-red-400 hover:text-red-300"
                              >
                                <IoAlert className="w-3.5 h-3.5" />
                                <IoRefresh className="w-3 h-3" />
                              </button>
                            ) : (
                              <IoCheckmarkDone className={`w-3.5 h-3.5 ${
                                msg.status === 'seen' ? 'text-[#00ffff]' : 'text-[#00ffff]/50'
                              }`} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-white/40 py-2 italic">
                      {msg.message}
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

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