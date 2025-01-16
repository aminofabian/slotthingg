'use client';
import { useState } from 'react';
import Link from 'next/link';
import { IoNotificationsOutline } from 'react-icons/io5';
import { BiUser } from 'react-icons/bi';
import { GiTakeMyMoney } from 'react-icons/gi';
import Logo from '../Logo/Logo';
import PurchaseModal from './PurchaseModal';

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const [notifications] = useState(3);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  return (
    <>
      {/* Purchase Modal */}
      <PurchaseModal 
        isOpen={isPurchaseModalOpen} 
        onClose={() => setIsPurchaseModalOpen(false)} 
      />

      <nav className="fixed top-0 right-0 left-0 bg-black/20 backdrop-blur-lg border-b border-white/5 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Menu Button (Mobile Only) */}
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 text-[#7ffdfd] hover:bg-[#7ffdfd]/10 rounded-lg
                transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Logo */}
            <Logo />

            {/* Action Buttons */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsPurchaseModalOpen(true)}
                className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg border border-primary/30 transition-all duration-300"
              >
                <GiTakeMyMoney className="text-2xl" />
                <span className="font-semibold text-lg">Purchase</span>
              </button>
              
              <Link 
                href="/dashboard/cashout" 
                className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg border border-primary/30 transition-all duration-300"
              >
                <GiTakeMyMoney className="text-2xl" />
                <span className="font-semibold text-lg">Cashout</span>
              </Link>

              {/* Notifications */}
              <div className="relative">
                <IoNotificationsOutline className="text-3xl text-primary cursor-pointer hover:text-primary-light transition-colors" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </div>
              
              {/* User Profile */}
              <Link href="/dashboard/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <BiUser className="text-2xl text-primary" />
                </div>
                <span className="hidden md:block text-primary font-medium text-lg">John Doe</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
