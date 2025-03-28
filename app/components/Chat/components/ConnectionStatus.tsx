'use client';
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { IoClose, IoAlert, IoRefresh } from 'react-icons/io5';
import { MotionDiv } from '@/app/types/motion';

interface ConnectionStatusProps {
  showConnectionToast: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  onClose: () => void;
  onRetry: () => void;
}

const ConnectionStatus = ({
  showConnectionToast,
  connectionStatus,
  onClose,
  onRetry,
}: ConnectionStatusProps) => {
  if (!showConnectionToast) return null;

  return (
    <MotionDiv 
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
            onClick={onRetry}
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
        onClick={onClose}
        className="ml-auto text-white/60 hover:text-white"
      >
        <IoClose className="w-5 h-5" />
      </button>
    </MotionDiv>
  );
};

export default ConnectionStatus; 