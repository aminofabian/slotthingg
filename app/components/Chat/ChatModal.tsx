'use client';
import { AnimatePresence, LazyMotion, domMax, m } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
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
import { initializeChatWebSocket, sendChatMessage, sendTypingIndicator, connectionStatus as wsConnectionStatus, isWebSocketConnected, sharedMessageTracker } from '@/app/lib/socket';
import { useTyping } from './hooks/useTyping';
import { useScroll } from './hooks/useScroll';
import { MotionDiv } from '@/app/types/motion';

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
  const [showConnectionToast, setShowConnectionToast] = useState(false);

  // Create properly typed refs
  const messagesEndRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const chatContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsInitialized = useRef(false);

  // Handle incoming messages
  const handleMessageReceived = useCallback((data: any) => {
    // Generate a message ID if one isn't provided
    const messageId = data.id ? 
      (typeof data.id === 'string' ? parseInt(data.id) : data.id) :
      Date.now() + Math.floor(Math.random() * 1000);
    
    // Create the message object with all possible fields
    const newMessage: ChatMessageData = {
      id: messageId,
      type: data.type,
      message: data.message || '',
      sender: parseInt(data.sender_id || data.sender || '0'),
      sender_name: data.sender_name || 'Unknown',
      sent_time: data.sent_time || new Date().toISOString(),
      is_file: Boolean(data.is_file),
      file: data.file || null,
      is_player_sender: Boolean(data.is_player_sender),
      is_tip: Boolean(data.is_tip),
      is_comment: Boolean(data.is_comment),
      status: 'delivered',
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
      recipient_id: data.recipient_id ? parseInt(data.recipient_id) : undefined,
      is_admin_recipient: Boolean(data.is_admin_recipient)
    };

    console.log('Received new message:', newMessage);

    // Update messages
    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      const messageExists = prev.some(msg => msg.id === messageId);
      if (messageExists) {
        console.log('Message already exists in state, skipping:', messageId);
        return prev;
      }

      // Add new message and maintain chronological order
      const updatedMessages = [...prev, newMessage].sort((a, b) => 
        new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
      );
      
      return updatedMessages;
    });
  }, []);

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
    // Only run if we have messages and the chat is open
    if (messages.length > 0 && isOpen) {
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
  }, [messages, isOpen, scrollToBottom, setHasNewMessages]);

  const {
    isTyping,
    isAdminTyping,
    setIsAdminTyping,
    handleTyping: handleTypingIndicator
  } = useTyping({
    userId,
    userName,
    selectedAdmin,
    sendTypingIndicator
  });

  // Initialize WebSocket when user info is available
  useEffect(() => {
    if (playerId && userId && !wsInitialized.current) {
      console.log('Initializing chat WebSocket with:', { playerId, userId, userName });
      initializeChatWebSocket(playerId, userId, userName, handleMessageReceived);
      wsInitialized.current = true;
    }
    
    // Re-initialize WebSocket if connection is lost
    const checkConnectionInterval = setInterval(() => {
      if (playerId && userId && !isWebSocketConnected) {
        console.log('WebSocket disconnected, attempting to reconnect...');
        initializeChatWebSocket(playerId, userId, userName, handleMessageReceived);
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(checkConnectionInterval);
    };
  }, [playerId, userId, userName, handleMessageReceived, isWebSocketConnected]);

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
        const response = await fetch(
          `/api/chat/history?whitelabel_admin_uuid=${whitelabel_admin_uuid}&limit=1000`, 
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Chat history response:', data);

          if (Array.isArray(data.results)) {
            // Create a Map to track unique messages by ID and content
            const uniqueMessages = new Map();
            
            // Process each message and only keep the latest version
            data.results.forEach((msg: ChatMessageData) => {
              const messageId = typeof msg.id === 'string' ? parseInt(msg.id) : msg.id;
              const messageKey = `${messageId}`;
              
              // Only add if we haven't seen this message before
              if (!uniqueMessages.has(messageKey)) {
                uniqueMessages.set(messageKey, {
                  ...msg,
                  id: messageId,
                  sender: typeof msg.sender === 'string' ? parseInt(msg.sender) : msg.sender,
                  sent_time: msg.sent_time || new Date().toISOString(),
                  is_file: msg.is_file || false,
                  is_tip: msg.is_tip || false,
                  is_comment: msg.is_comment || false,
                  status: msg.status || 'delivered',
                  attachments: msg.attachments || [],
                  recipient_id: msg.recipient_id ? String(msg.recipient_id) : undefined,
                });
              }
            });

            // Convert Map back to array and sort by timestamp
            const processedMessages = Array.from(uniqueMessages.values()).sort((a, b) => 
              new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
            );

            console.log(`Loaded ${processedMessages.length} unique messages`);
            
            // Clear any existing messages to prevent duplicates
            setMessages(processedMessages);
            
            // Mark all loaded messages as processed
            processedMessages.forEach(msg => {
              const messageKey = `${msg.id}`;
              sharedMessageTracker.set(messageKey);
            });
          } else {
            console.warn('Invalid chat history format:', data);
            setMessages([]);
          }
        } else {
          console.warn('Chat history response error:', {
            status: response.status,
            statusText: response.statusText
          });
          setMessages([]);
        }
      } catch (error) {
        console.warn('Chat history endpoint error:', error);
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
      initializeChatWebSocket(playerId, userId, userName, handleMessageReceived);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'error' as const } 
            : msg
        )
      );
      setShowConnectionToast(true);
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
        console.log('Preventing duplicate message send:', messageText);
        return;
      }

      // Clear input fields first to prevent double-sending if the user types quickly
      const currentMessage = messageText;
      const currentFile = selectedFile;
      setNewMessage('');
      setSelectedFile(null);

      // Mark this message as processed immediately
      const messageKey = `${messageId}`;
      sharedMessageTracker.set(messageKey);

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
        // Check if message already exists by ID
        const messageExists = prev.some(msg => msg.id === messageId);
        
        if (messageExists) {
          console.log('Message already in state, skipping:', messageId);
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
      if (isWebSocketConnected) {
        try {
          sendChatMessage(messagePayload);
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
          setShowConnectionToast(true);
        }
      } else {
        console.error('WebSocket is not connected');
        initializeChatWebSocket(playerId, userId, userName, handleMessageReceived);
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

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  // Handle typing wrapper function
  const handleTypingWrapper = (message: string) => {
    if (message) {
      sendTypingIndicator(userId, playerId, selectedAdmin);
    }
  };

  return (
    <LazyMotion features={domMax}>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div onClick={onClose}>
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:bg-black/20"
              />
            </div>
            
            {/* Connection Status Toast */}
            <ConnectionStatus 
              showConnectionToast={showConnectionToast}
              connectionStatus={wsConnectionStatus}
              onClose={() => setShowConnectionToast(false)}
              onRetry={() => {
                initializeChatWebSocket(playerId, userId, userName, handleMessageReceived);
                setShowConnectionToast(false);
              }}
            />
            
            {/* Chat Modal */}
            <MotionDiv
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
                isUsingMockWebSocket={false}
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
                  <MotionDiv
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
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
                  </MotionDiv>
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
                isUsingMockWebSocket={false}
                selectedAdmin={selectedAdmin}
                handleTyping={handleTypingWrapper}
                availableAdmins={[{ id: selectedAdmin, name: 'Support' }]}
              />
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
};

export default ChatModal; 