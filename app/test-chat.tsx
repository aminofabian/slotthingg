'use client';
import { useState } from 'react';
import ChatModal from './components/Chat/ChatModalRefactored';
import ChatDrawer from './components/Chat/ChatDrawerRefactored';

export default function TestChat() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Chat Component Test</h1>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Open Modal
        </button>
        
        <button 
          onClick={() => setIsDrawerOpen(true)} 
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Open Drawer
        </button>
      </div>
      
      <ChatModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      <ChatDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
} 