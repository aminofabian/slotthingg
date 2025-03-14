'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend, IoChatbubbleEllipses, IoAttach, IoHappy, IoCheckmarkDone, IoAlert, IoRefresh } from 'react-icons/io5';
import { format } from 'date-fns';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

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
  const maxReconnectAttempts = 3;
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [showConnectionToast, setShowConnectionToast] = useState<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      loadUserInfo(); // Load user info when the chat is opened
      fetchChatHistory();
      initializeWebSocket();
      fetchAvailableAdmins(); // Fetch available admins
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
      // Clean up WebSocket connection
      if (ws.current) {
        ws.current.close();
      }
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

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.current && ws.current.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timeout. Falling back to mock WebSocket.');
          ws.current.close();
          initializeMockWebSocket();
        }
      }, 5000); // 5 second timeout

      ws.current.onopen = () => {
        console.log('WebSocket connection established');
        clearTimeout(connectionTimeout);
        setIsWebSocketConnected(true);
        setIsUsingMockWebSocket(false);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        
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
            
            // Skip if this is a duplicate message
            if (isDuplicateMessage(messageId, messageText, messageTimestamp)) {
              console.log('Skipping duplicate message:', messageText);
              
              // Even if it's a duplicate, update the status if it's one of our sent messages
              if (data.is_player_sender) {
                setMessages(prev => 
                  prev.map(msg => 
                    (msg.id === messageId || (msg.message === messageText && msg.is_player_sender)) 
                      ? { ...msg, status: 'delivered' } 
                      : msg
                  )
                );
              }
              return;
            }
            
            // Handle incoming messages
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
            const isRelevantMessage = 
              // If no admin is selected, show all messages
              !selectedAdmin || 
              // If message is from the selected admin
              (newMsg.sender === parseInt(selectedAdmin)) ||
              // If message is to the selected admin
              (newMsg.is_admin_recipient && newMsg.recipient_id === parseInt(selectedAdmin));
            
            if (isRelevantMessage) {
              // If it's a player message that we sent, just update the status
              if (newMsg.is_player_sender) {
                // Check if we already have this message in our state
                const existingMessage = messages.find(msg => 
                  msg.id === newMsg.id || 
                  (msg.message === newMsg.message && msg.is_player_sender && 
                   Math.abs(new Date(msg.sent_time).getTime() - new Date(newMsg.sent_time).getTime()) < 5000)
                );
                
                if (existingMessage) {
                  // Just update the status
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === existingMessage.id
                        ? { ...msg, status: 'delivered' } 
                        : msg
                    )
                  );
                } else {
                  // Track this message to prevent duplicates
                  trackSentMessage(messageId, messageText, messageTimestamp);
                  
                  // Add as new message
                  setMessages(prev => [...prev, newMsg]);
                  scrollToBottom();
                }
              } else {
                // If it's a message from someone else, add it as new
                // Track this message to prevent duplicates
                trackSentMessage(messageId, messageText, messageTimestamp);
                
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
        
        // Show connection toast
        setShowConnectionToast(true);
        
        // Only attempt to reconnect if not using mock WebSocket and not exceeding max attempts
        if (!isUsingMockWebSocket && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          setTimeout(() => {
            if (isOpen) initializeWebSocket();
          }, 3000);
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
    
    // Create a mock WebSocket object
    const mockWs = {
      readyState: WebSocket.OPEN,
      send: (data: string) => {
        console.log('Mock WebSocket sending:', data);
        
        // Simulate server response
        setTimeout(() => {
          try {
            const parsedData = JSON.parse(data);
            
            if (parsedData.type === 'message') {
              // Echo the message back as if it came from the server
              const messageResponse = {
                ...parsedData,
                status: 'delivered'
              };
              
              // Skip if this is a duplicate message
              if (!isDuplicateMessage(
                messageResponse.id, 
                messageResponse.message, 
                messageResponse.sent_time
              )) {
                // Only update the status of the message, don't add a new one
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === messageResponse.id 
                      ? { ...msg, status: 'delivered' } 
                      : msg
                  )
                );
                
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
            }
          } catch (error) {
            console.error('Error processing mock message:', error);
          }
        }, 500);
      },
      close: () => {
        console.log('Mock WebSocket closed');
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

      // Track this message to prevent duplicates
      trackSentMessage(messageId, messageText, messageTimestamp);

      // Add the message to the local state
      setMessages(prev => [...prev, localMessage]);
    setNewMessage('');
      setSelectedFile(null);
      scrollToBottom();

      // Send the message via WebSocket in the expected format
      if (ws.current?.readyState === WebSocket.OPEN || isUsingMockWebSocket) {
        try {
          ws.current?.send(JSON.stringify({
            type: "message",
            id: messageId, // Include the message ID to help with deduplication
            message: messageText,
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
    // This handles cases where the message ID might be different but content is the same
    return messages.some(msg => 
      // Check for exact ID match
      msg.id === messageId ||
      // Or check for similar content and timestamp (within 5 seconds)
      (msg.message === messageText && 
       Math.abs(new Date(msg.sent_time).getTime() - new Date(timestamp).getTime()) < 5000)
    );
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
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#00ffff]/10 scrollbar-track-transparent"
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ffff]"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="p-3 rounded-full bg-[#00ffff]/10 mb-4">
                    <IoChatbubbleEllipses className="w-8 h-8 text-[#00ffff]" />
                  </div>
                  <p className="text-[#00ffff]/80 text-lg font-medium mb-2">No messages yet</p>
                  <p className="text-[#00ffff]/50 text-sm">
                    {selectedAdmin 
                      ? `Start a conversation with ${availableAdmins.find(a => a.id === selectedAdmin)?.name || 'the admin'}`
                      : 'Select an admin to start chatting'}
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    // Determine if this message is part of the current admin conversation
                    const isRelevantMessage = !selectedAdmin || 
                      !message.is_admin_recipient || 
                      (message.recipient_id === parseInt(selectedAdmin)) ||
                      (message.sender === parseInt(selectedAdmin));
                    
                    if (!isRelevantMessage) return null;
                    
                    const isPlayerMessage = message.is_player_sender;
                    const isAdminMessage = !isPlayerMessage && message.sender === parseInt(selectedAdmin || '0');
                    
                    return (
                      <div key={message.id} className={`flex ${isPlayerMessage ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`max-w-[80%] rounded-2xl p-3 ${
                            isPlayerMessage 
                              ? 'bg-[#00ffff]/10 text-white rounded-tr-none' 
                              : isAdminMessage
                                ? 'bg-[#ff00ff]/10 text-white rounded-tl-none'
                                : 'bg-gray-700/50 text-white rounded-tl-none'
                          }`}
                        >
                          {/* Sender name */}
                          <div className="text-xs font-medium mb-1 text-white/70">
                            {isPlayerMessage 
                              ? (message.sender_name || userName || 'You') 
                              : (message.sender_name || availableAdmins.find(a => a.id === selectedAdmin)?.name || 'Admin')}
                          </div>
                          
                          {/* Message content */}
                          {message.is_file && message.file ? (
                            message.file.match(/\.(jpeg|jpg|gif|png)$/) ? (
                              <img 
                                src={message.file} 
                                alt="Attachment" 
                                className="rounded-lg max-h-60 mb-2"
                              />
                            ) : (
                              <div className="bg-black/20 p-3 rounded-lg mb-2 flex items-center gap-2">
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
                            <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                              {message.message}
                            </p>
                          )}
                          
                          {/* Message footer */}
                          <div className="mt-1 flex justify-between items-center">
                            <span className="text-xs text-[#00ffff]/50">
                              {formatTime(message.sent_time)}
                            </span>
                            {isPlayerMessage && (
                              <div className="flex items-center gap-1">
                                {message.status === 'seen' ? (
                                  <IoCheckmarkDone className="text-[#00ffff] w-4 h-4" />
                                ) : message.status === 'delivered' ? (
                                  <IoCheckmarkDone className="text-[#00ffff]/50 w-4 h-4" />
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
                                  <IoCheckmarkDone className="text-gray-400 w-4 h-4" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  <div className="mb-2 text-xs text-[#00ffff]/60">
                    Chatting with: {availableAdmins.find(a => a.id === selectedAdmin)?.name || 'Admin'}
                  </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAttachmentClick}
                    className="p-2.5 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                      hover:bg-[#00ffff]/20 transition-all duration-300 active:scale-95"
                  >
                    <IoAttach className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2.5 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                      hover:bg-[#00ffff]/20 transition-all duration-300 active:scale-95"
                  >
                    <IoHappy className="w-5 h-5" />
                  </button>
                </div>
                    
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full p-2.5 pl-4 pr-12 rounded-xl bg-[#00ffff]/5 border border-[#00ffff]/10 
                          text-white placeholder-[#00ffff]/30 focus:outline-none focus:ring-1 focus:ring-[#00ffff]/30
                          transition-all duration-300"
                      />
              {selectedFile && (
                        <div className="absolute -top-10 left-0 right-0 bg-[#003333] p-2 rounded-t-xl 
                          flex items-center justify-between text-sm text-white">
                          <span className="truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                            className="text-[#00ffff] hover:text-white"
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                </div>
              )}
                      <button
                        type="submit"
                        disabled={!newMessage.trim() && !selectedFile}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg 
                          bg-[#00ffff]/20 text-[#00ffff] hover:bg-[#00ffff]/30 
                          transition-all duration-300 active:scale-95
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <IoSend className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
                  />
                  
                  {/* Emoji picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-[#00ffff]/60">
                  Please select an admin to start chatting
                </div>
              )}
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatDrawer; 