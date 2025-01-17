import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('gameAction', (data) => {
      // Handle game actions
      console.log('Game action received:', data);
      
      // Broadcast updates to clients
      io.emit('gameUpdate', {
        // game update data
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
} 