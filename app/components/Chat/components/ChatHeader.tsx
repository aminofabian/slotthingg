'use client';
import React, { useState } from 'react';
import { IoClose, IoRefresh, IoChevronBack, IoGridOutline } from 'react-icons/io5';

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
  const [isHovering, setIsHovering] = useState(false);
  
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
        <a 
          href="/dashboard" 
          className="group relative ml-2 px-3 py-1 rounded-md overflow-hidden bg-black/30 hover:bg-black/50 border border-[#00ffff]/20 transition-all duration-200"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex items-center space-x-2">
            <IoGridOutline className="w-4 h-4 text-[#00ffff]/90" />
            <span className="text-xs font-medium text-white/90">Dashboard</span>
          </div>
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ffff]/50 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></span>
        </a>
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