# Chat Component System

This directory contains a complete chat system with WebSocket support. The system has been refactored into smaller, more maintainable components.

## Components

### Main Components
- `ChatDrawer.tsx` - Original drawer component (1200+ lines)
- `ChatDrawerRefactored.tsx` - The new refactored drawer component using smaller components
- `ChatModal.tsx` - Original modal component (1190+ lines)
- `ChatModalRefactored.tsx` - The new refactored modal component using smaller components
- `ChatWidget.tsx` - Floating widget with contact options

### UI Components
- `ChatHeader.tsx` - Header of the chat with connection status and controls
- `ChatInput.tsx` - Input area with message input and file attachment
- `ChatMessage.tsx` - Individual message component
- `MessagesList.tsx` - Container for all messages with virtualization
- `TypingIndicator.tsx` - Shows when someone is typing
- `ChatMessagesContainer.tsx` - Container for messages with scroll handling and infinite scrolling

### Utility Components
- `WebSocketManager.tsx` - Manages WebSocket connection (non-visual)
- `ConnectionStatus.tsx` - Shows connection status

## Features

- Real-time messaging via WebSockets
- File uploads and image previews
- Typing indicators
- Message history
- Message status indicators (sent, delivered, error)
- Support for admin and player messages
- Infinite scrolling - automatically loads older messages when scrolling to top
- Responsive design for both mobile and desktop

## Hooks
- `useMessages.ts` - Handles message state, fetching, and pagination of message history
- `useScroll.ts` - Manages scrolling behavior
- `useTyping.ts` - Handles typing indicators
- `useUserInfo.ts` - Manages user information

## Import Summary

Here's a summary of the import statements for all components:

```jsx
// Main Components
import ChatDrawer from '@/app/components/Chat/ChatDrawerRefactored';
import ChatModal from '@/app/components/Chat/ChatModalRefactored';
import ChatWidget from '@/app/components/Chat/ChatWidget';

// UI Components (usually imported from ./components)
import { 
  ChatHeader, 
  ChatInput, 
  ChatMessage,
  MessagesList,
  TypingIndicator,
  ChatMessagesContainer 
} from './components';

// Utility Components
import WebSocketManager from './components/WebSocketManager';
import ConnectionStatus from './components/ConnectionStatus';

// Hooks
import { useMessages } from './hooks/useMessages';
import { useTyping } from './hooks/useTyping';
import { useScroll } from './hooks/useScroll';
import { useUserInfo } from './hooks/useUserInfo';
```

## How to Use

Use the refactored versions by importing:

```jsx
// For the drawer style chat
import ChatDrawer from '@/app/components/Chat/ChatDrawerRefactored';

// For the modal style chat
import ChatModal from '@/app/components/Chat/ChatModalRefactored';

// Then use in your component:
function YourComponent() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsChatOpen(true)}>Open Chat</button>
      <ChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
      />
      {/* OR */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
```

## Migration Plan

1. Start using `ChatDrawerRefactored.tsx` and `ChatModalRefactored.tsx` in new code
2. Test thoroughly in all environments
3. Once verified, replace the original components with the refactored versions
4. Update imports in other files if necessary

## Benefits of Refactoring

- Improved code organization and readability
- Better separation of concerns
- Easier maintenance and debugging
- More reusable components
- Reduced file sizes
- Improved performance through more targeted re-renders 