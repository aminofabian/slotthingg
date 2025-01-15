'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiMoney, BiHistory, BiUser, BiSupport } from 'react-icons/bi';
import { FaGamepad, FaStore, FaDice, FaHome, FaEllipsisH } from 'react-icons/fa';
import { GiTakeMyMoney } from 'react-icons/gi';
import { IoTicketOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Purchase', icon: BiMoney, href: '/dashboard/purchase' },
  { label: 'Cashout', icon: GiTakeMyMoney, href: '/dashboard/cashout' },
  { label: 'Home', icon: FaHome, href: '/dashboard' },
  { label: 'Games', icon: FaGamepad, href: '/dashboard/games' },
  { label: 'More', icon: FaEllipsisH, href: '#' },
];

const moreMenuItems = [
  {
    title: 'Gaming',
    items: [
      { label: 'Marketplace', icon: FaStore, href: '/dashboard/marketplace' },
      { label: 'Roulette', icon: FaDice, href: '/dashboard/roulette' },
      { label: 'Draw', icon: IoTicketOutline, href: '/dashboard/draws' },
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'History', icon: BiHistory, href: '/dashboard/history' },
      { label: 'Profile', icon: BiUser, href: '/dashboard/profile' },
      { label: 'Support', icon: BiSupport, href: '/dashboard/support' },
    ]
  }
];

const MobileNavbar = () => {
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  return (
    <>
      {/* Safe Area Wrapper */}
      <div className="fixed bottom-0 left-0 right-0 pb-safe z-50 pointer-events-none md:hidden">
        <div className="mx-4 mb-4">
          {/* Bottom Navigation */}
          <nav className="bg-gradient-to-b from-gray-900/95 to-black border border-[#7ffdfd]/10 rounded-2xl backdrop-blur-xl shadow-xl shadow-black/20 pointer-events-auto">
            <div className="max-w-md mx-auto">
              <div className="flex justify-around items-end px-2 h-16">
                {navItems.map((item) => {
                  const isActive = item.href !== '#' && pathname === item.href;
                  const Icon = item.icon;
                  const isHome = item.label === 'Home';
                  const isMore = item.label === 'More';
                  
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        if (isMore) {
                          setIsMoreMenuOpen(!isMoreMenuOpen);
                        } else if (item.href !== '#') {
                          window.location.href = item.href;
                        }
                      }}
                      className={`relative flex flex-col items-center ${
                        isHome ? '-mt-8' : 'pb-1'
                      } ${isMore && isMoreMenuOpen ? 'text-[#00ffff]' : ''}`}
                    >
                      {isHome ? (
                        <div className="relative">
                          <div className="absolute -inset-3 bg-gradient-to-b from-gray-900 to-black rounded-full blur-sm" />
                          <div className="relative bg-[#00ffff] p-4 rounded-full shadow-lg shadow-[#00ffff]/20 border-4 border-gray-900">
                            <Icon className="w-6 h-6 text-gray-900" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-16 flex justify-center">
                          {isActive && (
                            <motion.div
                              layoutId="navIndicator"
                              className="absolute inset-0 bg-[#00ffff]/10 rounded-2xl -mx-4"
                              transition={{ type: "spring", duration: 0.5 }}
                            />
                          )}
                          <Icon 
                            className={`w-6 h-6 ${
                              isActive || (isMore && isMoreMenuOpen)
                                ? 'text-[#00ffff]' 
                                : 'text-gray-400'
                            } transition-all duration-200 ${
                              !isActive && 'hover:text-[#7ffdfd] hover:scale-110'
                            }`}
                          />
                        </div>
                      )}
                      <span 
                        className={`text-xs mt-1 font-medium tracking-tight ${
                          isActive || (isMore && isMoreMenuOpen)
                            ? 'text-[#00ffff]' 
                            : 'text-gray-500'
                        } ${!isHome ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* More Menu Drawer */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-0 right-0 mx-4 bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-[#7ffdfd]/10 shadow-xl shadow-black/20 z-40 md:hidden overflow-hidden"
            >
              <div className="p-6 max-w-md mx-auto">
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-1 bg-gray-700 rounded-full" />
                </div>
                
                {moreMenuItems.map((section, sectionIndex) => (
                  <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
                    <h3 className="text-gray-400 text-sm font-medium mb-3 px-1">
                      {section.title}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 ${
                              isActive 
                                ? 'bg-[#00ffff]/10 text-[#00ffff] shadow-lg shadow-[#00ffff]/5' 
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/80 hover:scale-[1.02]'
                            }`}
                          >
                            <div className={`p-3 rounded-xl ${
                              isActive ? 'bg-[#00ffff]/20' : 'bg-gray-700/50'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-center">
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavbar;
