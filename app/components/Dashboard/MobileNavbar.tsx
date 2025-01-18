'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaHistory, FaGamepad, FaEllipsisH } from 'react-icons/fa';
import { IoWallet } from 'react-icons/io5';
import { useState } from 'react';
import MoreDrawer from './MoreDrawer';
import { SiMarketo } from 'react-icons/si';

const navItems = [
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: SiMarketo },
  { href: '/dashboard/wallet', label: 'Wallet', icon: IoWallet },
  { href: '/dashboard', label: 'Home', icon: FaHome, isHome: true },
  { href: '/dashboard/history', label: 'History', icon: FaHistory },
  { href: '/dashboard/more', label: 'More', icon: FaEllipsisH },
];

export default function MobileNavbar() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <MoreDrawer 
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
      />
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Background with blur effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/95 to-gray-900/90 
          backdrop-blur-lg border-t border-[#00ffff]/10" />

        {/* Navigation content */}
        <div className="relative px-6 pb-safe">
          <div className="flex items-center justify-between h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              if (item.isHome) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative -mt-8 flex flex-col items-center"
                  >
                    <div className="relative">
                      {/* Glow effect behind home button */}
                      <div className="absolute -inset-3 bg-[#00ffff]/20 rounded-full blur-lg" />
                      
                      {/* Home button */}
                      <div className={`relative p-4 rounded-full 
                        ${isActive 
                          ? 'bg-[#00ffff] shadow-lg shadow-[#00ffff]/30' 
                          : 'bg-gray-800 border-2 border-[#00ffff]/30'} 
                        transition-all duration-300 hover:scale-110`}
                      >
                        <item.icon className={`w-6 h-6 ${
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
                    className="flex flex-col items-center relative group"
                  >
                    {/* Active indicator line */}
                    {isActive && (
                      <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px]
                        bg-[#00ffff] rounded-full shadow-[0_0_8px_#00ffff]" />
                    )}

                    <div className="relative p-2">
                      <item.icon className={`w-6 h-6 transition-all duration-200 
                        ${isActive 
                          ? 'text-[#00ffff] scale-110' 
                          : 'text-gray-400 group-hover:text-[#00ffff]/80 group-hover:scale-110'}`} 
                      />
                      
                      {/* Active indicator dot */}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 
                          rounded-full bg-[#00ffff] shadow-[0_0_8px_#00ffff]" />
                      )}
                    </div>

                    <span className={`text-xs font-medium transition-colors duration-200 
                      ${isActive 
                        ? 'text-[#00ffff]' 
                        : 'text-gray-400 group-hover:text-[#00ffff]/80'}`}
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
                  className="flex flex-col items-center relative group"
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px]
                      bg-[#00ffff] rounded-full shadow-[0_0_8px_#00ffff]" />
                  )}

                  <div className="relative p-2">
                    <item.icon className={`w-6 h-6 transition-all duration-200 
                      ${isActive 
                        ? 'text-[#00ffff] scale-110' 
                        : 'text-gray-400 group-hover:text-[#00ffff]/80 group-hover:scale-110'}`} 
                    />
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 
                        rounded-full bg-[#00ffff] shadow-[0_0_8px_#00ffff]" />
                    )}
                  </div>

                  <span className={`text-xs font-medium transition-colors duration-200 
                    ${isActive 
                      ? 'text-[#00ffff]' 
                      : 'text-gray-400 group-hover:text-[#00ffff]/80'}`}
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
