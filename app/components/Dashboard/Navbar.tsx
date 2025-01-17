'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiMoney, BiHistory, BiUser } from 'react-icons/bi';
import { FaGamepad, FaStore, FaDice } from 'react-icons/fa';
import { GiDiamonds, GiStarsStack, GiTakeMyMoney } from 'react-icons/gi';
import { IoTicketOutline } from 'react-icons/io5';
import Logo from '../Logo/Logo';

type StatMenuItem = {
  label: string;
  value: string;
  icon: typeof BiMoney | typeof GiTakeMyMoney | typeof GiDiamonds | typeof GiStarsStack;
  type: 'stat';
};

type LinkMenuItem = {
  label: string;
  icon: typeof BiUser | typeof BiHistory | typeof FaGamepad | typeof FaStore | typeof FaDice | typeof IoTicketOutline;
  type: 'link';
  href: string;
};

type MenuItem = StatMenuItem | LinkMenuItem;

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const Navbar = () => {
  const pathname = usePathname();

  const menuGroups: MenuGroup[] = [
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
        { label: 'Games', icon: FaGamepad, type: 'link', href: '/dashboard' },
        { label: 'Roulette', icon: FaDice, type: 'link', href: '/roulette' },
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
      <aside className="hidden lg:block fixed top-0 left-0 h-screen bg-gradient-to-b from-[#002222]/90 via-[#002222]/70 to-[#002222]/90 
        backdrop-blur-xl border-r border-white/10 transition-all duration-500
        w-72">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00ffff]/5 via-[#00dddd]/5 to-[#009999]/5 pointer-events-none" />
        
        <div className="flex flex-col h-full overflow-y-auto relative z-10">
          {/* Logo Section */}
          <div className="px-4 pt-8 pb-4 flex justify-center items-center">
            <div className="w-32 h-12 relative flex items-center justify-center">
              <Logo />
            </div>
          </div>
          
          {/* Menu Content */}
          <div className="p-6 flex-1">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-10">
                <h3 className={`text-sm font-bold text-white/90 uppercase tracking-widest mb-4 px-2 flex items-center`}>
                  <span className="inline-block w-8 h-[1px] bg-gradient-to-r from-[#00ffff] to-transparent mr-2" />
                  {group.title}
                </h3>
                <div className={`${group.title === 'Stats' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
                  {group.items.map((item, index) => (
                    <div key={index}>
                      {item.type === 'stat' ? (
                        <div className={`flex flex-col items-center p-3 rounded-xl
                          bg-gradient-to-br from-[#00ffff]/10 to-transparent
                          border border-[#00ffff]/10 hover:border-[#00ffff]/30
                          transition-all duration-300 group relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Icon */}
                          <div className="bg-gradient-to-br from-[#00ffff]/20 to-[#009999]/20 
                            p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform duration-300">
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          
                          {/* Label */}
                          <span className="text-sm text-white/70 mb-1">{item.label}</span>
                          
                          {/* Value */}
                          <span className="text-lg font-bold text-white group-hover:text-[#00ffff] 
                            transition-colors duration-300">{item.value}</span>
                        </div>
                      ) : item.type === 'link' && item.href ? (
                        <Link 
                          href={item.href} 
                          className={`flex items-center gap-4 p-3 rounded-xl 
                            transition-all duration-300 group relative overflow-hidden
                            ${pathname === item.href 
                              ? 'bg-gradient-to-r from-[#00ffff]/20 to-[#009999]/20 text-white' 
                              : 'text-white hover:bg-white/5'}`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff]/0 via-white/5 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className={`p-2.5 rounded-lg transition-all duration-300 ${
                            pathname === item.href 
                              ? 'bg-gradient-to-br from-[#00ffff]/30 to-[#009999]/30' 
                              : 'bg-white/5 group-hover:bg-gradient-to-br group-hover:from-[#00ffff]/20 group-hover:to-[#009999]/20'
                          }`}>
                            <item.icon className="text-2xl sm:text-3xl" />
                          </div>
                          <span className="text-lg relative z-10">{item.label}</span>
                          {pathname === item.href && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-8 
                              bg-gradient-to-b from-[#00ffff] to-[#009999] rounded-full" />
                          )}
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-gradient-to-t from-black to-gray-900 border-t border-[#7ffdfd]/10 z-50">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
            {mobileNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 text-[#7ffdfd]/70 hover:text-[#7ffdfd] transition-colors`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
