'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IoNotificationsOutline } from 'react-icons/io5';
import { BiUser } from 'react-icons/bi';
import { GiTakeMyMoney } from 'react-icons/gi';
import Logo from '../Logo/Logo';
import PurchaseModal from './PurchaseModal';
import CashoutModal from './CashoutModal';

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const [notifications] = useState(3);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <>
      <PurchaseModal 
        isOpen={isPurchaseModalOpen} 
        onClose={() => setIsPurchaseModalOpen(false)} 
      />
      <CashoutModal 
        isOpen={isCashoutModalOpen}
        onClose={() => setIsCashoutModalOpen(false)}
        currentBalance={0}
      />

      <nav className="container fixed top-0 right-0 left-0 bg-black/40 backdrop-blur-lg border-b border-[#00ffff]/10 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Menu Button (Mobile Only) */}
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 text-[#00ffff] hover:bg-[#00ffff]/10 rounded-lg
                transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" 
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 transparent">
            
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsPurchaseModalOpen(true)}
                className="hidden md:flex items-center gap-3 px-6 py-2.5 
                  bg-[#00ffff]/10 hover:bg-[#00ffff]/20 text-[#00ffff] 
                  rounded-lg border border-[#00ffff]/20 
                  transition-all duration-300 group"
              >
                <GiTakeMyMoney className="text-2xl group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Purchase</span>
              </button>
              
              <button 
                onClick={() => setIsCashoutModalOpen(true)}
                className="hidden md:flex items-center gap-3 px-6 py-2.5 
                  bg-[#00ffff]/10 hover:bg-[#00ffff]/20 text-[#00ffff] 
                  rounded-lg border border-[#00ffff]/20 
                  transition-all duration-300 group"
              >
                <GiTakeMyMoney className="text-2xl group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">Cashout</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <IoNotificationsOutline 
                  className="text-3xl text-[#00ffff] cursor-pointer 
                    hover:text-white transition-colors duration-300" 
                />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white 
                    text-xs w-5 h-5 rounded-full flex items-center justify-center
                    animate-pulse"
                  >
                    {notifications}
                  </span>
                )}
              </div>
              
              {/* User Profile */}
              <Link 
                href="/dashboard/profile" 
                className="flex items-center gap-3 p-2 rounded-lg 
                  hover:bg-[#00ffff]/10 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#00ffff]/10 
                  flex items-center justify-center 
                  group-hover:bg-[#00ffff]/20 transition-colors"
                >
                  <BiUser className="text-2xl text-[#00ffff] 
                    group-hover:text-white transition-colors" />
                </div>
                <span className="hidden md:block text-[#00ffff] font-medium text-lg
                  group-hover:text-white transition-colors"
                >
                  {username || 'Guest'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
