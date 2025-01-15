'use client';

import { useState } from 'react';
import { BiMoney } from 'react-icons/bi';
import { GiTakeMyMoney, GiDiamonds, GiStarsStack } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';

const stats = [
  { label: 'Balance', value: '$0', icon: BiMoney },
  { label: 'In Games', value: '$0', icon: GiTakeMyMoney },
  { label: 'Diamonds', value: '0', icon: GiDiamonds },
  { label: 'XP', value: '500', icon: GiStarsStack },
];

const MobileTopNav = () => {
  const [expandedStat, setExpandedStat] = useState<number | null>(null);

  return (
    <div className="sticky top-0 z-40 md:hidden">
      <div className="bg-gradient-to-b from-black via-gray-900/95 to-transparent backdrop-blur-xl">
        <div className="mx-4 pt-4">
          <nav className="bg-gradient-to-b from-gray-900 to-black border border-[#7ffdfd]/10 rounded-2xl shadow-lg shadow-black/20">
            <div className="p-3">
              <div className="grid grid-cols-4 gap-2">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const isExpanded = expandedStat === index;

                  return (
                    <button
                      key={stat.label}
                      onClick={() => setExpandedStat(isExpanded ? null : index)}
                      className={`relative group ${
                        isExpanded ? 'col-span-2' : ''
                      } transition-all duration-300`}
                    >
                      <div className={`
                        flex items-center gap-2 p-2 rounded-xl
                        ${isExpanded 
                          ? 'bg-[#00ffff]/10 border-[#00ffff]/20' 
                          : 'bg-gray-800/50 border-gray-700/50 group-hover:bg-gray-800'
                        }
                        border transition-all duration-200
                      `}>
                        <div className={`
                          p-2 rounded-lg
                          ${isExpanded 
                            ? 'bg-[#00ffff]/20' 
                            : 'bg-gray-700/50'
                          }
                        `}>
                          <Icon className={`
                            w-4 h-4 transition-colors
                            ${isExpanded 
                              ? 'text-[#00ffff]' 
                              : 'text-gray-400 group-hover:text-[#7ffdfd]'
                            }
                          `} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`
                              text-xs font-medium truncate
                              ${isExpanded 
                                ? 'text-[#00ffff]' 
                                : 'text-gray-400'
                              }
                            `}>
                              {stat.label}
                            </p>
                            <p className={`
                              text-sm font-bold truncate
                              ${isExpanded 
                                ? 'text-[#00ffff]' 
                                : 'text-white group-hover:text-[#7ffdfd]'
                              }
                            `}>
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
        <div className="h-4 bg-gradient-to-b from-transparent to-transparent" />
      </div>
    </div>
  );
};

export default MobileTopNav;
