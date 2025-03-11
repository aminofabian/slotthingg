'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend, IoChatbubbleEllipses, IoAttach, IoHappy, IoCheckmarkDone } from 'react-icons/io5';
import { format } from 'date-fns';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface ChatMessage {
  id: number;
  type: 'message' | 'join';
  message: string;
  sender: number;
  sent_time: string;
  is_file: boolean;
  file: string | null;
  is_player_sender: boolean;
  is_tip: boolean;
  is_comment: boolean;
  status: 'sent' | 'delivered' | 'seen';
  attachments?: Attachment[];
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ws = useRef<WebSocket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
      initializeWebSocket();
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
  }, [isOpen, playerId]);

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
    }
  }, []);

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
      const response = await fetch(`/api/chat/history?whitelabel_admin_uuid=${whitelabel_admin_uuid}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();
      setMessages(data.results);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWebSocket = () => {
    // Use the state variable for player ID
    ws.current = new WebSocket(`wss://serverhub.biz/ws/cschat/P9Chat/?player_id=${playerId}`);

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.current.onmessage = (event) => {
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
        // Handle incoming messages
        const newMsg: ChatMessage = {
          id: Date.now(),
          type: 'message',
          message: data.message || '',
          sender: parseInt(data.sender_id),
          sent_time: data.sent_time || new Date().toISOString(),
          is_file: data.is_file || false,
          file: data.file || null,
          is_player_sender: data.is_player_sender || false,
          is_tip: data.is_tip || false,
          is_comment: data.is_comment || false,
          status: 'delivered',
          attachments: data.attachments || []
        };
        
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (isOpen) initializeWebSocket();
      }, 3000);
    };
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
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/chat/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      let isFile = false;
      let fileUrl = null;
      let attachments: Attachment[] = [];
      
      // Use the state variable for user ID
      
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
        isFile = true;
        attachments.push({
          id: Date.now().toString(),
          type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
          url: fileUrl,
          name: selectedFile.name,
          size: selectedFile.size
        });
      }

      // Create a message object for the local state
      const localMessage: ChatMessage = {
        id: Date.now(),
        type: 'message',
        message: newMessage.trim(),
        sender: parseInt(userId), // Use the state variable
        sent_time: new Date().toISOString(),
        is_file: isFile,
        file: fileUrl,
        is_player_sender: true,
        is_tip: false,
        is_comment: false,
        status: 'sent',
        attachments
      };

      // Add the message to the local state
      setMessages(prev => [...prev, localMessage]);
      setNewMessage('');
      setSelectedFile(null);
      scrollToBottom();

      // Send the message via WebSocket in the expected format
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: "message",
          message: newMessage.trim(),
          sender_id: userId, // Use the state variable
          is_player_sender: true,
          is_file: isFile,
          file: fileUrl
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
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
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 
                    border-2 border-[#001a1a] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-medium text-white tracking-wide">Support Chat</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <p className="text-sm text-[#00ffff]/70 font-light">Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-white/60 hover:text-white 
                  transition-all duration-300 hover:rotate-90 active:scale-95"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Messages - update the container styles */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 
                bg-gradient-to-b from-black/20 via-transparent to-transparent
                scrollbar-thin scrollbar-thumb-[#00ffff]/10 scrollbar-track-transparent"
              style={{ maxHeight: 'calc(100vh - 160px)' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-[#00ffff] animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00ffff]/50 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#00ffff]/50 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#00ffff]/50 animate-bounce"></div>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    key={msg.id}
                    className={`flex ${msg.is_player_sender ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'message' ? (
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] ${
                          msg.is_player_sender
                            ? 'bg-[#00ffff]/10 text-white shadow-lg shadow-[#00ffff]/5'
                            : 'bg-[#00ffff]/20 text-white shadow-lg shadow-[#00ffff]/10'
                        } rounded-2xl px-3 py-2 sm:px-4 sm:py-2 space-y-1 backdrop-blur-sm
                        transition-all duration-300 hover:scale-[1.02]`}
                      >
                        <div 
                          className="text-sm sm:text-base break-words leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: msg.message }} 
                        />
                        {msg.attachments?.map((attachment) => (
                          <div key={attachment.id} className="mt-2">
                            {attachment.type === 'image' ? (
                              <img 
                                src={attachment.url} 
                                alt={attachment.name}
                                className="max-w-full rounded-lg shadow-lg"
                              />
                            ) : (
                              <a 
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[#00ffff] hover:underline"
                              >
                                <IoAttach className="w-4 h-4" />
                                <span>{attachment.name}</span>
                              </a>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center justify-between text-[0.65rem] text-white/40">
                          <span>{formatTime(msg.sent_time)}</span>
                          {msg.is_player_sender && (
                            <div className="flex items-center">
                              {msg.status === 'seen' && (
                                <IoCheckmarkDone className="w-4 h-4 text-[#00ffff]" />
                              )}
                              {msg.status === 'delivered' && (
                                <IoCheckmarkDone className="w-4 h-4" />
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
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input - update the container styles */}
            <form onSubmit={handleSendMessage} className="p-4 sm:p-5 border-t border-[#00ffff]/10 
              bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm">
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
                    placeholder="Type your message..."
                    className="w-full bg-white/5 border border-[#00ffff]/20 rounded-xl px-4 py-3
                      text-base text-white placeholder-white/30
                      focus:border-[#00ffff]/40 focus:ring-2 focus:ring-[#00ffff]/20
                      transition-all duration-300 hover:border-[#00ffff]/30
                      shadow-lg shadow-[#00ffff]/5"
                  />
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !selectedFile}
                  className="p-2.5 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                    hover:bg-[#00ffff]/20 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300 active:scale-95 hover:shadow-lg hover:shadow-[#00ffff]/10
                    disabled:hover:shadow-none"
                >
                  <IoSend className="w-5 h-5" />
                </button>
              </div>
              {selectedFile && (
                <div className="mt-3 p-2 rounded-lg bg-white/5 flex items-center gap-2 text-sm text-white/70">
                  <IoAttach className="w-4 h-4" />
                  <span className="flex-1 truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 rounded-md hover:bg-white/5 text-red-400 hover:text-red-300
                      transition-all duration-300"
                  >
                    <IoClose className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatDrawer; 