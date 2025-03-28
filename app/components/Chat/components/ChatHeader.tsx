'use client';
import React from 'react';
import { IoClose, IoRefresh, IoChevronBack } from 'react-icons/io5';

// Define the interface for header props
export interface ChatHeaderProps {
  isWebSocketConnected: boolean;
  isUsingMockWebSocket: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  isMobileView?: boolean;
}

const ChatHeader = ({
  isWebSocketConnected,
  isUsingMockWebSocket,
  onClose,
  onRefresh,
  isMobileView = false
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#00ffff]/10 bg-gradient-to-r from-black/50 to-black/40 backdrop-blur-md shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[#00ffff]/10 transition-colors -ml-2 active:scale-95"
          aria-label="Close chat"
        >
          {isMobileView ? (
            <IoClose className="w-5 h-5 text-[#00ffff]" />
          ) : (
            <IoChevronBack className="w-5 h-5 text-[#00ffff]" />
          )}
        </button>
        <h2 className="text-lg font-medium tracking-wide text-[#00ffff]">Live Support</h2>
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} 
            title={isWebSocketConnected ? 'Connected' : 'Disconnected'}
          />
          <span className="text-xs text-white/70 font-light">
            {isWebSocketConnected ? 'Online' : 'Connecting...'}
          </span>
        </div>
      </div>
      <div className="flex items-center">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-[#00ffff]/10 transition-colors active:scale-95"
            title="Refresh messages"
          >
            <IoRefresh className="w-5 h-5 text-[#00ffff]" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader; 