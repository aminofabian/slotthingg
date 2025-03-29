'use client';
import React, { useCallback } from 'react';
import { IoCheckmarkDone, IoAlert, IoRefresh, IoAttach } from 'react-icons/io5';
import { format } from 'date-fns';

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
}

export interface ChatMessageData {
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

interface ChatMessageProps {
  message: ChatMessageData;
  isPlayerMessage: boolean;
  isAdminMessage: boolean;
  userName: string;
  selectedAdmin: string | null;
  availableAdmins: {id: string, name: string}[];
  retryMessage: (messageId: number) => void;
  isConsecutive: boolean;
}

const formatMessageText = (text: string): string => {
  // First replace <br> tags with actual line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Extract any bold text while escaping other HTML
  text = text.replace(/<b>(.*?)<\/b>/gi, '*$1*');
  
  // Remove any remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  return text;
};

const ChatMessage = ({
  message,
  isPlayerMessage,
  isAdminMessage,
  userName,
  selectedAdmin,
  availableAdmins,
  retryMessage,
  isConsecutive
}: ChatMessageProps) => {
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

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
        
        {/* Message text with proper formatting */}
        {message.message && (
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
            {formatMessageText(message.message).split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line.split(/(\*[^*]+\*)/).map((part, j) => {
                  if (part.startsWith('*') && part.endsWith('*')) {
                    return <strong key={j}>{part.slice(1, -1)}</strong>;
                  }
                  return part;
                })}
              </React.Fragment>
            ))}
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
                  <span className="text-xs text-[#ff00ff]/70">Seen</span>
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
                    className="flex items-center gap-1 ml-1 bg-[#00ffff]/10 hover:bg-[#00ffff]/20 text-[#ff00ff]/70 hover:text-[#00ffff] transition-colors px-2 py-0.5 rounded-full"
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
};

export default ChatMessage; 