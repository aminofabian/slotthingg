'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IoSend, IoAttach, IoDocument, IoClose } from 'react-icons/io5';

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isWebSocketConnected: boolean;
  isUsingMockWebSocket: boolean;
  selectedAdmin: string | null;
  availableAdmins: { id: string; name: string }[];
  handleTyping: (message: string) => void;
  isMobileView?: boolean;
}

const ChatInput = ({
  newMessage,
  setNewMessage,
  selectedFile,
  setSelectedFile,
  handleSendMessage,
  isWebSocketConnected,
  isUsingMockWebSocket,
  selectedAdmin,
  availableAdmins,
  handleTyping,
  isMobileView = false
}: ChatInputProps) => {
  const [lastTypingTime, setLastTypingTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle typing indicator with throttling
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Only send typing indicator if there's content and we throttle requests
    // to avoid overwhelming the server with typing events
    const now = Date.now();
    if (value.trim().length > 0 && now - lastTypingTime > 3000) {
      handleTyping(value);
      setLastTypingTime(now);
    }
  }, [setNewMessage, handleTyping, lastTypingTime]);
  
  // Attach a file
  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, [setSelectedFile]);
  
  // Auto-resize textarea as user types
  useEffect(() => {
    const textarea = chatInputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [newMessage]);

  // Focus input on mount for better UX
  useEffect(() => {
    if (chatInputRef.current) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 500);
    }
  }, []);
  
  return (
    <form onSubmit={handleSendMessage} className={`${isMobileView ? 'pb-5 pt-4 px-4' : 'p-4 sm:p-5'} border-t border-[#00ffff]/10 
      bg-gradient-to-b from-black/40 to-black/30 backdrop-blur-md shadow-inner`}>
      {selectedAdmin ? (
        <>
          {/* Show who the user is chatting with */}
          <div className="mb-2 text-xs text-[#00ffff]/70 flex items-center gap-2 font-light tracking-wide">
            <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-pulse"></div>
            Chatting with: <span className="font-medium">{availableAdmins.find(a => a.id === selectedAdmin)?.name || 'Admin'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAttachmentClick}
              className="p-2.5 rounded-xl bg-[#00ffff]/10 text-[#00ffff] hover:bg-[#00ffff]/15 
                transition-all duration-200 active:scale-95 border border-[#00ffff]/5"
              aria-label="Attach file"
            >
              <IoAttach className="w-5 h-5" />
            </button>
            
            <div className="relative flex-1">
              <textarea
                ref={chatInputRef}
                value={newMessage}
                onChange={handleChange}
                placeholder="Type a message..."
                className="w-full p-3 rounded-xl bg-black/30 border border-[#00ffff]/15 text-white 
                  placeholder-white/50 focus:outline-none focus:border-[#00ffff]/40 focus:ring-1 focus:ring-[#00ffff]/10
                  transition-all font-light tracking-wide shadow-inner"
                rows={1}
                style={{ height: 'auto' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim() || selectedFile) {
                      handleSendMessage(e);
                    }
                  }
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedFile) || !isWebSocketConnected}
              className={`p-3 rounded-xl ${
                (!newMessage.trim() && !selectedFile) || !isWebSocketConnected
                  ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  : 'bg-[#00ffff]/70 text-black hover:bg-[#00ffff] active:bg-[#00ffff]/90'
              } transition-all duration-200 flex items-center justify-center`}
              aria-label="Send message"
            >
              <IoSend className="w-5 h-5" />
            </button>
          </div>
          
          {/* File upload preview */}
          {selectedFile && (
            <div className="mt-3 p-2.5 bg-black/30 rounded-lg flex items-center justify-between border border-[#00ffff]/10">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <IoDocument className="text-[#00ffff]" />
                <span className="truncate max-w-[200px] font-light">{selectedFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-white/60 hover:text-white/90 p-1.5 rounded-full hover:bg-black/20 transition-colors"
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
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </>
      ) : (
        <div className="text-center text-[#00ffff]/60 py-2 font-light tracking-wide">
          <p>Select an admin to start chatting</p>
        </div>
      )}
      
      {/* Optional: Connection status indicator */}
      {!isWebSocketConnected && (
        <div className="mt-2 text-xs text-red-400 text-center">
          {isUsingMockWebSocket 
            ? 'Using offline mode. Messages will not be sent to the server.'
            : 'Disconnected. Reconnecting...'}
        </div>
      )}
    </form>
  );
};

export default ChatInput; 