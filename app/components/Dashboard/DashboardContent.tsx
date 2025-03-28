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
import { 
  Gamepad2, 
  Plus, 
  X as CloseIcon, 
  RotateCw, 
  CircleMinus, 
  Gamepad
} from 'lucide-react';

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
                    <CloseIcon className="w-5 h-5 text-white/60" />
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
                        <RotateCw className="w-4 h-4" />
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
                      <Plus className="w-6 h-6" />
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
                      <CircleMinus className="w-6 h-6" />
                      Redeem
                    </button>
                  </div>

                  {/* Utility Buttons */}
                

                  {/* Play Button */}
                  <button 
                    disabled={isRefreshing}
                    className="w-full p-4 bg-gradient-to-r from-[#7ffdfd]/20 to-[#7ffdfd]/10
                      text-[#7ffdfd] rounded-xl text-xl font-bold border border-[#7ffdfd]/30
                      hover:border-[#7ffdfd]/60 hover:from-[#7ffdfd]/30 hover:to-[#7ffdfd]/20
                      transition-all duration-300 flex items-center justify-center gap-3
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Gamepad2 className="w-6 h-6" />
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
        <div className="w-full">
          <div className="max-w-none mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
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
      <div className="w-full py-4">
        <div className="max-w-none mx-auto">
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
      <div className="w-full">
        <div className="max-w-none mx-auto">
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
                <Gamepad className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              {/* Button text */}
              <span className="relative">Add Game</span>

              {/* Small decorative plus icon */}
              <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center
                bg-[#003333]/10 rounded-md border border-[#003333]/10"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-300" />
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className="group relative bg-[#1E1E30]
                    rounded-3xl overflow-hidden
                    transition-all duration-300
                    hover:-translate-y-2
                    aspect-square
                    shadow-[0_0_20px_rgba(0,0,0,0.2)]
                    hover:shadow-[0_0_30px_rgba(127,253,253,0.2)]
                    border border-white/[0.08]
                    hover:border-[#7ffdfd]/20"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                    transition-all duration-500
                    bg-[radial-gradient(circle_at_50%_-20%,rgba(127,253,253,0.15),transparent_70%)]" />
                  
                  {/* Game Image Container */}
                  <div className="relative w-full h-full p-6 transition-transform duration-300
                    group-hover:scale-105">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      quality={85}
                      className="object-contain drop-shadow-xl transition-all duration-300
                        group-hover:brightness-110
                        group-active:scale-95"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1536px) 16.67vw, 12.5vw"
                      priority={game.id <= '6'}
                      loading={game.id <= '6' ? 'eager' : 'lazy'}
                      onLoad={handleImageLoad}
                      onError={handleImageLoad}
                    />
                  </div>

                  {/* Hover overlay with game name */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-all duration-300
                    bg-gradient-to-b from-black/40 via-transparent to-black/60">
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-white text-lg font-bold text-center
                        transform translate-y-4 group-hover:translate-y-0
                        transition-transform duration-300
                        drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        {game.name}
                      </p>
                      <div className="mt-2 flex justify-center
                        transform translate-y-4 group-hover:translate-y-0
                        transition-transform duration-300 delay-75">
                        <div className="px-5 py-1.5 rounded-full
                          bg-[#7ffdfd] 
                          text-[#1E1E30] text-sm font-medium
                          hover:bg-white transition-colors">
                          Play Now
                        </div>
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