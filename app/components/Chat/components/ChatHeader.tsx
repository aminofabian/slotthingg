import { IoClose } from 'react-icons/io5';
import { ChatHeaderProps } from '../components';

const ChatHeader = ({
  isWebSocketConnected,
  isUsingMockWebSocket,
  onClose
}: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#00ffff]/10">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-[#00ffff]">Support Chat</h2>
        <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-[#00ffff]/10 transition-colors"
      >
        <IoClose className="w-6 h-6 text-[#00ffff]" />
      </button>
    </div>
  );
};

export default ChatHeader; 