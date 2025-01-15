'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiMoney, BiHistory, BiUser } from 'react-icons/bi';
import { FaGamepad, FaStore, FaDice } from 'react-icons/fa';
import { GiDiamonds, GiStarsStack, GiTakeMyMoney } from 'react-icons/gi';
import { IoTicketOutline } from 'react-icons/io5';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const menuGroups = [
    {
      title: 'Stats',
      items: [
        { label: 'Balance', value: '$0', icon: BiMoney, type: 'stat' },
        { label: 'In games', value: '$0', icon: GiTakeMyMoney, type: 'stat' },
        { label: 'Diamonds', value: '0', icon: GiDiamonds, type: 'stat' },
        { label: 'XP', value: '500', icon: GiStarsStack, type: 'stat' },
      ]
    },
    {
      title: 'Gaming',
      items: [
        { label: 'Games', icon: FaGamepad, type: 'link', href: '/dashboard/games' },
        { label: 'Roulette', icon: FaDice, type: 'link', href: '/dashboard/roulette' },
        { label: 'Draws', icon: IoTicketOutline, type: 'link', href: '/dashboard/draws' },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: BiUser, type: 'link', href: '/dashboard/profile' },
        { label: 'History', icon: BiHistory, type: 'link', href: '/dashboard/history' },
        { label: 'Marketplace', icon: FaStore, type: 'link', href: '/dashboard/marketplace' },
      ]
    }
  ];

  // Mobile navigation items
  const mobileNavItems = [
    { label: 'Games', icon: FaGamepad, href: '/dashboard/games' },
    { label: 'History', icon: BiHistory, href: '/dashboard/history' },
    { label: 'Marketplace', icon: FaStore, href: '/dashboard/marketplace' },
    { label: 'Profile', icon: BiUser, href: '/dashboard/profile' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen bg-black/40 backdrop-blur-lg border-r border-primary/20 transition-all duration-300 pt-16 w-72">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-0 top-20 translate-x-1/2 bg-primary/20 backdrop-blur-lg p-2 rounded-full border border-primary/30 text-primary hover:bg-primary/30 transition-all duration-300"
        >
          {isOpen ? '←' : '→'}
        </button>
        
        <div className="flex flex-col h-full p-4 overflow-y-auto">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-8">
              <h3 className="text-sm font-semibold text-primary-dark uppercase tracking-wider mb-3 px-2">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.items.map((item, index) => (
                  <div key={index}>
                    {item.type === 'stat' ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all duration-300">
                        <item.icon className="text-2xl sm:text-3xl text-primary" />
                        <div className="flex flex-col">
                          <span className="text-base text-primary-dark">{item.label}</span>
                          <span className="text-xl font-bold text-primary">{item.value}</span>
                        </div>
                      </div>
                    ) : (
                      <Link 
                        href={item.href} 
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group
                          ${pathname === item.href ? 'bg-primary/20 text-primary-light' : 'hover:bg-primary/10 text-primary'}`}
                      >
                        <item.icon className="text-2xl sm:text-3xl group-hover:text-primary-light" />
                        <span className="text-lg group-hover:text-primary-light">{item.label}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-lg border-t border-primary/20 z-50">
        <div className="flex justify-around items-center h-16">
          {mobileNavItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 transition-all duration-300
                ${pathname === item.href ? 'text-primary-light' : 'text-primary'}`}
            >
              <item.icon className="text-2xl" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
