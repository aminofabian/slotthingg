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
    <div className="flex items-center justify-between p-4 border-b border-[#00ffff]/10 bg-black/30 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[#00ffff]/10 transition-colors -ml-2"
          aria-label="Close chat"
        >
          {isMobileView ? (
            <IoClose className="w-5 h-5 text-[#00ffff]" />
          ) : (
            <IoChevronBack className="w-5 h-5 text-[#00ffff]" />
          )}
        </button>
        <h2 className="text-lg font-semibold text-[#00ffff]">Live Support</h2>
        <div 
          className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} 
          title={isWebSocketConnected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <div className="flex items-center">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-[#00ffff]/10 transition-colors"
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