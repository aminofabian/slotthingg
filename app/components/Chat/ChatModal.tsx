'use client';

import { useState, useEffect, useRef, lazy, Suspense, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend, IoChatbubbleEllipses, IoAttach, IoHappy, IoCheckmarkDone, IoAlert, IoRefresh, IoDocument, IoArrowDown } from 'react-icons/io5';
import { format } from 'date-fns';
// Lazy load the emoji picker to improve initial load time
const EmojiPicker = lazy(() => import('emoji-picker-react').then(module => ({ 
  default: module.default 
})));
import type { EmojiClickData } from 'emoji-picker-react';

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
  recipient_id?: number; // ID of the message recipient (admin or user)
  is_admin_recipient?: boolean; // Whether the recipient is an admin
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

const ChatDrawer = ({ isOpen, onClose }: ChatModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string>('14'); // Default fallback
  const [playerId, setPlayerId] = useState<string>('9'); // Default fallback
  const [userName, setUserName] = useState<string>(''); // User's display name
  const [adminId, setAdminId] = useState<string | null>(null); // ID of the admin to chat with
  const [availableAdmins, setAvailableAdmins] = useState<{id: string, name: string}[]>([]); // List of available admins
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null); // Currently selected admin
  const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set()); // Track sent message IDs to prevent duplicates
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ws = useRef<WebSocket | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);
  const [isUsingMockWebSocket, setIsUsingMockWebSocket] = useState<boolean>(false);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const pingInterval = useRef<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [showConnectionToast, setShowConnectionToast] = useState<boolean>(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Add a debounce mechanism for WebSocket messages
  const processedMessageIds = useRef(new Set<string | number>());

  // Clear processed message IDs periodically to prevent memory leaks
  useEffect(() => {
    const clearInterval = setInterval(() => {
      // Keep only the last 100 message IDs to prevent memory leaks
      if (processedMessageIds.current.size > 100) {
        const idsArray = Array.from(processedMessageIds.current);
        processedMessageIds.current = new Set(idsArray.slice(idsArray.length - 100));
      }
    }, 60000); // Clear every minute
    
    return () => {
      clearInterval(clearInterval);
    };
  }, []);

  // Helper function to check if a message has already been processed
  const hasProcessedMessage = (messageId: string | number): boolean => {
    return processedMessageIds.current.has(messageId);
  };

  // Helper function to mark a message as processed
  const markMessageAsProcessed = (messageId: string | number): void => {
    processedMessageIds.current.add(messageId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Stop the ping interval when component unmounts or chat closes
  const stopPingInterval = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUserInfo(); // Load user info when the chat is opened
      fetchChatHistory();
      
      // Force a fresh connection when the chat is opened
      if (!isWebSocketConnected || ws.current?.readyState !== WebSocket.OPEN) {
        console.log('Chat opened - forcing a fresh WebSocket connection');
        reconnectAttempts.current = 0; // Reset reconnect attempts
        initializeWebSocket();
      } else {
        console.log('Chat opened - using existing WebSocket connection');
      }
      
      fetchAvailableAdmins(); // Fetch available admins
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
      stopPingInterval(); // Stop ping interval when chat is closed
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
      // Clean up WebSocket connection
      if (ws.current) {
        ws.current.close();
      }
      stopPingInterval(); // Stop ping interval on cleanup
    };
  }, [isOpen, playerId, selectedAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user and player IDs from localStorage
  useEffect(() => {
    // Check if localStorage is available (for SSR compatibility)
    const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
    
    if (isLocalStorageAvailable) {
      // Get user ID from localStorage
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(storedUserId);
      }
      
      // Get player ID from localStorage (fallback to user_id if player_id doesn't exist)
      const storedPlayerId = localStorage.getItem('player_id') || localStorage.getItem('user_id');
      if (storedPlayerId) {
        setPlayerId(storedPlayerId);
      }

      // Get admin ID if available
      const storedAdminId = localStorage.getItem('admin_id');
      if (storedAdminId) {
        setAdminId(storedAdminId);
        setSelectedAdmin(storedAdminId);
      }

      // Get user name if available
      const storedUserName = localStorage.getItem('user_name');
      if (storedUserName) {
        setUserName(storedUserName);
      }
    }
  }, []);

  // Load user information from localStorage
  const loadUserInfo = () => {
    try {
      // Check if localStorage is available
      if (typeof window !== 'undefined' && window.localStorage) {
        // Try to get user information from various possible localStorage keys
        const possibleNameKeys = ['user_name', 'username', 'player_name', 'display_name', 'name'];
        
        for (const key of possibleNameKeys) {
          const storedName = localStorage.getItem(key);
          if (storedName) {
            setUserName(storedName);
            break;
          }
        }
        
        // If no name was found, try to get it from user profile if available
        if (!userName) {
          const userProfile = localStorage.getItem('user_profile');
          if (userProfile) {
            try {
              const profile = JSON.parse(userProfile);
              if (profile.name || profile.display_name || profile.username) {
                setUserName(profile.name || profile.display_name || profile.username);
              }
            } catch (e) {
              console.warn('Failed to parse user profile from localStorage');
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error loading user info from localStorage:', error);
    }
  };

  // Call loadUserInfo when component mounts
  useEffect(() => {
    loadUserInfo();
    
    // Preload WebSocket connection to make it faster when chat is opened
    const preloadConnection = () => {
      console.log('Preloading WebSocket connection...');
      // Only preload if we don't already have a connection
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        initializeWebSocket();
      }
    };
    
    // Delay preloading slightly to prioritize other initialization tasks
    const preloadTimer = setTimeout(preloadConnection, 1000);
    
    return () => {
      clearTimeout(preloadTimer);
      if (ws.current) {
        ws.current.close();
      }
      stopPingInterval();
    };
  }, []);

  // Fetch available admins - using mock data for now since the endpoint is missing
  const fetchAvailableAdmins = async () => {
    try {
      // Instead of fetching from a non-existent endpoint, we'll use mock data
      // In a production environment, you would implement this API endpoint
      const mockAdmins = [
        { id: '1', name: 'Support Admin' },
        { id: '2', name: 'Customer Service' }
      ];
      
      setAvailableAdmins(mockAdmins);
      
      // If we have admins and none is selected, select the first one
      if (mockAdmins.length > 0 && !selectedAdmin) {
        setSelectedAdmin(mockAdmins[0].id);
      }
      
      // Optionally, you can show a console message about the missing endpoint
      console.warn('Note: Using mock admin data. Implement /api/chat/admins endpoint for production.');
    } catch (error) {
      console.error('Error setting up admin data:', error);
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

  // Add a function to keep the WebSocket connection alive with ping/pong
  const startPingInterval = () => {
    // Clear any existing interval
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
    }
    
    // Set up a new ping interval (every 30 seconds)
    pingInterval.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        try {
          // Send a ping message to keep the connection alive
          ws.current.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
        } catch (error) {
          console.warn('Error sending ping:', error);
        }
      } else if (ws.current?.readyState === WebSocket.CLOSED || ws.current?.readyState === WebSocket.CLOSING) {
        // If the connection is closed or closing, try to reconnect
        console.log('Connection appears to be closed during ping check. Attempting to reconnect...');
        initializeWebSocket();
      }
    }, 30000); // 30 seconds
  };

  const initializeWebSocket = () => {
    try {
      // Use the state variable for player ID
      const wsUrl = `wss://serverhub.biz/ws/cschat/P9Chat/?player_id=${playerId}`;
      
      // Close existing connection if any
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close();
      }
      
      // Reset connection status
      setIsWebSocketConnected(false);
      setConnectionStatus('connecting');
      
      // Create new WebSocket connection
      console.log('Attempting to connect to WebSocket server...');
      ws.current = new WebSocket(wsUrl);

      // Set connection timeout - reduced from 5000ms to 2000ms for faster fallback
      const connectionTimeout = setTimeout(() => {
        if (ws.current && ws.current.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timeout. Falling back to mock WebSocket.');
          ws.current.close();
          initializeMockWebSocket();
        }
      }, 2000); // 2 second timeout (reduced from 5 seconds)

      ws.current.onopen = () => {
        console.log('WebSocket connection established');
        clearTimeout(connectionTimeout);
        setIsWebSocketConnected(true);
        setIsUsingMockWebSocket(false);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        
        // Start the ping interval to keep the connection alive
        startPingInterval();
        
        // If an admin is selected, send a connection notification
        if (selectedAdmin && ws.current?.readyState === WebSocket.OPEN) {
          try {
            ws.current.send(JSON.stringify({
              type: "connect",
              player_id: playerId,
              admin_id: selectedAdmin
            }));
          } catch (error) {
            console.error('Error sending connection notification:', error);
          }
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle typing indicator
          if (data.type === 'typing' && data.sender !== userId) {
            setIsAdminTyping(true);
            return;
          }
          
          // Handle pong response if the server supports it
          if (data.type === 'pong') {
            console.log('Received pong from server');
            return;
          }
          
          if (data.type === 'live_status') {
            // Handle live status updates
            if (data.player_id) {
        setUserStatus(prevStatus => {
          const newStatus = [...prevStatus];
                const index = newStatus.findIndex(status => status.id === parseInt(data.player_id));
          if (index !== -1) {
                  newStatus[index] = { 
                    ...newStatus[index], 
                    isOnline: data.is_active,
                    lastSeen: data.sent_time
                  };
          } else {
                  newStatus.push({ 
                    id: parseInt(data.player_id), 
                    isOnline: data.is_active,
                    lastSeen: data.sent_time
                  });
          }
          return newStatus;
        });
            }
          } else if (data.type === 'message') {
            // Check for duplicate messages before processing
            const messageTimestamp = data.sent_time || new Date().toISOString();
            const messageId = data.id || Date.now();
            const messageText = data.message || '';
            
            // Skip if we've already processed this message
            if (hasProcessedMessage(messageId)) {
              console.log('Skipping already processed message:', messageId);
              return;
            }
            
            // Mark this message as processed
            markMessageAsProcessed(messageId);
            
            // Create a message object for consistency
            const newMsg: ChatMessage = {
              id: messageId,
              type: 'message',
              message: messageText,
              sender: parseInt(data.sender_id),
              sender_name: data.sender_name || (data.is_player_sender ? userName : availableAdmins.find(a => a.id === data.sender_id)?.name),
              sent_time: messageTimestamp,
              is_file: data.is_file || false,
              file: data.file || null,
              is_player_sender: data.is_player_sender || false,
              is_tip: data.is_tip || false,
              is_comment: data.is_comment || false,
              status: 'delivered',
              attachments: data.attachments || [],
              recipient_id: data.recipient_id ? parseInt(data.recipient_id) : undefined,
              is_admin_recipient: data.is_admin_recipient || false
            };
            
            // Only add the message if it's relevant to the current conversation
            const isRelevantMessage = !selectedAdmin || 
              !newMsg.is_admin_recipient || 
              (newMsg.recipient_id === parseInt(selectedAdmin)) ||
              (newMsg.sender === parseInt(selectedAdmin));
            
            if (!isRelevantMessage) {
              return;
            }
            
            // Handle player-sent messages (messages we sent)
            if (newMsg.is_player_sender) {
              // Check if we already have this message in our state
              setMessages(prevMessages => {
                // Look for an existing message with the same ID or very similar content
                const existingMessageIndex = prevMessages.findIndex(msg => 
                  msg.id === newMsg.id || 
                  (msg.message === newMsg.message && 
                   msg.is_player_sender && 
                   Math.abs(new Date(msg.sent_time).getTime() - new Date(newMsg.sent_time).getTime()) < 5000)
                );
                
                // If we found an existing message, just update its status
                if (existingMessageIndex !== -1) {
                  const updatedMessages = [...prevMessages];
                  updatedMessages[existingMessageIndex] = {
                    ...updatedMessages[existingMessageIndex],
                    status: 'delivered'
                  };
                  return updatedMessages;
                }
                
                // If it's a new message (shouldn't happen often), add it
                // This is a safeguard for messages that might have been sent from another device
                trackSentMessage(messageId, messageText, messageTimestamp);
                return [...prevMessages, newMsg];
              });
            } else {
              // For messages from others (admins), check if it's a duplicate before adding
              if (!isDuplicateMessage(messageId, messageText, messageTimestamp)) {
                // Track this message to prevent duplicates
                trackSentMessage(messageId, messageText, messageTimestamp);
                
                // Add the message
                setMessages(prev => [...prev, newMsg]);
                scrollToBottom();
              }
            }
          } else if (data.type === 'admin_status') {
            // Handle admin status updates (online/offline)
            if (data.admin_id) {
              // Update the admin in the availableAdmins list
              setAvailableAdmins(prev => {
                return prev.map(admin => {
                  if (admin.id === data.admin_id) {
                    return {
                      ...admin,
                      isOnline: data.is_online
                    };
                  }
                  return admin;
                });
              });
            }
      } else if (data.type === 'message_status') {
            // Handle message status updates (delivered/seen)
            setMessages(prev => {
              return prev.map(msg => {
                if (msg.id === parseInt(data.message_id)) {
                  return {
                    ...msg,
                    status: data.status
                  };
                }
                return msg;
              });
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        clearTimeout(connectionTimeout);
        setConnectionStatus('disconnected');
        
        // Show connection toast
        setShowConnectionToast(true);
        
        // Stop ping interval on error
        stopPingInterval();
        
        // If we've tried to connect multiple times and failed, use mock WebSocket
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log('Max reconnect attempts reached. Falling back to mock WebSocket.');
          initializeMockWebSocket();
        }
      };

      ws.current.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        clearTimeout(connectionTimeout);
        setIsWebSocketConnected(false);
        setConnectionStatus('disconnected');
        
        // Stop ping interval on close
        stopPingInterval();
        
        // Show connection toast
        setShowConnectionToast(true);
        
        // Only attempt to reconnect if not using mock WebSocket and not exceeding max attempts
        if (!isUsingMockWebSocket && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          // Use exponential backoff with a maximum of 1 second for faster recovery
          const backoffTime = Math.min(500 * Math.pow(1.5, reconnectAttempts.current - 1), 1000);
          console.log(`Reconnecting in ${backoffTime}ms...`);
          
          setTimeout(() => {
            if (isOpen) initializeWebSocket();
          }, backoffTime);
        } else if (reconnectAttempts.current >= maxReconnectAttempts && !isUsingMockWebSocket) {
          console.log('Max reconnect attempts reached. Falling back to mock WebSocket.');
          initializeMockWebSocket();
        }
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setConnectionStatus('disconnected');
      setShowConnectionToast(true);
      initializeMockWebSocket();
    }
  };

  // Initialize a mock WebSocket for development/fallback
  const initializeMockWebSocket = () => {
    console.log('Initializing mock WebSocket...');
    setIsUsingMockWebSocket(true);
    setConnectionStatus('connected');
    
    // Stop any existing ping interval
    stopPingInterval();
    
    // Create a mock WebSocket object
    const mockWs = {
      readyState: WebSocket.OPEN,
      send: (data: string) => {
        console.log('Mock WebSocket sending:', data);
        
        try {
          const parsedData = JSON.parse(data);
          
          // Handle ping messages in mock mode
          if (parsedData.type === 'ping') {
            // Simulate a pong response
            setTimeout(() => {
              if (ws.current === mockWs) {
                console.log('Mock WebSocket: Sending pong response');
                // No need to actually do anything here since it's a mock
              }
            }, 50);
            return;
          }
          
          // Simulate server response for other message types
          if (parsedData.type === 'message') {
            // Skip if this is a duplicate message
            if (isDuplicateMessage(
              parsedData.id, 
              parsedData.message, 
              parsedData.sent_time
            )) {
              console.log('Mock WebSocket: Skipping duplicate message');
              return;
            }
            
            // Update the status of the message to delivered
            setTimeout(() => {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === parsedData.id 
                    ? { ...msg, status: 'delivered' } 
                    : msg
                )
              );
            }, 500);
            
            // Simulate admin response after a delay
            if (selectedAdmin) {
              setTimeout(() => {
                const adminResponseId = Date.now();
                const adminResponseText = `This is an automated response from ${availableAdmins.find(a => a.id === selectedAdmin)?.name || 'Admin'}.`;
                const adminResponseTime = new Date().toISOString();
                const adminName = availableAdmins.find(a => a.id === selectedAdmin)?.name || 'Admin';
                
                // Skip if this is a duplicate admin response
                if (!isDuplicateMessage(adminResponseId, adminResponseText, adminResponseTime)) {
                  const adminResponse: ChatMessage = {
                    id: adminResponseId,
                    type: 'message',
                    message: adminResponseText,
                    sender: parseInt(selectedAdmin),
                    sender_name: adminName,
                    sent_time: adminResponseTime,
                    is_file: false,
                    file: null,
                    is_player_sender: false,
                    is_tip: false,
                    is_comment: false,
                    status: 'delivered',
                    attachments: []
                  };
                  
                  // Track this message to prevent duplicates
                  trackSentMessage(adminResponseId, adminResponseText, adminResponseTime);
                  
                  // Add admin response to messages
                  setMessages(prev => [...prev, adminResponse]);
                  scrollToBottom();
                }
              }, 2000);
            }
          }
        } catch (error) {
          console.error('Error processing mock message:', error);
        }
      },
      close: () => {
        console.log('Mock WebSocket closed');
        stopPingInterval();
      }
    };
    
    // Set the mock WebSocket
    ws.current = mockWs as unknown as WebSocket;
    setIsWebSocketConnected(true);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
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
          // Show an error message to the user
          setShowConnectionToast(true);
          return;
        }
      }

      // Generate a unique message ID
      const messageId = Date.now();
      const messageText = newMessage.trim();
      const messageTimestamp = new Date().toISOString();

      // Check if this is a duplicate message before adding
      if (isDuplicateMessage(messageId, messageText, messageTimestamp)) {
        console.log('Preventing duplicate message send:', messageText);
        return;
      }

      // Clear input fields first to prevent double-sending if the user types quickly
      const currentMessage = messageText;
      const currentFile = selectedFile;
      setNewMessage('');
      setSelectedFile(null);

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

      // Track this message to prevent duplicates
      trackSentMessage(messageId, currentMessage, messageTimestamp);

      // Add the message to the local state
      setMessages(prev => [...prev, localMessage]);
      scrollToBottom();

      // Send the message via WebSocket in the expected format
      if (ws.current?.readyState === WebSocket.OPEN || isUsingMockWebSocket) {
        try {
          ws.current?.send(JSON.stringify({
            type: "message",
            id: messageId, // Include the message ID to help with deduplication
            message: currentMessage,
            sender_id: userId,
            sender_name: userName || 'User',
            sent_time: messageTimestamp,
            is_player_sender: true,
            is_file: isFile,
            file: fileUrl,
            recipient_id: selectedAdmin, // Add recipient ID if an admin is selected
            is_admin_recipient: !!selectedAdmin // Flag to indicate this is for an admin
          }));
        } catch (error) {
          console.error('Error sending message via WebSocket:', error);
          
          // Update the message status to indicate failure
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, status: 'error' as any } 
                : msg
            )
          );
          
          // Show connection toast
          setShowConnectionToast(true);
        }
      } else {
        console.error('WebSocket is not connected');
        
        // Try to reconnect the WebSocket
        if (!isUsingMockWebSocket) {
          initializeWebSocket();
        } else {
          initializeMockWebSocket();
        }
        
        // Update the message status to indicate failure
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'error' as any } 
            : msg
          )
        );
        
        // Show connection toast
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

  // Add a function to handle admin selection
  const handleAdminSelect = (adminId: string) => {
    setSelectedAdmin(adminId);
    // Optionally, you could fetch the chat history with this specific admin
    fetchChatHistoryWithAdmin(adminId);
  };

  // Function to fetch chat history with a specific admin - modified to work without the endpoint
  const fetchChatHistoryWithAdmin = async (adminId: string) => {
    try {
      setIsLoading(true);
      
      // Filter existing messages for this admin
      const adminMessages = messages.filter(msg => 
        (msg.is_admin_recipient && msg.recipient_id === parseInt(adminId)) || 
        (!msg.is_player_sender && msg.sender === parseInt(adminId))
      );
      
      // If we have existing messages for this admin, use them
      if (adminMessages.length > 0) {
        setMessages(adminMessages);
      } else {
        // Otherwise, start with an empty conversation
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching chat history with admin:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Improved function to check for duplicate messages
  const isDuplicateMessage = (messageId: number | string, messageText: string, timestamp: string): boolean => {
    // Create a unique key for the message
    const messageKey = `${messageId}-${messageText}-${timestamp}`;
    
    // Check if this message is already in our tracking set
    if (sentMessageIds.has(messageKey)) {
      return true;
    }
    
    // Also check if a very similar message exists in the messages array
    return messages.some(msg => {
      // Check for exact ID match
      if (msg.id === messageId) {
        return true;
      }
      
      // Check for similar content and timestamp (within 5 seconds)
      if (msg.message === messageText) {
        const timeDiff = Math.abs(
          new Date(msg.sent_time).getTime() - new Date(timestamp).getTime()
        );
        if (timeDiff < 5000) {
          return true;
        }
      }
      
      return false;
    });
  };

  // Add a function to track sent messages
  const trackSentMessage = (messageId: number | string, messageText: string, timestamp: string) => {
    const messageKey = `${messageId}-${messageText}-${timestamp}`;
    setSentMessageIds(prev => new Set(prev).add(messageKey));
  };

  // Add a function to retry sending a failed message
  const retryMessage = (messageId: number) => {
    // Find the failed message
    const failedMessage = messages.find(msg => msg.id === messageId);
    if (!failedMessage) return;
    
    // Update the message status to 'sending'
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sent' as any } 
        : msg
      )
    );
    
    // Try to send the message again
    if (ws.current?.readyState === WebSocket.OPEN || isUsingMockWebSocket) {
      try {
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
        
        // Update the message status to indicate failure
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'error' as any } 
            : msg
          )
        );
      }
    } else {
      console.error('WebSocket is not connected');
      
      // Try to reconnect the WebSocket
      if (!isUsingMockWebSocket) {
        initializeWebSocket();
      } else {
        initializeMockWebSocket();
      }
      
      // Update the message status to indicate failure
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'error' as any } 
          : msg
        )
      );
        
        // Show connection toast
        setShowConnectionToast(true);
    }
  };

  // Create a memoized message component for better performance
  const ChatMessageItem = memo(({ 
    message, 
    isPlayerMessage, 
    isAdminMessage, 
    userName, 
    selectedAdmin, 
    availableAdmins, 
    formatTime, 
    retryMessage,
    isConsecutive
  }: { 
    message: ChatMessage;
    isPlayerMessage: boolean;
    isAdminMessage: boolean;
    userName: string;
    selectedAdmin: string | null;
    availableAdmins: {id: string, name: string}[];
    formatTime: (timestamp: string) => string;
    retryMessage: (messageId: number) => void;
    isConsecutive: boolean;
  }) => {
    return (
      <div className={`flex ${isPlayerMessage ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mb-1' : 'mb-4'}`}>
        <div 
          className={`max-w-[80%] rounded-2xl p-3 shadow-lg ${
            isPlayerMessage 
              ? 'bg-gradient-to-br from-[#00ffff]/20 to-[#00ffff]/10 text-white rounded-tr-none border-r border-t border-[#00ffff]/20' 
              : isAdminMessage
                ? 'bg-gradient-to-br from-[#ff00ff]/20 to-[#ff00ff]/10 text-white rounded-tl-none border-l border-t border-[#ff00ff]/20'
                : 'bg-gradient-to-br from-gray-700/60 to-gray-700/40 text-white rounded-tl-none border-l border-t border-gray-600/30'
          }`}
        >
          {/* Sender name with avatar initial - only show for first message in a group */}
          {!isConsecutive && (
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                isPlayerMessage 
                  ? 'bg-[#00ffff]/30 text-white' 
                  : isAdminMessage 
                    ? 'bg-[#ff00ff]/30 text-white' 
                    : 'bg-gray-600 text-white'
              }`}>
                {(message.sender_name || userName || 'User').charAt(0).toUpperCase()}
              </div>
              <div className="text-xs font-medium text-white/80">
                {isPlayerMessage 
                  ? (message.sender_name || userName || 'You') 
                  : (message.sender_name || availableAdmins.find(a => a.id === selectedAdmin)?.name || 'Admin')}
              </div>
            </div>
          )}
          
          {/* Message content */}
          {message.is_file && message.file ? (
            message.file.match(/\.(jpeg|jpg|gif|png)$/) ? (
              <img 
                src={message.file} 
                alt="Attachment" 
                className="rounded-lg max-h-60 mb-2 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="bg-black/20 p-3 rounded-lg mb-2 flex items-center gap-2 hover:bg-black/30 transition-colors">
                <IoAttach className="text-[#00ffff]" />
                <a 
                  href={message.file} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ffff] underline text-sm"
                >
                  Download Attachment
                </a>
              </div>
            )
          ) : null}
          
          {/* Message text */}
          {message.message && (
            <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
              {message.message}
            </p>
          )}
          
          {/* Message footer */}
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-white/50">
              {formatTime(message.sent_time)}
            </span>
            {isPlayerMessage && (
              <div className="flex items-center gap-1">
                {message.status === 'seen' ? (
                  <div className="flex items-center gap-1">
                    <IoCheckmarkDone className="text-[#00ffff] w-4 h-4" />
                    <span className="text-xs text-[#00ffff]/70">Seen</span>
                  </div>
                ) : message.status === 'delivered' ? (
                  <div className="flex items-center gap-1">
                    <IoCheckmarkDone className="text-[#00ffff]/50 w-4 h-4" />
                    <span className="text-xs text-white/50">Delivered</span>
                  </div>
                ) : message.status === 'error' ? (
                  <div className="flex items-center bg-red-500/10 px-2 py-0.5 rounded-full">
                    <IoAlert className="text-red-500 w-4 h-4" />
                    <span className="text-red-400 text-xs mx-1">Failed</span>
                    <button 
                      onClick={() => retryMessage(message.id)}
                      className="flex items-center gap-1 ml-1 bg-[#00ffff]/10 hover:bg-[#00ffff]/20 text-[#00ffff]/70 hover:text-[#00ffff] transition-colors px-2 py-0.5 rounded-full"
                      title="Retry sending"
                    >
                      <IoRefresh className="w-3 h-3" />
                      <span className="text-xs">Retry</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <IoCheckmarkDone className="text-gray-400 w-4 h-4" />
                    <span className="text-xs text-white/50">Sent</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  // Handle typing indicator
  useEffect(() => {
    if (isAdminTyping) {
      // Clear typing indicator after 3 seconds of no updates
      typingTimeoutRef.current = setTimeout(() => {
        setIsAdminTyping(false);
      }, 3000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isAdminTyping]);

  // Handle sending typing indicator
  const handleTyping = () => {
    // Only send typing indicator if we have text and we're not already in typing state
    if (!isTyping && newMessage.trim().length > 0) {
      setIsTyping(true);
      
      // Send typing indicator via WebSocket
      if ((ws.current?.readyState === WebSocket.OPEN || isUsingMockWebSocket) && selectedAdmin) {
        try {
          ws.current?.send(JSON.stringify({
            type: "typing",
            sender: userId,
            sender_name: userName,
            recipient_id: parseInt(selectedAdmin),
            is_admin_recipient: true
          }));
        } catch (error) {
          console.error('Error sending typing indicator:', error);
        }
      }
    }
    
    // Reset typing timeout
    if (typingIndicatorTimeoutRef.current) {
      clearTimeout(typingIndicatorTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingIndicatorTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Clean up typing indicator timeout
  useEffect(() => {
    return () => {
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
    };
  }, []);

  // Handle scroll events to show/hide scroll button
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollToBottom(isScrolledUp);
      
      // If scrolled to bottom, reset new messages indicator
      if (!isScrolledUp) {
        setHasNewMessages(false);
      }
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => {
        chatContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Update message handling to set new messages flag
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      
      if (isScrolledUp) {
        setHasNewMessages(true);
      }
    }
  }, [messages.length]);

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
          <AnimatePresence>
            {showConnectionToast && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] bg-black/80 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-md"
              >
                {connectionStatus === 'connecting' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#00ffff]"></div>
                    <div>
                      <p className="font-medium">Connecting to chat server...</p>
                      <p className="text-xs text-white/70 mt-1">Please wait while we establish a connection.</p>
                    </div>
                  </>
                ) : connectionStatus === 'disconnected' ? (
                  <>
                    <IoAlert className="text-red-500 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Connection lost</p>
                      <p className="text-xs text-white/70 mt-1">We're trying to reconnect automatically. You can also try manually.</p>
                    </div>
                    <button 
                      onClick={() => {
                        initializeWebSocket();
                        setShowConnectionToast(false);
                      }}
                      className="ml-2 bg-[#00ffff]/20 hover:bg-[#00ffff]/30 text-[#00ffff] px-3 py-1.5 rounded text-sm flex items-center gap-1"
                    >
                      <IoRefresh className="w-4 h-4" />
                      <span>Retry Now</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-green-400 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Connected to chat server</p>
                      <p className="text-xs text-white/70 mt-1">Your messages will be delivered in real-time.</p>
                    </div>
                  </>
                )}
                <button 
                  onClick={() => setShowConnectionToast(false)}
                  className="ml-auto text-white/60 hover:text-white"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Drawer */}
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
            {/* Chat Header with new design */}
            <div className="p-4 sm:p-5 border-b border-[#00ffff]/10 flex items-center justify-between 
              bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#00ffff]/10 
                    shadow-lg shadow-[#00ffff]/5 backdrop-blur-sm">
                    <IoChatbubbleEllipses className="w-6 h-6 sm:w-7 sm:h-7 text-[#00ffff]" />
                  </div>
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isWebSocketConnected ? 'bg-green-400' : 'bg-red-400'} 
                    border-2 border-[#001a1a] ${isWebSocketConnected ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-medium text-white tracking-wide">
                    Support Chat {isUsingMockWebSocket && <span className="text-xs text-yellow-300">(Demo Mode)</span>}
                  </h3>
                  {/* Connection status */}
                  <div className="text-xs text-[#00ffff]/60">
                    {isWebSocketConnected 
                      ? isUsingMockWebSocket 
                        ? 'Using demo mode (server unavailable)' 
                        : 'Connected to chat server' 
                      : 'Connecting to chat server...'}
                  </div>
                  {/* Admin selection dropdown */}
                  {availableAdmins.length > 0 && (
                    <div className="mt-1">
                      <select 
                        value={selectedAdmin || ''}
                        onChange={(e) => handleAdminSelect(e.target.value)}
                        className="text-sm bg-[#003333] text-[#00ffff] border border-[#00ffff]/20 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#00ffff]/30"
                      >
                        <option value="" disabled>Select an admin</option>
                        {availableAdmins.map(admin => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#00ffff]/10 transition-colors"
              >
                <IoClose className="w-6 h-6 text-[#00ffff]" />
              </button>
            </div>

            {/* Messages */}
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
                    setHasNewMessages(false);
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
                  <p className="text-[#00ffff]/70 mt-3 text-sm">Loading messages...</p>
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
                        <ChatMessageItem
                          key={message.id}
                          message={message}
                          isPlayerMessage={isPlayerMessage}
                          isAdminMessage={isAdminMessage}
                          userName={userName}
                          selectedAdmin={selectedAdmin}
                          availableAdmins={availableAdmins}
                          formatTime={formatTime}
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

            {/* Chat Input - update the container styles */}
            <form onSubmit={handleSendMessage} className="p-4 sm:p-5 border-t border-[#00ffff]/10 
              bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm">
              {selectedAdmin ? (
                <>
                  {/* Show who the user is chatting with */}
                  <div className="mb-2 text-xs text-[#00ffff]/60 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-pulse"></div>
                    Chatting with: {availableAdmins.find(a => a.id === selectedAdmin)?.name || 'Admin'}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAttachmentClick}
                        className="p-2.5 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                          hover:bg-[#00ffff]/20 transition-all duration-300 active:scale-95"
                        aria-label="Attach file"
                      >
                        <IoAttach className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2.5 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                          hover:bg-[#00ffff]/20 transition-all duration-300 active:scale-95"
                        aria-label="Add emoji"
                      >
                        <IoHappy className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="relative flex-1">
                      {/* Emoji picker */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-full mb-2 z-10">
                          <Suspense fallback={<div>Loading...</div>}>
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                          </Suspense>
                        </div>
                      )}
                      
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewMessage(value);
                          // Only trigger typing indicator if there's actual content
                          if (value.trim().length > 0) {
                            handleTyping();
                          }
                        }}
                        placeholder="Type a message..."
                        className="w-full p-3 rounded-xl bg-black/30 border border-[#00ffff]/20 text-white 
                          placeholder-white/40 focus:outline-none focus:border-[#00ffff]/50 transition-all"
                        disabled={!isWebSocketConnected && !isUsingMockWebSocket}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!newMessage.trim() && !selectedFile && (!isWebSocketConnected && !isUsingMockWebSocket)}
                      className={`p-3 rounded-xl ${
                        newMessage.trim() || selectedFile
                          ? 'bg-[#00ffff]/20 text-[#00ffff] hover:bg-[#00ffff]/30 active:scale-95'
                          : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                      } transition-all duration-300 flex items-center justify-center`}
                      aria-label="Send message"
                    >
                      <IoSend className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* File upload preview */}
                  {selectedFile && (
                    <div className="mt-3 p-2 bg-black/20 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <IoDocument className="text-[#00ffff]" />
                        <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-white/60 hover:text-white/90 p-1"
                        aria-label="Remove file"
                      >
                        <IoClose className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </>
              ) : (
                <div className="text-center text-[#00ffff]/60 py-2">
                  <p>Select an admin to start chatting</p>
                </div>
              )}
            </form>

            {/* Add typing indicator above the input */}
            {isAdminTyping && selectedAdmin && (
              <div className="px-4 py-1 mb-2">
                <div className="flex items-center gap-2 text-xs text-[#00ffff]/70">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>{availableAdmins.find(a => a.id === selectedAdmin)?.name || 'Admin'} is typing...</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatDrawer; 