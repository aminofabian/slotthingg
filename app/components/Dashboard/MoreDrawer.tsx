'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import { 
  FaUser, 
  FaCog, 
  FaHeadset,
  FaSignOutAlt, 
  FaShieldAlt,
  FaBell,
  FaHistory,
  FaWallet,
  FaTimes,
  FaGamepad,
  FaChartLine,
  FaQuestionCircle
} from 'react-icons/fa';
import { BiUser, BiHistory, BiLogOut } from 'react-icons/bi';

// Group menu items by category
const menuGroups = [
  {
    title: 'Account',
    items: [
      { 
        href: '/dashboard/profile', 
        label: 'Profile', 
        icon: FaUser,
        color: 'from-blue-500/20 via-blue-400/10 to-blue-600/5',
        iconColor: 'text-blue-400',
      },
      { 
        href: '/dashboard/wallet', 
        label: 'Wallet', 
        icon: FaWallet,
        color: 'from-green-500/20 via-green-400/10 to-green-600/5',
        iconColor: 'text-green-400',
      },
      { 
        href: '/dashboard/history', 
        label: 'History', 
        icon: FaHistory,
        color: 'from-purple-500/20 via-purple-400/10 to-purple-600/5',
        iconColor: 'text-purple-400',
      },
    ]
  },
  {
    title: 'Gaming',
    items: [
      { 
        href: '/dashboard/games', 
        label: 'Games', 
        icon: FaGamepad,
        color: 'from-yellow-500/20 via-yellow-400/10 to-yellow-600/5',
        iconColor: 'text-yellow-400',
      },
      { 
        href: '/dashboard/stats', 
        label: 'Statistics', 
        icon: FaChartLine,
        color: 'from-orange-500/20 via-orange-400/10 to-orange-600/5',
        iconColor: 'text-orange-400',
      },
    ]
  },
  {
    title: 'Support & Settings',
    items: [
      { 
        href: '/dashboard/notifications', 
        label: 'Notifications', 
        icon: FaBell,
        color: 'from-red-500/20 via-red-400/10 to-red-600/5',
        iconColor: 'text-red-400',
      },
      { 
        href: '/dashboard/support', 
        label: 'Support', 
        icon: FaHeadset,
        color: 'from-cyan-500/20 via-cyan-400/10 to-cyan-600/5',
        iconColor: 'text-cyan-400',
      },
      { 
        href: '/dashboard/security', 
        label: 'Security', 
        icon: FaShieldAlt,
        color: 'from-emerald-500/20 via-emerald-400/10 to-emerald-600/5',
        iconColor: 'text-emerald-400',
      },
      { 
        href: '/dashboard/settings', 
        label: 'Settings', 
        icon: FaCog,
        color: 'from-sky-500/20 via-sky-400/10 to-sky-600/5',
        iconColor: 'text-sky-400',
      },
    ]
  }
];

interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}

const drawerItems = [
  { href: '/dashboard/profile', label: 'Profile', icon: BiUser },
  { href: '/dashboard/history', label: 'History', icon: BiHistory },
  { href: '/dashboard/games', label: 'Games', icon: FaGamepad },
];

export default function MoreDrawer({ isOpen, onClose, onLogout, isLoggingOut }: MoreDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#002222] rounded-t-3xl z-50
        transform transition-transform duration-300 ease-out"
      >
        <div className="p-4">
          {/* Handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

          {/* Menu Items */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {drawerItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex flex-col items-center gap-2 p-4 rounded-xl
                  bg-white/5 hover:bg-white/10 transition-colors duration-200"
              >
                <item.icon className="text-2xl text-[#00ffff]" />
                <span className="text-sm text-white/80">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl
              bg-red-500/10 hover:bg-red-500/20 text-red-500
              transition-all duration-300 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <BiLogOut className="text-xl" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
} 