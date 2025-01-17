'use client';

import { useState } from 'react';
import { FaGamepad, FaMoneyBillWave, FaHistory, FaSearch } from 'react-icons/fa';
import { BsCashStack, BsClockHistory, BsCalendar4, BsFilter, BsArrowLeft } from 'react-icons/bs';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

// Sample data - replace with your actual data structure
interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  method: string;
}

interface GameActivity {
  id: string;
  gameName: string;
  result: 'win' | 'loss';
  amount: number;
  date: Date;
  gameId: string;
  image: string;
}

const tabs = [
  { id: 'all', label: 'All Activity', icon: FaHistory },
  { id: 'games', label: 'Games', icon: FaGamepad },
  { id: 'transactions', label: 'Transactions', icon: FaMoneyBillWave },
];

export default function History() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add more sample data for better visualization
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 100,
      status: 'completed',
      date: new Date('2024-01-15'),
      method: 'Bitcoin'
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 50,
      status: 'pending',
      date: new Date('2024-01-14'),
      method: 'Litecoin'
    },
    {
      id: '3',
      type: 'deposit',
      amount: 200,
      status: 'completed',
      date: new Date('2024-01-13'),
      method: 'ACH Transfer'
    },
  ];

  const gameActivities: GameActivity[] = [
    {
      id: '1',
      gameName: 'Golden Dragon',
      result: 'win',
      amount: 50,
      date: new Date('2024-01-16'),
      gameId: 'GD-123',
      image: '/gameimages/1f246c12-890f-40f9-b7c6-9b1a4e077169-GOLDEN TREASURE.png'
    },
    {
      id: '2',
      gameName: 'Ultra Panda',
      result: 'loss',
      amount: 25,
      date: new Date('2024-01-15'),
      gameId: 'UP-456',
      image: '/gameimages/ba5c4494-869d-4d69-acda-758cf1169c78-ULTRA PANDA.png'
    },
    {
      id: '3',
      gameName: 'Milky Way',
      result: 'win',
      amount: 75,
      date: new Date('2024-01-14'),
      gameId: 'MW-789',
      image: '/gameimages/21ccf352-34a8-44a3-a94d-67b8cccc0959-MILKY WAY.png'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="w-full max-w-[1440px] mx-auto px-4 py-6">
        {/* Back to Dashboard Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 mb-6
            text-[#00ffff]/80 hover:text-[#00ffff] transition-all duration-300
            group rounded-lg hover:bg-[#00ffff]/5 border border-transparent
            hover:border-[#00ffff]/20"
        >
          <BsArrowLeft className="text-lg transition-transform duration-300 
            group-hover:-translate-x-1" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>

        {/* Header with Glow Effect */}
        <div className="relative mb-8">
          <div className="absolute -top-10 left-0 right-0 h-40 bg-[#00ffff]/5 blur-3xl rounded-full" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-white mb-2">Activity History</h1>
            <p className="text-[#00ffff]/60">Track your gaming and transaction history</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff]/40" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-[#00ffff]/20 rounded-lg px-4 py-2.5
                text-white placeholder-gray-400 focus:outline-none focus:border-[#00ffff]
                pl-12"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2.5 bg-[#00ffff]/10 text-[#00ffff] rounded-lg
              hover:bg-[#00ffff]/20 transition-colors flex items-center gap-2
              border border-[#00ffff]/20">
              <BsCalendar4 />
              Date Range
            </button>
            <button className="px-4 py-2.5 bg-[#00ffff]/10 text-[#00ffff] rounded-lg
              hover:bg-[#00ffff]/20 transition-colors flex items-center gap-2
              border border-[#00ffff]/20">
              <BsFilter />
              Filters
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Transactions', value: '$1,234', icon: FaMoneyBillWave },
            { label: 'Games Played', value: '42', icon: FaGamepad },
            { label: 'Win Rate', value: '68%', icon: BsClockHistory },
            { label: 'Total Winnings', value: '$890', icon: BsCashStack },
          ].map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-[#00ffff]/10 to-transparent 
              rounded-xl p-4 border border-[#00ffff]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#00ffff]/60 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#00ffff]/10 flex items-center justify-center">
                  <stat.icon className="text-[#00ffff] text-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#00ffff]/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium 
                transition-all duration-300 border-b-2 -mb-[2px] relative
                ${
                activeTab === tab.id
                  ? 'text-[#00ffff] border-[#00ffff]'
                  : 'text-gray-400 border-transparent hover:text-[#00ffff]/60'
                }`}
            >
              <tab.icon className="text-lg" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] 
                  bg-gradient-to-r from-transparent via-[#00ffff] to-transparent" />
              )}
            </button>
          ))}
        </div>

        {/* Enhanced Content */}
        <div className="space-y-6">
          {/* Transactions Section */}
          {(activeTab === 'all' || activeTab === 'transactions') && (
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 
              rounded-xl border border-[#00ffff]/10 overflow-hidden
              shadow-lg shadow-[#00ffff]/5">
              <div className="p-4 border-b border-[#00ffff]/10 bg-[#00ffff]/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BsCashStack className="text-[#00ffff]" />
                  Transactions
                </h2>
              </div>
              <div className="divide-y divide-[#00ffff]/10">
                {transactions.map((transaction) => (
                  <div key={transaction.id} 
                    className="p-4 hover:bg-[#00ffff]/5 transition-colors duration-300
                      cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center
                          ${transaction.type === 'deposit' 
                            ? 'bg-green-500/20' 
                            : 'bg-red-500/20'}`}>
                          {transaction.type === 'deposit' 
                            ? <FaMoneyBillWave className="text-green-500" />
                            : <BsCashStack className="text-red-500" />}
                        </div>
                        <div>
                          <p className="text-white font-medium flex items-center gap-2 group-hover:text-[#00ffff]
                            transition-colors">
                            {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                            <span className={`text-sm px-2 py-0.5 rounded-full ${
                              transaction.status === 'completed' 
                                ? 'bg-green-500/20 text-green-500'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                            }`}>
                              {transaction.status}
                            </span>
                          </p>
                          <p className="text-sm text-gray-400">
                            {format(transaction.date, 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-lg ${
                          transaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
                        </p>
                        <p className="text-sm text-[#00ffff]/60">{transaction.method}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Activities Section */}
          {(activeTab === 'all' || activeTab === 'games') && (
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 
              rounded-xl border border-[#00ffff]/10 overflow-hidden
              shadow-lg shadow-[#00ffff]/5">
              <div className="p-4 border-b border-[#00ffff]/10 bg-[#00ffff]/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaGamepad className="text-[#00ffff]" />
                  Game Activities
                </h2>
              </div>
              <div className="divide-y divide-[#00ffff]/10">
                {gameActivities.map((activity) => (
                  <div key={activity.id} 
                    className="p-4 hover:bg-[#00ffff]/5 transition-colors duration-300
                      cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#00ffff]/20 to-transparent" />
                          <Image
                            src={activity.image}
                            alt={activity.gameName}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-white font-medium group-hover:text-[#00ffff]
                            transition-colors">
                            {activity.gameName}
                          </p>
                          <p className="text-sm text-gray-400">
                            {format(activity.date, 'MMM dd, yyyy HH:mm')}
                          </p>
                          <p className="text-sm text-[#00ffff]/60">Game ID: {activity.gameId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-lg ${
                          activity.result === 'win' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {activity.result === 'win' ? '+' : '-'}${activity.amount}
                        </p>
                        <span className={`text-sm px-2 py-0.5 rounded-full ${
                          activity.result === 'win'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {activity.result === 'win' ? 'Won' : 'Lost'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 