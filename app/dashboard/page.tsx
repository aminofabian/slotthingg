'use client';

import { useState } from 'react';
import Navbar from '../components/Dashboard/Navbar';
import TopNav from '../components/Dashboard/TopNav';
import MobileTopNav from '../components/Dashboard/MobileTopNav';
import DashboardContent from '../components/Dashboard/DashboardContent';
import MobileNavbar from '../components/Dashboard/MobileNavbar';
import { BiMoney } from 'react-icons/bi';
import { GiDiamonds } from 'react-icons/gi';
import ChatModal from '../components/Chat/ChatModal';
import useChatStore from '../store/useChatStore';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isOpen: isChatOpen, close: closeChat } = useChatStore();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Main Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800
          transform transition-transform duration-300 ease-in-out
          hidden lg:block
        `}>
          <Navbar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col w-full">
          {/* Top Navigation */}
          <div className="sticky top-0 z-40">
            {/* Desktop Top Nav */}
            <div className="hidden lg:block bg-gray-900 border-b border-gray-800">
              <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            </div>
            {/* Mobile Top Nav */}
            <MobileTopNav />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-[#0f172a] pb-16 lg:pb-0">
            <div className="lg:pl-72 w-full">
              <DashboardContent />
            </div>
          </main>

          {/* Mobile Navigation - Visible only on mobile */}
          <MobileNavbar />
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={closeChat} />
    </div>
  );
}