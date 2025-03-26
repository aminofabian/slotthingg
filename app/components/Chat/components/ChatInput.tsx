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
                className="w-full p-3 rounded-xl bg-black/30 border border-[#00ffff]/15 text-white 
                  placeholder-white/50 focus:outline-none focus:border-[#00ffff]/40 focus:ring-1 focus:ring-[#00ffff]/10
                  transition-all font-light tracking-wide shadow-inner"
                disabled={!isWebSocketConnected && !isUsingMockWebSocket}
              />
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim() && !selectedFile && (!isWebSocketConnected && !isUsingMockWebSocket)}
              className={`p-3 rounded-xl ${
                newMessage.trim() || selectedFile
                  ? 'bg-gradient-to-br from-[#00ffff]/25 to-[#00ffff]/15 text-[#00ffff] hover:from-[#00ffff]/30 hover:to-[#00ffff]/20 active:scale-95 border border-[#00ffff]/10 shadow-md'
                  : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
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
          />
        </>
      ) : (
        <div className="text-center text-[#00ffff]/60 py-2 font-light tracking-wide">
          <p>Select an admin to start chatting</p>
        </div>
      )}
    </form>
  );
};

export default ChatInput; 