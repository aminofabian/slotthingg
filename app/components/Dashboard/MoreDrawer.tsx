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
  FaInfoCircle,
  FaTimes,
  FaWallet,
  FaGamepad,
  FaChartLine
} from 'react-icons/fa';

const menuItems = [
  { 
    href: '/dashboard/profile', 
    label: 'Profile', 
    icon: FaUser,
    color: 'from-blue-500/20 via-blue-400/10 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20'
  },
  { 
    href: '/dashboard/wallet', 
    label: 'Wallet', 
    icon: FaWallet,
    color: 'from-green-500/20 via-green-400/10 to-green-600/5',
    iconColor: 'text-green-400',
    borderColor: 'border-green-500/20'
  },
  { 
    href: '/dashboard/games', 
    label: 'Games', 
    icon: FaGamepad,
    color: 'from-purple-500/20 via-purple-400/10 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20'
  },
  { 
    href: '/dashboard/stats', 
    label: 'Statistics', 
    icon: FaChartLine,
    color: 'from-yellow-500/20 via-yellow-400/10 to-yellow-600/5',
    iconColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/20'
  },
  { 
    href: '/dashboard/notifications', 
    label: 'Alerts', 
    icon: FaBell,
    color: 'from-red-500/20 via-red-400/10 to-red-600/5',
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/20'
  },
  { 
    href: '/dashboard/settings', 
    label: 'Settings', 
    icon: FaCog,
    color: 'from-sky-500/20 via-sky-400/10 to-sky-600/5',
    iconColor: 'text-sky-400',
    borderColor: 'border-sky-500/20'
  },
  { 
    href: '/dashboard/support', 
    label: 'Support', 
    icon: FaHeadset,
    color: 'from-cyan-500/20 via-cyan-400/10 to-cyan-600/5',
    iconColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/20'
  },
  { 
    href: '/dashboard/security', 
    label: 'Security', 
    icon: FaShieldAlt,
    color: 'from-emerald-500/20 via-emerald-400/10 to-emerald-600/5',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20'
  },
];

interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MoreDrawer({ isOpen, onClose }: MoreDrawerProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 left-0 flex max-w-full justify-center">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="pointer-events-auto w-full max-w-md">
                  <div className="flex h-full flex-col overflow-hidden bg-gradient-to-b from-gray-900/95 via-black to-black rounded-t-3xl
                    backdrop-blur-xl border-t border-white/10">
                    {/* Drawer Handle */}
                    <div className="flex justify-center pt-4 pb-2">
                      <div className="h-1 w-12 rounded-full bg-white/20" />
                    </div>

                    {/* Header */}
                    <div className="px-6 py-4 flex justify-between items-center">
                      <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 
                        text-transparent bg-clip-text">
                        More Options
                      </Dialog.Title>
                      <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 
                          hover:text-white transition-all duration-200"
                      >
                        <FaTimes className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Grid Menu */}
                    <div className="px-6 py-4 grid grid-cols-2 gap-4 overflow-y-auto">
                      {menuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`group flex flex-col items-center p-4 rounded-2xl
                            bg-gradient-to-br ${item.color} border ${item.borderColor}
                            hover:scale-105 hover:shadow-lg hover:shadow-black/50
                            transition-all duration-300 backdrop-blur-sm
                            hover:border-opacity-50`}
                        >
                          <div className={`p-4 rounded-2xl bg-black/30 
                            group-hover:bg-black/40 backdrop-blur-sm
                            transition-all duration-300 mb-3
                            ring-1 ring-white/10 group-hover:ring-white/20
                            shadow-lg`}
                          >
                            <item.icon className={`w-6 h-6 ${item.iconColor}
                              group-hover:scale-110 transition-transform duration-300`} />
                          </div>
                          <span className="text-sm font-medium text-white/90 group-hover:text-white
                            transition-colors duration-300">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {/* Logout Button */}
                    <div className="px-6 py-4 mt-auto border-t border-white/5 bg-black/20">
                      <button
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-3 p-4 rounded-xl
                          bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-600/5
                          hover:from-red-500/20 hover:via-red-500/10 hover:to-red-600/10
                          border border-red-500/20 hover:border-red-500/30
                          transition-all duration-300 group
                          hover:shadow-lg hover:shadow-red-500/5"
                      >
                        <FaSignOutAlt className="w-5 h-5 text-red-500 
                          group-hover:scale-110 transition-transform duration-300" />
                        <span className="font-medium text-red-500">
                          Logout
                        </span>
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 