// Types
export interface ChatHeaderProps {
  isWebSocketConnected: boolean;
  isUsingMockWebSocket: boolean;
  onClose: () => void;
}

export interface ChatMessagesProps {
  messages: ChatMessageData[];
  isLoading: boolean;
  selectedAdmin: string;
  userName: string;
  retryMessage: (messageId: number) => void;
  showScrollToBottom: boolean;
  hasNewMessages: boolean;
  scrollToBottom: () => void;
  setNewMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

export interface ChatInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isWebSocketConnected: boolean;
  isUsingMockWebSocket: boolean;
  selectedAdmin: string;
  handleTyping: () => void;
}

export interface TypingIndicatorProps {
  isAdminTyping: boolean;
  selectedAdmin: string;
}

export interface ConnectionStatusProps {
  showConnectionToast: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  onClose: () => void;
  onRetry: () => void;
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
  attachments?: {
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
    size: number;
  }[];
  recipient_id?: number;
  is_admin_recipient?: boolean;
}

// Component exports
export { default as ChatHeader } from './components/ChatHeader';
export { default as ChatInput } from './components/ChatInput';
export { default as ChatMessages } from './components/ChatMessages';
export { default as ConnectionStatus } from './components/ConnectionStatus';
export { default as TypingIndicator } from './components/TypingIndicator'; 