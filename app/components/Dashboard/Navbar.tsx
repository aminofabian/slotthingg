'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BiMoney, BiHistory, BiUser, BiLogOut } from 'react-icons/bi';
import { FaGamepad, FaStore, FaDice } from 'react-icons/fa';
import { GiDiamonds, GiStarsStack, GiTakeMyMoney } from 'react-icons/gi';
import { IoTicketOutline, IoChatbubbleEllipses } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import Logo from '../Logo/Logo';
import toast from 'react-hot-toast';
import useChatStore from '@/app/store/useChatStore';

type UserInfo = {
  username: string;
  role: string;
  userId: string;
  lastLogin: string;
};

type StatMenuItem = {
  label: string;
  value: string;
  icon: typeof BiMoney | typeof GiTakeMyMoney;
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
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileData, setProfileData] = useState<{
    balance: string;
    cashable_balance: string;
    bonus_balance: string;
    full_name: string;
  } | null>(null);
  const openChat = useChatStore((state) => state.open);

  useEffect(() => {
    // Get user info from localStorage
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('user_role');
    const userId = localStorage.getItem('user_id');
    const lastLogin = localStorage.getItem('last_login');

    if (username && role && userId && lastLogin) {
      setUserInfo({
        username,
        role,
        userId,
        lastLogin: new Date(lastLogin).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    }
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    };

    fetchProfileData();
  }, []);

  const menuGroups: MenuGroup[] = [
    {
      title: 'Stats',
      items: [
        { label: 'Main Balance', value: profileData ? `$${profileData.balance}` : '$0', icon: BiMoney, type: 'stat' },
        { label: 'Cashable Balance', value: profileData ? `$${profileData.cashable_balance}` : '$0', icon: GiTakeMyMoney, type: 'stat' },
        { label: 'Bonus Balance', value: profileData ? `$${profileData.bonus_balance}` : '$0', icon: BiMoney, type: 'stat' },
        { label: 'Safe Balance', value: '$0', icon: GiDiamonds, type: 'stat' },
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
      ]
    }
  ];

  // Mobile navigation items
  const mobileNavItems = [
    { label: 'Games', icon: FaGamepad, href: '/dashboard/games' },
    { label: 'History', icon: BiHistory, href: '/history' },
    { label: 'Marketplace', icon: FaStore, href: '/dashboard/marketplace' },
    { label: 'Profile', icon: BiUser, href: '/dashboard/profile' },
  ];

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

      // Proceed with client-side cleanup regardless of API response
      // Clear local storage
      localStorage.clear();
      
      // Show success message
      toast.success('Logged out successfully');
      
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

          {/* User Info Section */}
          {userInfo && (
            <div className="px-6 py-4 border-y border-[#00ffff]/10 backdrop-blur-sm bg-white/[0.02]">
              <div className="space-y-3">
                {/* Welcome Message */}
                <div className="text-sm text-[#00ffff]/70">
                  Welcome aboard,
                </div>
                
                {/* User Name and Role */}
                <div className="space-y-1">
                  <div className="flex flex-col">
                    <span className="text-lg font-medium text-[#00ffff]">
                      {profileData?.full_name || 'Player'}
                    </span>
                    <span className="text-[0.7rem] text-white/60">
                      @{userInfo.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[0.7rem] px-2 py-1 rounded-full bg-[#00ffff]/10 text-[#00ffff] capitalize">
                      {userInfo.role}
                    </span>
                    <span className="text-[0.7rem] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                      Online
                    </span>
                  </div>
                </div>

                {/* User Details */}
                <div className="text-[0.65rem] text-white/40 space-y-1.5 bg-white/[0.02] rounded-lg p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#00ffff]/50">Player ID:</span>
                    <span className="text-white/60 font-mono">{userInfo.userId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#00ffff]/50">Last Seen:</span>
                    <span className="text-white/60">{userInfo.lastLogin}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Menu Content */}
          <div className="p-6 flex-1">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-10">
                <h3 className={`text-[0.6rem] font-bold text-white/90 uppercase tracking-widest mb-4 px-2 flex items-center`}>
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
                          <span className="text-[0.6rem] text-white/70 mb-1">{item.label}</span>
                          
                          {/* Value */}
                          <span className="text-sm font-bold text-white group-hover:text-[#00ffff] 
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
                          <span className="text-sm relative z-10">{item.label}</span>
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

          {/* Chat Button - Updated for drawer style */}
          <div className="px-6">
            <button
              onClick={openChat}
              className="w-full flex items-center gap-4 p-3 rounded-xl 
                bg-gradient-to-r from-[#00ffff]/10 to-transparent
                hover:from-[#00ffff]/20 hover:to-[#00ffff]/5
                text-[#00ffff] transition-all duration-300 group"
            >
              <div className="p-2.5 rounded-lg bg-[#00ffff]/10 
                group-hover:bg-[#00ffff]/20 transition-all duration-300 
                relative overflow-hidden">
                <IoChatbubbleEllipses className="text-2xl sm:text-3xl relative z-10" />
                {/* Slide animation hint */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ffff]/20 to-transparent 
                  opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full 
                  transition-all duration-1000 ease-in-out" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Support Chat</span>
                <span className="text-xs text-[#00ffff]/60">Slide from left</span>
              </div>
            </button>
          </div>

          {/* Logout Button */}
          <div className="p-6 border-t border-[#00ffff]/10">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-4 p-3 rounded-xl 
                bg-gradient-to-r from-red-500/10 to-transparent
                hover:from-red-500/20 hover:to-red-500/5
                text-red-500 transition-all duration-300 group"
            >
              <div className="p-2.5 rounded-lg bg-red-500/10 
                group-hover:bg-red-500/20 transition-all duration-300">
                {isLoggingOut ? (
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <BiLogOut className="text-2xl sm:text-3xl" />
                )}
              </div>
              <span className="text-sm">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </span>
            </button>
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
                <span className="text-[0.6rem] whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
            {/* Mobile Chat Button - Updated for drawer style */}
            <button
              onClick={openChat}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 text-[#00ffff]/70 hover:text-[#00ffff] transition-colors relative"
            >
              <div className="relative">
                <IoChatbubbleEllipses className="w-5 h-5" />
                {/* Left edge indicator to suggest drawer */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-2 w-0.5 bg-[#00ffff]/70 rounded-full" />
              </div>
              <span className="text-[0.6rem] whitespace-nowrap">Chat</span>
            </button>
            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 text-red-500 hover:text-red-400 transition-colors"
            >
              {isLoggingOut ? (
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <BiLogOut className="w-5 h-5" />
              )}
              <span className="text-[0.6rem] whitespace-nowrap">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
