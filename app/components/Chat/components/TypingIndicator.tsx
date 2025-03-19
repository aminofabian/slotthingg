import { TypingIndicatorProps } from '../components';

const TypingIndicator = ({
  isAdminTyping,
  selectedAdmin
}: TypingIndicatorProps) => {
  if (!isAdminTyping) return null;

  return (
    <div className="px-4 py-2">
      <div className="flex items-center space-x-2 text-sm text-[#00ffff]/60">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-[#00ffff]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#00ffff]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#00ffff]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>Support is typing...</span>
      </div>
    </div>
  );
};

export default TypingIndicator; 