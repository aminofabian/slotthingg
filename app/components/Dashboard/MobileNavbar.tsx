'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaHistory, FaGamepad, FaEllipsisH } from 'react-icons/fa';
import { IoWallet } from 'react-icons/io5';
import { useState } from 'react';
import MoreDrawer from './MoreDrawer';
import { SiMarketo, SiMoneygram, SiWebmoney } from 'react-icons/si';
import { BiMoney, BiMoneyWithdraw, BiPurchaseTag, BiLogOut, BiSupport } from 'react-icons/bi';
import { FaMoneyBill, FaMoneyBill1 } from 'react-icons/fa6';
import { BsCash } from 'react-icons/bs';
import { GiCash, GiMoneyStack } from 'react-icons/gi';
import toast from 'react-hot-toast';
import PurchaseModal from '../Dashboard/PurchaseModal';
import CashoutModal from './CashoutModal';
import useChatStore from '@/app/store/useChatStore';

const navItems = [
  { label: 'Purchase', icon: BiMoney, isPurchase: true },
  { label: 'Cashout', icon: GiCash, isCashout: true },
  { href: '/dashboard', label: 'Home', icon: FaHome, isHome: true },
  { label: 'Support', icon: BiSupport, isChat: true },
  { href: '/dashboard/more', label: 'More', icon: FaEllipsisH },
];

export default function MobileNavbar() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  
  // Use the shared chat store instead of local state
  const { isOpen: isChatOpen, open: openChat, close: closeChat } = useChatStore();
  
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Logout failed:', text);
      }

      // Clear local storage
      localStorage.clear();
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Close the more drawer if it's open
      setIsMoreOpen(false);
      
      // Redirect to login page with page reload
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to logout. Please try again.');
      
      // If there's an error, clear storage and redirect anyway
      localStorage.clear();
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <MoreDrawer 
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      <PurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
      <CashoutModal
        isOpen={isCashoutModalOpen}
        onClose={() => setIsCashoutModalOpen(false)}
        currentBalance={currentBalance}
      />
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Enhanced floating effect and background blur */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-gray-900/85 to-gray-900/75 
          backdrop-blur-xl border-t border-[#00ffff]/5 shadow-lg shadow-black/50" />

        {/* Navigation content with improved spacing */}
        <div className="relative px-4 pb-safe">
          <div className="flex items-center justify-between h-[4.5rem] mx-2">
            {navItems.map((item) => {
              const isActive = item.href ? pathname === item.href : false;
              
              if (item.isHome) {
                return (
                  <Link
                    key="home"
                    href={item.href || ''}
                    className="relative -mt-10 flex flex-col items-center transform transition-transform active:scale-95"
                  >
                    <div className="relative">
                      {/* Enhanced glow effect behind home button */}
                      <div className="absolute -inset-3 bg-[#00ffff]/20 rounded-full blur-xl opacity-75" />
                      <div className="absolute -inset-3 bg-[#00ffff]/10 rounded-full blur-md" />
                      
                      {/* Enhanced home button */}
                      <div className={`relative p-5 rounded-full transform transition-all duration-200 ease-out
                        ${isActive 
                          ? 'bg-[#00ffff] shadow-lg shadow-[#00ffff]/30 scale-110' 
                          : 'bg-gray-800/90 border-2 border-[#00ffff]/30 hover:border-[#00ffff]/50'} 
                        hover:scale-105 active:scale-95`}
                      >
                        <item.icon className={`w-7 h-7 ${
                          isActive ? 'text-gray-900' : 'text-[#00ffff]'
                        }`} />
                      </div>
                    </div>
                    <span className="text-xs font-medium mt-1 opacity-0">
                      {item.label}
                    </span>
                  </Link>
                );
              }

              if (item.isChat) {
                return (
                  <button
                    key="support-chat"
                    onClick={openChat}
                    className="flex flex-col items-center relative group py-2 px-3 transform transition-transform active:scale-95"
                  >
                    {/* Drawer indicator line */}
                    <div className="absolute left-[2px] top-1/2 -translate-y-1/2 h-8 w-0.5 
                      bg-gradient-to-b from-transparent via-[#00ffff]/70 to-transparent rounded-full 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Enhanced active indicator line */}
                    {isChatOpen && (
                      <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-12 h-[2px]
                        bg-[#00ffff] rounded-full shadow-[0_0_12px_#00ffff] animate-pulse" />
                    )}

                    <div className="relative p-2">
                      <item.icon className={`w-6 h-6 transition-all duration-300 ease-out
                        ${isChatOpen 
                          ? 'text-[#00ffff] scale-110' 
                          : 'text-gray-400 group-hover:text-[#00ffff]/90 group-hover:scale-105'}`} 
                      />
                      
                      {/* Enhanced active indicator dot */}
                      {isChatOpen && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 
                          rounded-full bg-[#00ffff] shadow-[0_0_8px_#00ffff] animate-pulse" />
                      )}
                    </div>

                    <span className={`text-xs font-medium transition-colors duration-300 ease-out
                      ${isChatOpen 
                        ? 'text-[#00ffff]' 
                        : 'text-gray-400 group-hover:text-[#00ffff]/90'}`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              }

              if (item.isPurchase) {
                return (
                  <button
                    key="purchase"
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="flex flex-col items-center relative group py-2 px-3 transform transition-transform active:scale-95"
                  >
                    <div className="relative p-2">
                      <item.icon className={`w-6 h-6 transition-all duration-300 ease-out
                        ${isPurchaseModalOpen 
                          ? 'text-[#00ffff] scale-110' 
                          : 'text-gray-400 group-hover:text-[#00ffff]/90 group-hover:scale-105'}`} 
                      />
                      {isPurchaseModalOpen && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 
                          rounded-full bg-[#00ffff] shadow-[0_0_8px_#00ffff] animate-pulse" />
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-300 ease-out
                      ${isPurchaseModalOpen 
                        ? 'text-[#00ffff]' 
                        : 'text-gray-400 group-hover:text-[#00ffff]/90'}`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              }

              if (item.isCashout) {
                return (
                  <button
                    key="cashout"
                    onClick={() => setIsCashoutModalOpen(true)}
                    className="flex flex-col items-center relative group py-2 px-3 transform transition-transform active:scale-95"
                  >
                    <div className="relative p-2">
                      <item.icon className={`w-6 h-6 transition-all duration-300 ease-out
                        ${isCashoutModalOpen 
                          ? 'text-[#00ffff] scale-110' 
                          : 'text-gray-400 group-hover:text-[#00ffff]/90 group-hover:scale-105'}`} 
                      />
                      {isCashoutModalOpen && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 
                          rounded-full bg-[#00ffff] shadow-[0_0_8px_#00ffff] animate-pulse" />
                      )}
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-300 ease-out
                      ${isCashoutModalOpen 
                        ? 'text-[#00ffff]' 
                        : 'text-gray-400 group-hover:text-[#00ffff]/90'}`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              }

              if (item.href === '/dashboard/more') {
                return (
                  <button
                    key="more"
                    onClick={() => setIsMoreOpen(true)}
                    className="flex flex-col items-center relative group py-2 px-3 transform transition-transform active:scale-95"
                  >
                    {/* Enhanced active indicator line */}
                    {isActive && (
                      <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-12 h-[2px]
                        bg-[#00ffff] rounded-full shadow-[0_0_12px_#00ffff] animate-pulse" />
                    )}

                    <div className="relative p-2">
                      <item.icon className={`w-6 h-6 transition-all duration-300 ease-out
                        ${isActive 
                          ? 'text-[#00ffff] scale-110' 
                          : 'text-gray-400 group-hover:text-[#00ffff]/90 group-hover:scale-105'}`} 
                      />
                      
                      {/* Enhanced active indicator dot */}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 
                          rounded-full bg-[#00ffff] shadow-[0_0_8px_#00ffff] animate-pulse" />
                      )}
                    </div>

                    <span className={`text-xs font-medium transition-colors duration-300 ease-out
                      ${isActive 
                        ? 'text-[#00ffff]' 
                        : 'text-gray-400 group-hover:text-[#00ffff]/90'}`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              }

              return null;
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
