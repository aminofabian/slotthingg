import { TypingIndicatorProps } from '../components';

const TypingIndicator = ({
  isAdminTyping,
  selectedAdmin
}: TypingIndicatorProps) => {
  if (!isAdminTyping) return null;

  return (
    <div className="px-4 py-2 bg-gradient-to-r from-[#ff00ff]/5 to-transparent">
      <div className="flex items-center space-x-2 text-xs text-[#ff00ff]/80 font-light tracking-wide">
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff00ff]/60 animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff00ff]/60 animate-pulse" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff00ff]/60 animate-pulse" style={{ animationDelay: '600ms', animationDuration: '1s' }} />
        </div>
        <span>Support is typing<span className="opacity-80">...</span></span>
      </div>
    </div>
  );
};

export default TypingIndicator; 