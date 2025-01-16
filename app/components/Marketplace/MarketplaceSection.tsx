'use client';
import { useState } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { BiMoney } from 'react-icons/bi';
import { FaTrophy, FaSpinner } from 'react-icons/fa';
import { GiPodiumWinner } from 'react-icons/gi';
import Link from 'next/link';
import RealMoneySection from './RealMoneySection';
import LevelUpSection from './LevelUpSection';
import WheelSpinsSection from './WheelSpinsSection';
import WeeklyDrawSection from './WeeklyDrawSection';

type Tab = 'real-money' | 'level-up' | 'wheel-spins' | 'weekly-draw';

const tabs = [
  {
    id: 'real-money',
    label: 'REAL MONEY',
    icon: BiMoney,
    color: 'text-[#00ffff]',
    borderColor: 'border-[#00ffff]',
    hoverBg: 'hover:bg-[#00ffff]/10'
  },
  {
    id: 'level-up',
    label: 'LEVEL UP',
    icon: FaTrophy,
    color: 'text-purple-400',
    borderColor: 'border-purple-400',
    hoverBg: 'hover:bg-purple-400/10'
  },
  {
    id: 'wheel-spins',
    label: 'WHEEL SPINS',
    icon: FaSpinner,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400',
    hoverBg: 'hover:bg-yellow-400/10'
  },
  {
    id: 'weekly-draw',
    label: 'WEEKLY DRAW',
    icon: GiPodiumWinner,
    color: 'text-green-400',
    borderColor: 'border-green-400',
    hoverBg: 'hover:bg-green-400/10'
  }
];

export default function MarketplaceSection() {
  const [activeTab, setActiveTab] = useState<Tab>('real-money');

  const renderContent = () => {
    switch (activeTab) {
      case 'real-money':
        return <RealMoneySection />;
      case 'level-up':
        return <LevelUpSection />;
      case 'wheel-spins':
        return <WheelSpinsSection />;
      case 'weekly-draw':
        return <WeeklyDrawSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#002222] pt-20 pb-24">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-lg border-b border-[#00ffff]/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-[#00ffff] hover:text-[#00ffff]/80 
                  transition-colors p-2 rounded-lg hover:bg-[#00ffff]/5"
              >
                <IoArrowBack className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="text-white/60 text-sm">
              Marketplace
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Tabs Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl border 
                transition-all duration-300 ${tab.hoverBg}
                ${activeTab === tab.id 
                  ? `${tab.color} ${tab.borderColor} bg-white/5` 
                  : 'text-white/60 border-white/10 hover:text-white'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-sm tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="min-h-[600px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 