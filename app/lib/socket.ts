import { io as ClientIO } from 'socket.io-client';

// URL should match your WebSocket server endpoint
const SOCKET_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Create socket instances
export const socket = ClientIO(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const chatSocket = ClientIO(`${SOCKET_URL}/chat`, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    
    socket.on('connect', () => {
      console.log('Main WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('Main WebSocket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Main WebSocket error:', error);
    });

    // Set up chat-specific event handlers
    chatSocket.on('connect', () => {
      console.log('Chat WebSocket connected');
    });

    chatSocket.on('message', (data) => {
      console.log('Chat message received:', data);
    });
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Export a function to send chat messages
export const sendChatMessage = (message: any) => {
  chatSocket.emit('message', message);
}; 