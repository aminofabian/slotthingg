'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaHistory, FaGamepad, FaEllipsisH } from 'react-icons/fa';
import { IoWallet } from 'react-icons/io5';
import { useState } from 'react';
import MoreDrawer from './MoreDrawer';
import { SiMarketo, SiMoneygram, SiWebmoney } from 'react-icons/si';
import { BiMoney, BiMoneyWithdraw, BiPurchaseTag, BiLogOut } from 'react-icons/bi';
import { FaMoneyBill, FaMoneyBill1 } from 'react-icons/fa6';
import { BsCash } from 'react-icons/bs';
import { GiCash, GiMoneyStack } from 'react-icons/gi';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard/purchase', label: 'Purchase', icon: BiMoney },
  { href: '/dashboard/cashout', label: 'Cashout', icon: GiCash },
  { href: '/dashboard', label: 'Home', icon: FaHome, isHome: true },
  { href: '/dashboard/withdrawal', label: 'Withdrawal', icon: GiMoneyStack },
  { href: '/dashboard/more', label: 'More', icon: FaEllipsisH },
];

export default function MobileNavbar() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
      <MoreDrawer 
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Enhanced floating effect and background blur */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-gray-900/85 to-gray-900/75 
          backdrop-blur-xl border-t border-[#00ffff]/5 shadow-lg shadow-black/50" />

        {/* Navigation content with improved spacing */}
        <div className="relative px-4 pb-safe">
          <div className="flex items-center justify-between h-[4.5rem] mx-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              if (item.isHome) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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

              if (item.href === '/dashboard/more') {
                return (
                  <button
                    key={item.href}
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

              return (
                <Link
                  key={item.href}
                  href={item.href}
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
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
