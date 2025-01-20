'use client';

import Image from 'next/image';
import DashboardSlider from './DashboardSlider';
import { SiNintendogamecube } from 'react-icons/si';
import { FaTwitter, FaDiscord, FaTelegram, FaInstagram, FaTimes } from 'react-icons/fa';
import Logo from '../Logo/Logo';
import GameSelectionModal from './GameSelectionModal';
import { useState, Fragment } from 'react';
import Footer from '../Footer/Footer';
import { Dialog, Transition } from '@headlessui/react';

const games = [
  {
    id: 1,
    name: 'Golden Dragon',
    image: '/gameimages/4ed5620e-a0c5-4301-ab32-d585dd9c651e-GOLDEN DRAGON.png',
    gameId: 'M-436-343-056',
    entries: 0,
    active: true,
    balance: 0
  },
  {
    id: 2,
    name: 'Juwa',
    image: '/gameimages/0b94c78a-13f8-4819-90b7-5d34a0d1132f-JUWA.png',
    gameId: 'FK_aminof235',
    entries: 0,
    active: true,
    balance: 0
  },
  {
    id: 3,
    name: 'Ultra Panda',
    image: '/gameimages/ba5c4494-869d-4d69-acda-758cf1169c78-ULTRA PANDA.png',
    gameId: 'aminofabUP777',
    safe: 0,
    active: true,
    balance: 0
  },
  {
    id: 4,
    name: 'Panda Master',
    image: '/gameimages/14570bb3-0cc5-4bef-ba1b-1d1a4821e77b-PANDA MASTER.png',
    gameId: 'PM_aminofa235',
    safe: 0,
    active: true,
    balance: 0
  },
  {
    id: 5,
    name: 'Golden Treasure',
    image: '/gameimages/1f246c12-890f-40f9-b7c6-9b1a4e077169-GOLDEN TREASURE.png',
    gameId: 'GT_aminofa235',
    safe: 0,
    active: true,
    balance: 0
  },
  {
    id: 6,
    name: 'Orion Star',
    image: '/gameimages/2a8bd502-d191-48bd-831d-531a4751050a-ORION STAR.png',
    gameId: 'OS_aminofa235',
    safe: 0,
    active: true,
    balance: 0
  },
  {
    id: 7,
    name: 'V Blink',
    image: '/gameimages/9e9a9618-c490-44fa-943d-c2322c00f266-V BLINK.png',
    gameId: 'VB_aminofa235',
    safe: 0,
    active: true,
    balance: 0
  },
  {
    id: 8,
    name: 'Milky Way',
    image: '/gameimages/21ccf352-34a8-44a3-a94d-67b8cccc0959-MILKY WAY.png',
    gameId: 'MW_aminofa235',
    safe: 0,
    active: true,
    balance: 0
  }
];

interface GameActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: any;
}

function GameActionModal({ isOpen, onClose, game }: GameActionModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
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

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl 
                bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 shadow-xl 
                transition-all border border-[#7ffdfd]/20">
                {/* Game Info Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{game.name}</h3>
                    <p className="text-[#7ffdfd] text-sm">Balance: ${game.balance}</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <FaTimes className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {/* Add/Take Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 p-4
                      bg-[#6f42c1] text-white rounded-xl text-lg font-medium
                      hover:bg-[#6f42c1]/80 transition-all duration-300
                      border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                      </svg>
                      Add Funds
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4
                      bg-[#fd7e14] text-white rounded-xl text-lg font-medium
                      hover:bg-[#fd7e14]/80 transition-all duration-300
                      border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Take Funds
                    </button>
                  </div>

                  {/* Utility Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 p-4
                      text-[#7ffdfd] text-lg font-medium rounded-xl
                      border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40
                      hover:bg-[#7ffdfd]/5 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                    <button className="flex items-center justify-center gap-2 p-4
                      text-[#7ffdfd] text-lg font-medium rounded-xl
                      border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40
                      hover:bg-[#7ffdfd]/5 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Reset
                    </button>
                  </div>

                  {/* Play Button */}
                  <button className="w-full p-4 bg-gradient-to-r from-[#7ffdfd]/20 to-[#7ffdfd]/10
                    text-[#7ffdfd] rounded-xl text-xl font-bold border border-[#7ffdfd]/30
                    hover:border-[#7ffdfd]/60 hover:from-[#7ffdfd]/30 hover:to-[#7ffdfd]/20
                    transition-all duration-300 flex items-center justify-center gap-3">
                    <SiNintendogamecube className="w-6 h-6" />
                    Play Now
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default function DashboardContent() {
  const [isGameSelectionOpen, setIsGameSelectionOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const handleGameSelect = (game: any) => {
    // Handle game selection here
    console.log('Selected game:', game);
    // Add your logic to handle the selected game
  };

  const handleGameClick = (game: any) => {
    setSelectedGame(game);
    setIsActionModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full mx-auto pb-24 md:pb-6">
      <GameSelectionModal 
        isOpen={isGameSelectionOpen}
        onClose={() => setIsGameSelectionOpen(false)}
        games={games}
        onSelectGame={handleGameSelect}
      />

      {selectedGame && (
        <GameActionModal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          game={selectedGame}
        />
      )}

      {/* Slider Section */}
      <DashboardSlider />
      {/* Slider Section End */}

      {/* Updated Games Grid */}
      <div className="w-full px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Games</h2>
            <button 
              onClick={() => setIsGameSelectionOpen(true)}
              className="bg-[#00ffff] hover:bg-[#7ffdfd] text-[#003333] font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-[#00ffff]/20 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Game
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameClick(game)}
                className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 
                  rounded-xl overflow-hidden shadow-lg border border-[#7ffdfd]/20
                  hover:border-[#7ffdfd]/40 transition-all duration-300
                  [box-shadow:0_0_10px_rgba(127,253,253,0.1)]
                  hover:[box-shadow:0_0_15px_rgba(127,253,253,0.2)]
                  group text-left"
              >
                {/* Game Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={game.image}
                    alt={game.name}
                    fill
                    className="object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.67vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Game Info */}
                <div className="p-3">
                  <h3 className="text-sm font-bold text-white mb-1 truncate">
                    {game.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-[#7ffdfd] font-medium text-sm">
                      $ {game.balance}
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-[#7ffdfd] rounded-full animate-pulse"></div>
                      <span className="text-[#7ffdfd] text-xs">Active</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  );
}
