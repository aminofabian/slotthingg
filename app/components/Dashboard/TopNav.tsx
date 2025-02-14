'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IoNotificationsOutline } from 'react-icons/io5';
import { BiUser, BiLogOut } from 'react-icons/bi';
import { GiTakeMyMoney } from 'react-icons/gi';
import Logo from '../Logo/Logo';
import PurchaseModal from './PurchaseModal';
import CashoutModal from './CashoutModal';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const router = useRouter();
  const [notifications] = useState(3);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

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

      // Proceed with client-side cleanup
      // Clear local storage
      localStorage.clear();
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to logout. Please try again.');
      
      // If there's an error, clear storage and redirect anyway
      localStorage.clear();
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

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
              
              {/* User Profile and Logout */}
              <div className="flex items-center gap-2">
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

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 p-2 rounded-lg
                    hover:bg-red-500/10 text-red-500
                    transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-full bg-red-500/10
                    flex items-center justify-center
                    group-hover:bg-red-500/20 transition-colors"
                  >
                    {isLoggingOut ? (
                      <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <BiLogOut className="text-2xl text-red-500
                        group-hover:text-red-600 transition-colors" />
                    )}
                  </div>
                  <span className="hidden md:block font-medium text-lg
                    group-hover:text-red-600 transition-colors"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
