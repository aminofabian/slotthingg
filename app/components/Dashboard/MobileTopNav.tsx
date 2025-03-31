'use client';

import { useState, useEffect } from 'react';
import { BiMoney, BiWallet } from 'react-icons/bi';
import { GiDiamonds, GiStarsStack } from 'react-icons/gi';
import { MotionDiv } from '@/app/types/motion';

interface ProfileData {
  balance: string;
  winning_balance: string;
}

const MobileTopNav = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const stats = [
    { 
      label: 'Credits', 
      value: profileData ? `$${profileData.balance}` : '$0', 
      icon: BiMoney,
      symbol: '$',
      color: 'emerald'
    },
    { 
      label: 'Winnings', 
      value: profileData ? `$${profileData.winning_balance}` : '$0', 
      icon: BiWallet,
      symbol: '$',
      color: 'purple'
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'purple':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'blue':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-[#00ffff]/10 text-[#00ffff] border-[#00ffff]/20';
    }
  };

  return (
    <div className="sticky top-0 z-40 md:hidden">
      <div className="bg-gradient-to-b from-black via-gray-900/95 to-transparent backdrop-blur-xl">
        <div className="mx-4 pt-4">
          <nav className="bg-gradient-to-b from-gray-900 to-black border border-[#7ffdfd]/10 rounded-2xl shadow-lg shadow-black/20">
            <div className="p-2">
              <MotionDiv 
                className="flex items-center justify-between gap-1.5"
                layout
              >
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const colorClasses = getColorClasses(stat.color);

                  return (
                    <MotionDiv
                      key={stat.label}
                      className="flex-1 min-w-0"
                      layout
                    >
                      <MotionDiv
                        className={`
                          flex flex-col items-center justify-center gap-1 p-2 rounded-xl
                          border transition-all duration-200 ${colorClasses}
                        `}
                        layout
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`
                            flex items-center justify-center w-6 h-6 rounded-lg shrink-0
                            ${colorClasses} bg-opacity-20
                          `}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          
                          <MotionDiv
                            layout
                            className="text-xs font-bold truncate"
                          >
                            {isLoading ? (
                              <div className="h-5 w-16 bg-current/10 rounded animate-pulse" />
                            ) : (
                              stat.value
                            )}
                          </MotionDiv>
                        </div>

                        <MotionDiv
                          className="text-[10px] opacity-70 truncate text-center"
                        >
                          {stat.label}
                        </MotionDiv>
                      </MotionDiv>
                    </MotionDiv>
                  );
                })}
              </MotionDiv>
            </div>
          </nav>
        </div>
        <div className="h-4 bg-gradient-to-b from-transparent to-transparent" />
      </div>
    </div>
  );
};

export default MobileTopNav;
