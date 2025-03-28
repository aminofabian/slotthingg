# Chat Component for Operators

This Chat component provides a real-time messaging interface for operators to communicate with players. It offers various features and configurations to adapt to different use cases.

## Features

- WebSocket-based real-time communication
- Message history loading
- File attachments
- Typing indicators
- Offline mode with local storage for messages when WebSocket connection fails
- Automatic reconnection with exponential backoff
- Graceful error handling with user feedback

## Components

- **ChatDrawer.tsx**: Chat interface that slides in from the side of the screen
- **ChatModal.tsx**: Chat interface in a modal window
- **ChatWidget.tsx**: Minimized chat button that expands to reveal the chat interface
- **ChatHeader.tsx**: The header component for the chat, displays user info and connection status
- **ChatInput.tsx**: Input area for composing and sending messages
- **WebSocketManager.tsx**: Manages WebSocket connections with error handling and offline mode

## Error Handling

The chat system is designed to handle connection issues gracefully:

1. **WebSocket Connection Failures**: Automatically attempts reconnection with exponential backoff.
2. **Gateway Errors (502)**: Specifically detects and handles 502 Gateway errors.
3. **Authentication Errors (403)**: Detects authentication failures and provides clear guidance to users.
4. **Offline Mode**: Switches to a mock WebSocket implementation when connection fails repeatedly.
5. **Error Notifications**: Displays user-friendly error messages to indicate connection status.
6. **Manual Reconnection**: Allows users to manually trigger reconnection after multiple failed attempts.
7. **API Fallback**: Server-side diagnostics via API endpoints to avoid CORS issues.

## Handling 502 Gateway Errors

The system has specific handling for 502 Gateway errors that may occur during WebSocket connections:

1. **Detection**: Both client and server-side code can detect 502 errors during connection attempts.
2. **Secondary Checks**: The app performs multiple checks using different endpoints to verify if the issue is persistent.
3. **Alternate Routes**: The client tries connecting through different paths to bypass problematic routes.
4. **Detailed Error Messages**: The server provides diagnostic information to help troubleshoot issues.
5. **Offline Fallback**: When 502 errors persist, the system automatically switches to offline mode.

## Handling 403 Authentication Errors

The system specifically handles authentication failures (403 Forbidden) in a user-friendly way:

1. **Early Detection**: The app checks for authentication issues before attempting WebSocket connections.
2. **Immediate Feedback**: Users receive clear error messages explaining the authentication problem.
3. **Session Refresh Button**: A dedicated button allows users to refresh their session/authentication.
4. **Diagnostic Information**: Detailed information about the authentication state is provided for debugging.
5. **Rapid Fallback**: The system immediately switches to offline mode rather than attempting multiple reconnections, as authentication issues won't resolve without user action.

## Hooks

- **useMessages.ts**: Manages message state and operations
- **useScroll.ts**: Handles automatic scrolling behavior
- **useTyping.ts**: Manages typing indicator functionality
- **useUserInfo.ts**: Retrieves and manages user information

## Testing

Test scripts are included to verify the error handling:

```js
// Test 502 Gateway error handling
window.runGatewayErrorTest();

// Test 403 Authentication error handling
window.runAuthErrorTest();
```

The tests check:
1. Server availability via API endpoint
2. Direct WebSocket connection attempts 
3. Authentication state verification
4. Message storage functionality during offline mode

## Usage

```jsx
import { ChatDrawer } from "@/app/components/Chat/ChatDrawer";

// Example usage
<ChatDrawer
  isOpen={isOpen}
  onClose={handleClose}
  playerId="player_123"
  userName="John Doe"
/>
```

## Configuration

The chat component can be configured through props:

- `isOpen`: Controls the visibility of the chat interface
- `onClose`: Function called when the chat is closed
- `playerId`: Unique identifier for the player
- `userName`: Display name for the player
- `userId`: Optional unique identifier for the user (defaults to playerId)

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