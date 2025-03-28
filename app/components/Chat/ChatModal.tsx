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

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatDrawer = ({ isOpen, onClose }: ChatDrawerProps) => {
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
  const localSentMessageIds = useRef<Set<string>>(new Set());  // Track message IDs we've sent locally
  const recentIncomingMessages = useRef<Map<string, number>>(new Map()); // Track recently received incoming messages by content

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

  // Fetch chat history - defined as useCallback so it can be used in dependency arrays
  const fetchChatHistory = useCallback(async () => {
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
            
            // Store the current time as the last message update time in localStorage
            localStorage.setItem('last_message_time', Date.now().toString());
            
            // Merge with existing messages to avoid UI flicker, only adding new ones
            setMessages(prevMessages => {
              // Create a map of existing messages by ID for quick lookup
              const existingMessageMap = new Map();
              prevMessages.forEach(msg => {
                existingMessageMap.set(`${msg.id}`, msg);
              });
              
              // Build a new array with all uniquified messages
              const mergedMessages = [...prevMessages];
              let addedCount = 0;
              
              processedMessages.forEach(msg => {
                const msgKey = `${msg.id}`;
                
                // Only add if we don't have this exact ID already
                if (!existingMessageMap.has(msgKey)) {
                  // For content messages, check for near-duplicates with slightly different IDs
                  let isDuplicate = false;
                  if (msg.message) {
                    // Look for very similar existing messages
                    isDuplicate = prevMessages.some(existingMsg => 
                      existingMsg.message === msg.message && 
                      existingMsg.sender === msg.sender &&
                      Math.abs(new Date(existingMsg.sent_time).getTime() - new Date(msg.sent_time).getTime()) < 5000
                    );
                  }
                  
                  if (!isDuplicate) {
                    mergedMessages.push(msg);
                    addedCount++;
                    
                    // Track this ID to avoid duplicate processing
                    existingMessageMap.set(msgKey, msg);
                    
                    // Add to sentMessageIds to prevent duplicate processing from WebSocket
                    // but only add to the component's set, not the shared tracker
                    setSentMessageIds(prev => new Set(prev).add(msgKey));
                  }
                }
              });
              
              console.log(`Added ${addedCount} new messages from history`);
              
              // Sort by timestamp
              return mergedMessages.sort((a, b) => 
                new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
              );
            });
            
            // We no longer mark history messages in the shared tracker at all
            // This prevents history loading from blocking real-time messages
            console.log('Not adding history messages to shared tracker to allow real-time messages');
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
  }, [playerId, userId, userName]); // Include dependencies here
  
  // Load user information from localStorage
  const loadUserInfo = useCallback(() => {
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
  }, []);
  
  // Handler for incoming messages (from WebSocket)
  const handleMessageReceived = useCallback((data: any) => {
    // Check if this is a real-time message from the WebSocket (not from history)
    const isRealTimeMessage = data.is_realtime === true;
    
    // Determine if this is a player-sent message early in the process
    const isPlayerSender = data.is_player_sender === true || 
                          data.sender_id === userId || 
                          data.sender === userId;
    
    // *ULTRA AGGRESSIVE CHECK* - If it's a player message, we already have it in the UI
    // This prevents ANY duplicate display of outgoing messages completely
    if (isRealTimeMessage && isPlayerSender) {
      console.log('[OUTGOING] Player message received from server, ignoring to prevent duplicates');
      return;
    }
    
    // Quick check for message echoes - immediately discard them
    if (data._isEcho === true) {
      console.log('[ECHO] Server confirmed this is an echo of our own message, ignoring');
      return;
    }
    
    if (isRealTimeMessage) {
      console.log('%c[REALTIME] Received real-time message', 'background: #ff00ff; color: white', {
        message: data.message?.substring(0, 20) + (data.message?.length > 20 ? '...' : ''),
        sender: data.sender_name || 'Unknown'
      });
    } else {
      console.log('[HISTORY] Processing history message');
    }
    
    try {
      // Generate a message ID if one isn't provided
      const messageId = data.id ? 
        (typeof data.id === 'string' ? parseInt(data.id) : data.id) :
        Date.now() + Math.floor(Math.random() * 1000);
      
      // SPECIAL CHECK FOR INCOMING MESSAGES: If not from player and has content, check for duplicates
      if (!isPlayerSender && data.message) {
        // Create a normalized content hash without timestamp
        const senderKey = `${data.sender || data.sender_id || '0'}`; 
        const normalizedContent = `${senderKey}-${data.message.trim()}`;
        
        // Check if we've seen this content recently
        const now = Date.now();
        const lastSeen = recentIncomingMessages.current.get(normalizedContent);
        
        if (lastSeen && (now - lastSeen < 120000)) { // 2 minute window for duplicates
          console.log('[INCOMING] Duplicate message content detected within 2 minutes, ignoring:', data.message.substring(0, 30));
          return;
        }
        
        // Track this message content
        recentIncomingMessages.current.set(normalizedContent, now);
        
        // Cleanup old messages to prevent memory leaks (keep only last 100)
        if (recentIncomingMessages.current.size > 100) {
          const oldestKeys = Array.from(recentIncomingMessages.current.entries())
            .sort((a, b) => a[1] - b[1])
            .slice(0, recentIncomingMessages.current.size - 100)
            .map(entry => entry[0]);
            
          oldestKeys.forEach(key => recentIncomingMessages.current.delete(key));
        }
      }
      
      // Continue with standard message processing
      // Create a unique key for this message to check for duplicates
      const messageKey = `${messageId}`;
      
      // FIRST CHECK: Do we have this exact message ID in our localSentMessageIds?
      // If yes, this is an echo of our own message, so skip it entirely
      if (localSentMessageIds.current.has(messageKey)) {
        console.log('[REALTIME] Message was sent by us locally, ignoring echo:', messageKey);
        return;
      }
      
      const contentKey = data._contentFingerprint || `${data.sender || data.sender_id}-${data.message}-${data.sent_time}`;
      
      // Skip if we've already processed this exact message ID in our component
      // For history messages, strictly check the ID
      if (!isRealTimeMessage && sentMessageIds.has(messageKey)) {
        console.log('[HISTORY] Already processed this message ID, skipping');
        return;
      }
      
      // Even for real-time messages, avoid exact duplicates by ID
      if (isRealTimeMessage && sentMessageIds.has(messageKey)) {
        console.log('[REALTIME] Already processed exact message ID, skipping');
        return;
      }

      // More aggressive checking for outgoing messages that come back from server
      // This is specifically for messages the user just sent
      if (isRealTimeMessage && sharedMessageTracker.has(messageKey)) {
        console.log('[REALTIME] Message ID exists in shared tracker, likely an echo of our own message, skipping');
        return;
      }
      
      // Check content fingerprint for real-time messages
      if (isRealTimeMessage && contentKey && sentMessageIds.has(contentKey)) {
        console.log('[REALTIME] Content fingerprint match, skipping duplicate message');
        return;
      }
      
      // Extra duplication check for ALL messages - check if we already have a recent message
      // with identical content, regardless of sender
      if (data.message) {
        // Use a longer window for checking duplicate incoming messages
        // This will catch messages that are sent within a minute of each other with same content
        const timeWindow = isPlayerSender ? 5000 : 60000; // 5 seconds for player messages, 60 seconds for incoming
        
        const duplicateExists = messages.some(msg => 
          msg.message === data.message &&
          msg.sender === (data.sender || data.sender_id) &&
          Math.abs(new Date().getTime() - new Date(msg.sent_time).getTime()) < timeWindow
        );
        
        if (duplicateExists) {
          console.log(`[${isRealTimeMessage ? 'REALTIME' : 'HISTORY'}] Found recent duplicate message content, skipping`);
          return;
        }
      }
      
      // Determine sender name with fallbacks
      let senderName = data.sender_name;
      if (!senderName || senderName === "Unknown") {
        if (isPlayerSender) {
          senderName = userName || 'You';
        } else {
          senderName = 'Support';
        }
      }
      
      // Create the message object with all possible fields
      const newMessage: ChatMessageData = {
        id: messageId,
        type: data.type || 'message',
        message: data.message || '',
        sender: typeof data.sender === 'string' ? parseInt(data.sender) : (data.sender || (data.sender_id ? parseInt(data.sender_id) : 0)),
        sender_name: senderName,
        sent_time: data.sent_time || new Date().toISOString(),
        is_file: Boolean(data.is_file),
        file: data.file || null,
        is_player_sender: isPlayerSender,
        is_tip: Boolean(data.is_tip),
        is_comment: Boolean(data.is_comment),
        status: 'delivered',
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        recipient_id: data.recipient_id ? parseInt(data.recipient_id) : undefined,
        is_admin_recipient: Boolean(data.is_admin_recipient)
      };

      // Add to sentMessageIds to prevent duplicate processing
      setSentMessageIds(prev => {
        const updated = new Set(prev);
        updated.add(messageKey);
        // Also track by content for real-time messages
        if (isRealTimeMessage && contentKey) {
          updated.add(contentKey);
        }
        return updated;
      });

      // Update messages - using functional update to avoid race conditions
      setMessages(prev => {
        // Check for exact duplicates by ID
        if (prev.some(msg => msg.id === messageId)) {
          console.log(`[${isRealTimeMessage ? 'REALTIME' : 'HISTORY'}] Message with this ID already exists, skipping:`, messageId);
          return prev;
        }

        // Additional check for content duplicates, but less strict for real-time messages
        let isDuplicate = false;
        
        if (newMessage.message && !isRealTimeMessage) {
          // For history messages, be more strict about duplicates
          isDuplicate = prev.some(msg => 
            msg.message === newMessage.message && 
            msg.sender === newMessage.sender &&
            Math.abs(new Date(msg.sent_time).getTime() - new Date(newMessage.sent_time).getTime()) < 5000
          );
        } else if (newMessage.message && isRealTimeMessage) {
          // For real-time messages, only check for very recent exact duplicates
          isDuplicate = prev.some(msg => 
            msg.message === newMessage.message && 
            msg.sender === newMessage.sender &&
            Math.abs(new Date(msg.sent_time).getTime() - new Date(newMessage.sent_time).getTime()) < 1000 // Much smaller window
          );
        }
        
        if (isDuplicate) {
          console.log(`[${isRealTimeMessage ? 'REALTIME' : 'HISTORY'}] Similar message exists, skipping`);
          return prev;
        }

        console.log(`[${isRealTimeMessage ? 'REALTIME' : 'HISTORY'}] Adding message to state:`, newMessage.message);
        
        // Add new message and maintain chronological order
        const updatedMessages = [...prev, newMessage].sort((a, b) => 
          new Date(a.sent_time).getTime() - new Date(b.sent_time).getTime()
        );
        
        return updatedMessages;
      });

      // For real-time messages or admin messages, ensure we scroll to show the new message
      if (isRealTimeMessage || !newMessage.is_player_sender) {
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Error processing message:', error, data);
    }
  }, [sentMessageIds, scrollToBottom, userId, userName]);
  
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
    selectedAdmin
  });

  // Initialize WebSocket when user info is available
  useEffect(() => {
    // Only try to connect if we have the required data
    if (!playerId || !userId) {
      console.log('Missing player ID or user ID, skipping WebSocket initialization');
      return;
    }
    
    // Prevent multiple initialization attempts
    if (wsInitialized.current) {
      console.log('WebSocket already initialized, skipping');
      return;
    }
    
    // Mark as initialized immediately to prevent multiple connections
    wsInitialized.current = true;
    
    // Create a unique identifier for this connection
    const connectionId = `conn-${Date.now()}`;
    console.log(`Creating WebSocket connection with ID: ${connectionId}`);
    
    console.log('Initializing chat WebSocket with:', { 
      playerId, 
      userId, 
      userName
    });
    
    // Create a direct message handler specifically for this connection
    const handleIncomingMessage = (message: any) => {
      console.log(`WebSocket message received:`, message);
      
      // Force execution on the next tick to avoid React state update issues
      setTimeout(() => {
        // Enhance the message with better sender name if available
        if (message.sender_name === "Unknown" && userName) {
          if (message.is_player_sender) {
            message.sender_name = userName;
          }
        }
        
        handleMessageReceived(message);
      }, 0);
    };
    
    // Initialize the connection with our handler
    initializeChatWebSocket(playerId, userId, userName || 'User', handleIncomingMessage);
    
    // Only check connection status every 10 seconds to reduce server load
    const connectionStatusInterval = setInterval(() => {
      const status = isWebSocketConnected ? 'connected' : 'disconnected';
      console.log(`[Status Check] WebSocket connection status: ${status}`);
      
      // Only attempt to reconnect if we're explicitly disconnected
      if (!isWebSocketConnected && wsInitialized.current) {
        console.log('WebSocket disconnected, attempting to reconnect...');
        initializeChatWebSocket(playerId, userId, userName || 'User', handleIncomingMessage);
      }
    }, 10000); // Check every 10 seconds
    
    // Clean up function
    return () => {
      console.log(`Cleaning up WebSocket connection`);
      clearInterval(connectionStatusInterval);
    };
  }, [playerId, userId, userName, handleMessageReceived]);
  
  // Load history only when chat is opened
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
  
  // Clean up message tracking sets periodically to prevent memory leaks
  useEffect(() => {
    // Don't clean up if chat is not open
    if (!isOpen) return;
    
    // Clean up every 5 minutes
    const cleanupInterval = setInterval(() => {
      // Only keep the last 200 sent message IDs to prevent memory leaks
      if (localSentMessageIds.current.size > 200) {
        console.log('Cleaning up localSentMessageIds');
        const idsArray = Array.from(localSentMessageIds.current);
        const newSet = new Set(idsArray.slice(idsArray.length - 200));
        localSentMessageIds.current = newSet;
      }
      
      // Also clean up shared message tracker
      if (sharedMessageTracker.size() > 500) {
        console.log('Cleaning up sharedMessageTracker');
        sharedMessageTracker.cleanup();
      }
      
      // Clean up recentIncomingMessages - remove messages older than 2 hours
      if (recentIncomingMessages.current.size > 0) {
        console.log('Cleaning up recentIncomingMessages');
        const now = Date.now();
        const twoHoursAgo = now - (2 * 60 * 60 * 1000);
        
        Array.from(recentIncomingMessages.current.entries())
          .filter(([_, timestamp]) => timestamp < twoHoursAgo)
          .forEach(([key, _]) => recentIncomingMessages.current.delete(key));
      }
    }, 300000); // Every 5 minutes
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, [isOpen]);
  
  // Implement a periodic refresh to ensure we haven't missed any messages but at a much lower frequency
  useEffect(() => {
    if (!isOpen) return;
    
    // Track the last time we manually refreshed
    const refreshTimeKey = 'last_manual_chat_refresh';
    
    // Initialize with current time if not set
    if (!localStorage.getItem(refreshTimeKey)) {
      localStorage.setItem(refreshTimeKey, Date.now().toString());
    }
    
    // Refresh much less frequently to reduce server load
    const refreshInterval = setInterval(() => {
      // Only refresh if messages haven't updated in a while and we're open
      const lastMessageUpdate = localStorage.getItem('last_message_time');
      const lastManualRefresh = localStorage.getItem(refreshTimeKey);
      const now = Date.now();
      
      const timeSinceLastUpdate = lastMessageUpdate ? now - parseInt(lastMessageUpdate) : Infinity;
      const timeSinceLastRefresh = lastManualRefresh ? now - parseInt(lastManualRefresh) : Infinity;
      
      // Only refresh if we haven't had messages for a while AND we haven't refreshed recently
      if (timeSinceLastUpdate > 120000 && timeSinceLastRefresh > 300000) {
        console.log('No recent message updates, performing background refresh');
        localStorage.setItem(refreshTimeKey, now.toString());
        fetchChatHistory();
      }
    }, 120000); // Check every 2 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [isOpen, fetchChatHistory]);

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
      // Debug logging - keep this minimal to reduce console spam
      console.log('Sending message');

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

      // Mark this message as processed immediately
      const messageKey = `${messageId}`;
      
      // CRITICALLY IMPORTANT - add this message ID to our local sent messages tracker
      // so we completely ignore it if it comes back from the server
      localSentMessageIds.current.add(messageKey);
      
      sharedMessageTracker.set(messageKey);
      
      // Also add a content fingerprint to prevent echoed messages
      const contentFingerprint = `${userId}-${messageText}-${messageTimestamp}`;
      sharedMessageTracker.set(contentFingerprint);
      setSentMessageIds(prev => {
        const updated = new Set(prev);
        updated.add(messageKey);
        updated.add(contentFingerprint);
        return updated;
      });

      // Create a message object for the local state
      const localMessage: ChatMessage = {
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
        status: 'sent',
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
      
      // Force a scroll after adding the message
      setTimeout(() => scrollToBottom(), 100);

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
            {/* Overlay that covers the rest of the screen and closes the drawer when clicked */}
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={onClose}
            />
            
            {/* Left-side drawer */}
            <MotionDiv
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[90%] sm:w-[400px] md:w-[450px] h-full bg-gray-900 shadow-xl flex flex-col overflow-hidden border-r border-[#00ffff]/20"
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
              />

              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 
                  bg-gradient-to-b from-black/20 via-transparent to-transparent
                  scrollbar-thin scrollbar-thumb-[#00ffff]/10 scrollbar-track-transparent
                  flex flex-col"
                style={{ maxHeight: 'calc(100vh - 140px)' }}
                onScroll={handleScroll}
              >
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-[#00ffff]/70">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-white/50 text-center">
                      <IoChatbubbleEllipses className="mx-auto w-12 h-12 mb-3 text-[#00ffff]/30" />
                      <p>No messages yet.</p>
                      <p className="text-sm mt-1">Start a conversation!</p>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Show scroll to bottom button when needed */}
              {showScrollToBottom && (
                <button
                  className="absolute bottom-[80px] right-4 bg-[#00ffff]/20 p-2 rounded-full shadow-lg border border-[#00ffff]/30 hover:bg-[#00ffff]/30 transition-colors"
                  onClick={scrollToBottom}
                >
                  <IoArrowDown className="text-[#00ffff] w-5 h-5" />
                  {hasNewMessages && (
                    <span className="absolute -top-1 -right-1 bg-[#ff00ff] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full" />
                  )}
                </button>
              )}

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
              
              {/* File input (hidden) */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
};

export default ChatDrawer; 