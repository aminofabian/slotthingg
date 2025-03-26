import { useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSendMessage} className={`p-3 ${isMobileView ? 'pb-5 pt-4' : 'p-4 sm:p-5'} border-t border-[#00ffff]/10 
      bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm`}>
      {selectedAdmin ? (
        <>
          {/* Show who the user is chatting with */}
          <div className="mb-2 text-xs text-[#00ffff]/60 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-pulse"></div>
            Chatting with: {availableAdmins.find(a => a.id === selectedAdmin)?.name || 'Admin'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAttachmentClick}
              className="p-2.5 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                hover:bg-[#00ffff]/20 transition-all duration-300 active:scale-95"
              aria-label="Attach file"
            >
              <IoAttach className="w-5 h-5" />
            </button>
            
            <div className="relative flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewMessage(value);
                  // Only trigger typing indicator if there's actual content
                  if (value.trim().length > 0) {
                    handleTyping(value);
                  }
                }}
                placeholder="Type a message..."
                className="w-full p-3 rounded-xl bg-black/30 border border-[#00ffff]/20 text-white 
                  placeholder-white/40 focus:outline-none focus:border-[#00ffff]/50 transition-all"
                disabled={!isWebSocketConnected && !isUsingMockWebSocket}
              />
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim() && !selectedFile && (!isWebSocketConnected && !isUsingMockWebSocket)}
              className={`p-3 rounded-xl ${
                newMessage.trim() || selectedFile
                  ? 'bg-[#00ffff]/20 text-[#00ffff] hover:bg-[#00ffff]/30 active:scale-95'
                  : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
              } transition-all duration-300 flex items-center justify-center`}
              aria-label="Send message"
            >
              <IoSend className="w-5 h-5" />
            </button>
          </div>
          
          {/* File upload preview */}
          {selectedFile && (
            <div className="mt-3 p-2 bg-black/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <IoDocument className="text-[#00ffff]" />
                <span className="truncate max-w-[200px]">{selectedFile.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-white/60 hover:text-white/90 p-1"
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
          />
        </>
      ) : (
        <div className="text-center text-[#00ffff]/60 py-2">
          <p>Select an admin to start chatting</p>
        </div>
      )}
    </form>
  );
};

export default ChatInput; 