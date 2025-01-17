'use client';

import { useSocket } from "@/app/contexts/SocketContext";
import { useEffect } from 'react';

interface GameUpdateData {
  gameId: string;
  status: string;
  // add other game update fields
}

interface BalanceUpdateData {
  balance: number;
  userId: string;
  // add other balance update fields
}

export default function GameComponent() {
  const { socket, isConnected, lastMessage } = useSocket();

  useEffect(() => {
    // Listen for game events
    socket.on('gameUpdate', (data: GameUpdateData) => {
      console.log('Game update received:', data);
      // Handle game updates
    });

    socket.on('balanceUpdate', (data: BalanceUpdateData) => {
      console.log('Balance update received:', data);
      // Update user balance
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('balanceUpdate');
    };
  }, [socket]);

  const handleGameAction = () => {
    // Emit game actions to server
    socket.emit('gameAction', {
      action: 'play',
      gameId: 'some-game-id',
      // other game data
    });
  };

  return (
    <div>
      <div className="text-white">
        Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      {/* Your game UI */}
    </div>
  );
} 