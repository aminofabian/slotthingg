'use client';

import Image from 'next/image';
import DashboardSlider from './DashboardSlider';
import { SiNintendogamecube } from 'react-icons/si';
import { FaTwitter, FaDiscord, FaTelegram, FaInstagram, FaTimes } from 'react-icons/fa';
import Logo from '../Logo/Logo';
import GameSelectionModal from './GameSelectionModal';
import { useState, Fragment, useEffect, useRef, useCallback } from 'react';
import Footer from '../Footer/Footer';
import { Dialog, Transition } from '@headlessui/react';
import useGameStore, { getDefaultGames } from '@/lib/store/useGameStore';
import type { Game } from '@/lib/store/useGameStore';

const initialGames = getDefaultGames();

function GameActionModal({ isOpen, onClose, game }: { isOpen: boolean; onClose: () => void; game: Game }) {
  const { isRefreshing } = useGameStore();
  
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
                    <div className="space-y-1">
                      {/* Balance with refresh indicator */}
                      <div className="flex items-center gap-2">
                        <p className="text-[#7ffdfd] text-sm">Balance: ${game.balance}</p>
                        {isRefreshing && (
                          <div className="animate-spin w-4 h-4 border-2 border-[#7ffdfd] border-t-transparent rounded-full" />
                        )}
                      </div>
                      {/* Safe Balance if available */}
                      {game.safe !== undefined && (
                        <p className="text-[#7ffdfd] text-sm">Safe Balance: ${game.safe}</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <FaTimes className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Credentials Section */}
                <div className="mb-6 space-y-3 bg-black/20 p-4 rounded-xl border border-[#7ffdfd]/10">
                  {/* Username */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#7ffdfd]/60 text-sm">Username:</span>
                    <span className="text-white font-medium">{game.username}</span>
                  </div>
                  {/* Password with Reset Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#7ffdfd]/60 text-sm">Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{game.password}</span>
                      <button 
                        className="p-1.5 rounded-lg hover:bg-[#7ffdfd]/10 transition-colors
                          text-[#7ffdfd]/60 hover:text-[#7ffdfd]"
                        disabled={isRefreshing}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                          stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" 
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {/* Recharge/Redeem Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      disabled={isRefreshing}
                      className="flex items-center justify-center gap-2 p-4
                        bg-[#6f42c1] text-white rounded-xl text-lg font-medium
                        hover:bg-[#6f42c1]/80 transition-all duration-300
                        border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                      </svg>
                      Recharge
                    </button>
                    <button 
                      disabled={isRefreshing}
                      className="flex items-center justify-center gap-2 p-4
                        bg-[#fd7e14] text-white rounded-xl text-lg font-medium
                        hover:bg-[#fd7e14]/80 transition-all duration-300
                        border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Redeem
                    </button>
                  </div>

                  {/* Utility Buttons */}
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      disabled={isRefreshing}
                      className="flex items-center justify-center gap-2 p-4
                        text-[#7ffdfd] text-lg font-medium rounded-xl
                        border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40
                        hover:bg-[#7ffdfd]/5 transition-all duration-300
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Reset
                    </button>
                  </div>

                  {/* Play Button */}
                  <button 
                    disabled={isRefreshing}
                    className="w-full p-4 bg-gradient-to-r from-[#7ffdfd]/20 to-[#7ffdfd]/10
                      text-[#7ffdfd] rounded-xl text-xl font-bold border border-[#7ffdfd]/30
                      hover:border-[#7ffdfd]/60 hover:from-[#7ffdfd]/30 hover:to-[#7ffdfd]/20
                      transition-all duration-300 flex items-center justify-center gap-3
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
  const { games, fetchGames, isLoading, error } = useGameStore();
  const [isGameSelectionOpen, setIsGameSelectionOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialFetchRef = useRef(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const totalImages = games.length;

  // Track image loading progress
  const handleImageLoad = useCallback(() => {
    setImagesLoaded(prev => prev + 1);
  }, []);

  // Fetch games only on first mount
  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      console.log('Initial games fetch...');
      fetchGames();
    }
  }, []); // Empty dependency array

  const handleGameSelect = async (game: Game) => {
    console.log('Selected game:', game);
    setSelectedGame(game);
    setIsActionModalOpen(true);
    setIsGameSelectionOpen(false);
    
    // Only refresh if not already refreshing
    if (!isRefreshing) {
      setIsRefreshing(true);
      try {
        await fetchGames();
        // Update the selected game with fresh data
        const updatedGame = games.find(g => g.id === game.id) || game;
        setSelectedGame(updatedGame);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleOpenGameSelection = () => {
    console.log('Opening game selection modal. Current games:', games);
    setIsGameSelectionOpen(true);
  };

  // Show loading state only on initial load with loading skeleton
  if (isLoading && games === initialGames) {
    return (
      <div className="min-h-screen w-full mx-auto pb-24 md:pb-6">
        <div className="w-full px-6">
          <div className="max-w-[1440px] mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 
                    rounded-xl overflow-hidden shadow-lg border border-[#7ffdfd]/20
                    animate-pulse"
                >
                  <div className="aspect-square bg-gray-800" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-2/3" />
                    <div className="h-4 bg-gray-800 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate loading progress
  const loadingProgress = Math.round((imagesLoaded / totalImages) * 100);
  const isInitialLoading = imagesLoaded < totalImages;

  return (
    <div className="min-h-screen w-full mx-auto pb-24 md:pb-6">
      {/* Add Game Button */}
      <div className="w-full px-6 py-4">
        <div className="max-w-[1440px] mx-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Game Selection Modal */}
      <GameSelectionModal 
        isOpen={isGameSelectionOpen}
        onClose={() => setIsGameSelectionOpen(false)}
        games={games}
        onSelectGame={handleGameSelect}
      />

      {/* Game Action Modal */}
      {selectedGame && (
        <GameActionModal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          game={selectedGame}
        />
      )}

      {/* Loading Progress Indicator */}
      {isInitialLoading && (
        <div className="fixed inset-x-0 top-0 z-50">
          <div className="bg-[#7ffdfd]/10 h-1">
            <div 
              className="bg-[#7ffdfd] h-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
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
              className="relative group overflow-hidden
                bg-gradient-to-r from-[#00ffff]/80 to-[#00ffff] 
                hover:from-[#00ffff] hover:to-[#7ffdfd]
                text-[#003333] font-bold py-2 sm:py-3 px-3 sm:px-5 rounded-xl
                transition-all duration-300 flex items-center gap-2 sm:gap-3
                shadow-lg shadow-[#00ffff]/20 hover:shadow-[#00ffff]/40
                border border-[#00ffff]/20 hover:border-[#00ffff]/40
                transform hover:scale-105 text-sm sm:text-base"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent
                translate-x-[-100%] group-hover:translate-x-[100%] 
                transition-transform duration-1000" 
              />
              
              {/* Game controller icon */}
              <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center
                bg-[#003333]/10 rounded-lg border border-[#003333]/10"
              >
                <SiNintendogamecube className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              {/* Button text */}
              <span className="relative">Add Game</span>

              {/* Small decorative plus icon */}
              <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center
                bg-[#003333]/10 rounded-md border border-[#003333]/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
                  className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-300"
                >
                  <path fillRule="evenodd" 
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </button>
          </div>

          {games.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 mb-4">No games available</p>
              <button 
                onClick={() => setIsGameSelectionOpen(true)}
                className="bg-[#7ffdfd]/10 text-[#7ffdfd] px-6 py-2 rounded-lg hover:bg-[#7ffdfd]/20 transition"
              >
                Add Your First Game
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 
                    rounded-xl overflow-hidden shadow-lg border border-[#7ffdfd]/20
                    hover:border-[#7ffdfd]/40 transition-all duration-300
                    [box-shadow:0_0_10px_rgba(127,253,253,0.1)]
                    hover:[box-shadow:0_0_15px_rgba(127,253,253,0.2)]
                    group text-left"
                >
                  {/* Game Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-gray-900">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className="object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.67vw"
                      priority={game.id <= '6'} // Only prioritize first 6 images
                      onLoad={handleImageLoad}
                      onError={handleImageLoad} // Count failed loads too
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
          )}
        </div>
      </div>

      {/* Footer */}
    </div>
  );
}