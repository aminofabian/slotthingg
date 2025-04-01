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
import useGameStore from '@/lib/store/useGameStore';
import type { Game } from '@/lib/store/useGameStore';
import { 
  Gamepad2, 
  Plus, 
  X as CloseIcon, 
  RotateCw, 
  CircleMinus, 
  Gamepad
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function GameActionModal({ isOpen, onClose, game }: { isOpen: boolean; onClose: () => void; game: Game }) {
  const { games, isRefreshing, fetchGames } = useGameStore();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find the game from the full games list
  useEffect(() => {
    const fullGameInfo = games.find(g => g.code === game.code);
    setSelectedGame(fullGameInfo || game);
  }, [game, games]);

  // Determine if this game is already in user's games
  const isUserGame = Boolean(game.game_user);

  const handleAddGame = async () => {
    if (!selectedGame) return;
    
    setIsAddingGame(true);
    setError(null);

    try {
      // Get token from multiple sources
      let token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      // If no token in cookies, try localStorage
      if (!token) {
        const localStorageToken = localStorage.getItem('accessToken');
        if (localStorageToken) {
          token = localStorageToken;
        }
      }

      // Get whitelabel_admin_uuid from localStorage
      const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
      const user_id = localStorage.getItem('user_id');

      if (!whitelabel_admin_uuid || !user_id || !token) {
        console.error('Missing auth data:', { 
          hasToken: !!token, 
          hasUUID: !!whitelabel_admin_uuid, 
          hasUserId: !!user_id 
        });
        throw new Error('Missing required authentication data. Please log in again.');
      }

      const response = await fetch('https://serverhub.biz/games/add-user-game/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          whitelabel_admin_uuid,
          user_id,
          game_id: selectedGame.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // If authentication error, redirect to login
        if (response.status === 401 || response.status === 403) {
          localStorage.clear();
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        
        throw new Error(errorData.message || 'Failed to add game');
      }

      // Refresh games list after successful addition
      await fetchGames();
      toast.success('Game added successfully!');
      onClose();
    } catch (err) {
      console.error('Error adding game:', err);
      setError(err instanceof Error ? err.message : 'Failed to add game');
    } finally {
      setIsAddingGame(false);
    }
  };

  if (!selectedGame) return null;

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
                      src={`/Game Logos/games/${selectedGame.code.toUpperCase()}.png`}
                      alt={selectedGame.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{selectedGame.title}</h3>
                    <div className="space-y-1">
                      {/* Game Status */}
                      <div className="flex items-center gap-2">
                        <p className="text-[#7ffdfd] text-sm">
                          Status: {selectedGame.game_status ? 'Active' : 'Inactive'}
                        </p>
                        {isRefreshing && (
                          <div className="animate-spin w-4 h-4 border-2 border-[#7ffdfd] border-t-transparent rounded-full" />
                        )}
                      </div>
                      {/* Game User if available */}
                      {selectedGame.game_user && (
                        <p className="text-[#7ffdfd] text-sm">User: {selectedGame.game_user}</p>
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

                {/* Game Details Section */}
                <div className="mb-6 space-y-3 bg-black/20 p-4 rounded-xl border border-[#7ffdfd]/10">
                  {/* Game Code */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#7ffdfd]/60 text-sm">Game Code:</span>
                    <span className="text-white font-medium">{selectedGame.code}</span>
                  </div>
                  {/* Owner */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#7ffdfd]/60 text-sm">Owner:</span>
                    <span className="text-white font-medium">{selectedGame.owner}</span>
                  </div>
                  {/* Allocation Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#7ffdfd]/60 text-sm">Allocated:</span>
                    <span className="text-white font-medium">
                      {new Date(selectedGame.allocated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Game Bonus */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#7ffdfd]/60 text-sm">Game Bonus:</span>
                    <span className="text-white font-medium">
                      {selectedGame.use_game_bonus ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  {isUserGame ? (
                    <>
                      {/* Recharge and Redeem Buttons for user games */}
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          className="flex items-center justify-center gap-2 p-4
                            bg-[#6f42c1] text-white rounded-xl text-lg font-medium
                            hover:bg-[#6f42c1]/80 transition-all duration-300
                            border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40"
                        >
                          <Plus className="w-5 h-5" />
                          Recharge
                        </button>
                        <button
                          className="flex items-center justify-center gap-2 p-4
                            bg-[#fd7e14] text-white rounded-xl text-lg font-medium
                            hover:bg-[#fd7e14]/80 transition-all duration-300
                            border border-[#7ffdfd]/20 hover:border-[#7ffdfd]/40"
                        >
                          <CircleMinus className="w-5 h-5" />
                          Redeem
                        </button>
                      </div>

                      {/* Play Now Button */}
                      <button 
                        className="w-full p-4 bg-gradient-to-r from-[#1a1f2d] to-[#2d3449]
                          text-[#7ffdfd] rounded-xl text-xl font-bold border border-[#7ffdfd]/30
                          hover:border-[#7ffdfd]/60 hover:from-[#1a1f2d]/90 hover:to-[#2d3449]/90
                          transition-all duration-300 flex items-center justify-center gap-3"
                      >
                        <Gamepad2 className="w-6 h-6" />
                        Play Now
                      </button>
                    </>
                  ) : (
                    /* Add Game Button for non-user games */
                    <button 
                      onClick={handleAddGame}
                      disabled={isAddingGame}
                      className="w-full p-4 bg-gradient-to-r from-[#1a1f2d] to-[#2d3449]
                        text-[#7ffdfd] rounded-xl text-xl font-bold border border-[#7ffdfd]/30
                        hover:border-[#7ffdfd]/60 hover:from-[#1a1f2d]/90 hover:to-[#2d3449]/90
                        transition-all duration-300 flex items-center justify-center gap-3
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingGame ? (
                        <>
                          <div className="w-6 h-6 border-2 border-[#7ffdfd] border-t-transparent rounded-full animate-spin" />
                          <span>Adding Game...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-6 h-6" />
                          <span>Add Game</span>
                        </>
                      )}
                    </button>
                  )}
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
  const { games, userGames, fetchGames, isLoading, error } = useGameStore();
  const [isGameSelectionOpen, setIsGameSelectionOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialFetchRef = useRef(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const totalImages = userGames.length;

  // Track image loading progress
  const handleImageLoad = useCallback(() => {
    setImagesLoaded(prev => prev + 1);
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('Current state:', {
      games: games.length,
      userGames: userGames.length,
      isLoading,
      error,
      isRefreshing,
      imagesLoaded,
      totalImages
    });
  }, [games, userGames, isLoading, error, isRefreshing, imagesLoaded, totalImages]);

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
        const updatedGame = userGames.find(g => g.id === game.id) || game;
        setSelectedGame(updatedGame);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleOpenGameSelection = async () => {
    console.log('Opening game selection modal...');
    console.log('Current games state:', {
      totalGames: games.length,
      userGameCodes: userGames.map(g => g.code),
      allGameCodes: games.map(g => g.code),
      availableGames: games.filter(game => !userGames.some(userGame => userGame.code === game.code)).length,
      isLoading,
      error
    });
    
    try {
      await fetchGames();
    } catch (error) {
      console.error('Error fetching games:', error);
    }
    
    setIsGameSelectionOpen(true);
  };

  // Show loading state only on initial load with loading skeleton
  if (isLoading && userGames.length === 0) {
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
        games={games.filter(game => !userGames.some(userGame => userGame.code === game.code))}
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
      {isInitialLoading && userGames.length > 0 && (
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
            <h2 className="text-2xl font-bold text-white">My Games</h2>
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

          {userGames.length === 0 ? (
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
              {userGames.map((game) => (
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
                      src={`/Game Logos/games/${game.code === 'gameroom' ? 'GAMEROOM' : game.code.toUpperCase()}.png`}
                      alt={game.title}
                      fill
                      quality={85}
                      className="object-contain drop-shadow-xl transition-all duration-300
                        group-hover:brightness-110
                        group-active:scale-95"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1536px) 16.67vw, 12.5vw"
                      priority={game.id <= 6}
                      loading={game.id <= 6 ? 'eager' : 'lazy'}
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
                        {game.title}
                      </p>
                      <div className="mt-2 flex justify-center
                        transform translate-y-4 group-hover:translate-y-0
                        transition-transform duration-300 delay-75">
                        <div className="px-5 py-1.5 rounded-full
                          bg-[#7ffdfd] 
                          text-[#1E1E30] text-sm font-medium
                          hover:bg-white transition-colors">
                          {game.game_status ? 'Play Now' : 'Coming Soon'}
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
    </div>
  );
}