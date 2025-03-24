'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { socket, connectSocket, disconnectSocket } from '@/app/lib/socket';

interface SocketContextType {
  socket: typeof socket;
  isConnected: boolean;
  lastMessage: any;
  sendMessage: (message: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket,
  isConnected: false,
  lastMessage: null,
  sendMessage: () => {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const sendMessage = (message: any) => {
    if (isConnected) {
      socket.emit('message', message);
    }
  };

  useEffect(() => {
    // Connect to socket when component mounts
    connectSocket();

    // Update connection status
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onMessage(message: any) {
      setLastMessage(message);
    }

    // Subscribe to socket events
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);

    // Cleanup on unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, lastMessage, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext); 