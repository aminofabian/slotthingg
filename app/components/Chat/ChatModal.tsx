'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSend, IoChatbubbleEllipses } from 'react-icons/io5';
import { format } from 'date-fns';

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
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // TODO: Implement WebSocket message sending
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 md:p-6 lg:p-8"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-[#001a1a] to-[#002f2f] w-full max-h-[90vh] md:max-h-[80vh] rounded-2xl 
              shadow-2xl shadow-[#00ffff]/5 border border-[#00ffff]/10 
              overflow-hidden flex flex-col relative
              sm:max-w-lg md:max-w-2xl lg:max-w-4xl"
          >
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-[#00ffff]/10 flex items-center justify-between 
              bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#00ffff]/10 
                  shadow-lg shadow-[#00ffff]/5 backdrop-blur-sm">
                  <IoChatbubbleEllipses className="w-5 h-5 sm:w-6 sm:h-6 text-[#00ffff] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-white tracking-wide">Support Chat</h3>
                  <p className="text-xs sm:text-sm text-[#00ffff]/70 font-light">We're here to help</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white 
                  transition-all duration-300 hover:rotate-90 active:scale-95"
              >
                <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 
                bg-gradient-to-b from-black/20 via-transparent to-transparent
                scrollbar-thin scrollbar-thumb-[#00ffff]/10 scrollbar-track-transparent"
              style={{ maxHeight: 'calc(90vh - 140px)' }}
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
                        <div className={`text-[0.65rem] ${
                          msg.is_player_sender ? 'text-white/40' : 'text-white/60'
                        }`}>
                          {formatTime(msg.sent_time)}
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

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-[#00ffff]/10 
              bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/5 border border-[#00ffff]/20 rounded-xl px-3 py-2 sm:px-4 sm:py-3
                    text-sm sm:text-base text-white placeholder-white/30
                    focus:border-[#00ffff]/40 focus:ring-2 focus:ring-[#00ffff]/20
                    transition-all duration-300 hover:border-[#00ffff]/30
                    shadow-lg shadow-[#00ffff]/5"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 sm:p-3 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                    hover:bg-[#00ffff]/20 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300 active:scale-95 hover:shadow-lg hover:shadow-[#00ffff]/10
                    disabled:hover:shadow-none"
                >
                  <IoSend className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal; 