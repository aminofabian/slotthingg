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

export default function MoreDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
                  <div className="flex h-full flex-col overflow-hidden bg-gradient-to-b from-gray-900/95 via-black to-black rounded-t-3xl">
                    {/* Drawer Handle */}
                    <div className="flex justify-center pt-4 pb-2">
                      <div className="h-1 w-12 rounded-full bg-white/20" />
                    </div>

                    {/* Header with Close Button */}
                    <div className="px-4 py-3 flex justify-between items-center border-b border-white/5">
                      <h2 className="text-lg font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 
                        text-transparent bg-clip-text">
                        Quick Menu
                      </h2>
                      <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-white/5 hover:bg-white/10 border border-white/10
                          hover:border-white/20 transition-all duration-200 group"
                      >
                        <span className="text-sm font-medium text-white/70 
                          group-hover:text-white">
                          Close
                        </span>
                        <FaTimes className="w-4 h-4 text-white/60 
                          group-hover:text-white group-hover:rotate-90
                          transition-all duration-300" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto px-4 py-2">
                      {menuGroups.map((group, index) => (
                        <div 
                          key={group.title}
                          className={`py-4 ${
                            index !== 0 ? 'border-t border-white/5' : ''
                          }`}
                        >
                          <h3 className="text-sm font-medium text-white/60 px-2 mb-3">
                            {group.title}
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {group.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex flex-col items-center p-3 rounded-xl
                                  bg-gradient-to-br ${item.color}
                                  hover:scale-105 transition-all duration-200
                                  border border-white/5 hover:border-white/20
                                  group relative overflow-hidden`}
                              >
                                <div className={`p-3 rounded-xl bg-black/30 
                                  backdrop-blur-sm mb-2 relative z-10
                                  group-hover:bg-black/40 transition-colors`}
                                >
                                  <item.icon className={`w-5 h-5 ${item.iconColor}
                                    group-hover:scale-110 transition-transform duration-200`} 
                                  />
                                </div>
                                <span className="text-sm font-medium text-white/90 
                                  group-hover:text-white relative z-10">
                                  {item.label}
                                </span>
                                {/* Hover gradient overlay */}
                                <div className="absolute inset-0 opacity-0 
                                  group-hover:opacity-100 transition-opacity duration-200
                                  bg-gradient-to-t from-white/5 to-transparent" 
                                />
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Logout Button */}
                    <div className="mt-auto p-4 border-t border-white/5">
                      <button
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-3 p-4 
                          rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/5
                          hover:from-red-500/20 hover:to-red-600/10
                          border border-red-500/20 hover:border-red-500/30
                          transition-all duration-200 group"
                      >
                        <FaSignOutAlt className="w-5 h-5 text-red-500 
                          group-hover:scale-110 transition-transform duration-200" 
                        />
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