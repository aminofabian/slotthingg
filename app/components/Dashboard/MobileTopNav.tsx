'use client';

import { useState } from 'react';
import { BiMoney, BiWallet } from 'react-icons/bi';
import { GiDiamonds, GiStarsStack } from 'react-icons/gi';
import { motion } from 'framer-motion';

const stats = [
  { 
    label: 'Balance', 
    value: '$0', 
    icon: BiMoney,
    symbol: '$',
    color: 'emerald'
  },
  { 
    label: 'In Games', 
    value: '$0', 
    icon: BiWallet,
    symbol: '$',
    color: 'purple'
  },
  { 
    label: 'Diamonds', 
    value: '0', 
    icon: GiDiamonds,
    symbol: '💎',
    color: 'blue'
  },
  { 
    label: 'XP', 
    value: '500', 
    icon: GiStarsStack,
    symbol: '⭐',
    color: 'amber'
  },
];

const MobileTopNav = () => {
  const [expandedStat, setExpandedStat] = useState<number | null>(null);

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
              <div className="grid grid-cols-4 gap-1.5">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  const isExpanded = expandedStat === index;
                  const colorClasses = getColorClasses(stat.color);

                  return (
                    <motion.button
                      key={stat.label}
                      onClick={() => setExpandedStat(isExpanded ? null : index)}
                      className={`relative group ${isExpanded ? 'col-span-2' : ''}`}
                      layout
                    >
                      <div className={`
                        flex items-center justify-between gap-1.5 p-2 rounded-xl
                        border transition-all duration-200
                        ${isExpanded ? colorClasses : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'}
                      `}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`
                            flex items-center justify-center w-6 h-6 rounded-lg
                            ${isExpanded ? `${colorClasses} bg-opacity-20` : 'bg-gray-700/50'}
                          `}>
                            {isExpanded ? (
                              <span className="text-xs">{stat.symbol}</span>
                            ) : (
                              <Icon className={`w-3.5 h-3.5 ${isExpanded ? '' : 'text-gray-400'}`} />
                            )}
                          </div>
                          
                          <motion.p
                            layout
                            className={`
                              text-xs font-bold truncate
                              ${isExpanded ? '' : 'text-white'}
                            `}
                          >
                            {stat.value}
                          </motion.p>
                        </div>

                        {isExpanded && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] opacity-70"
                          >
                            {stat.label}
                          </motion.span>
                        )}
                      </div>
                    </motion.button>
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
