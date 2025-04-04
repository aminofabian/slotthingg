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

function UserGameModal({ isOpen, onClose, game }: { isOpen: boolean; onClose: () => void; game: Game }) {
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        initialFocus={initialFocusRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl 
                bg-[#1a1f2d] p-6 shadow-xl transition-all focus:outline-none">
                <div className="space-y-6">
                  {/* Header with Game Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={`/Game Logos/games/${game.code === 'gameroom' ? 'GAME_ROOM' : game.code.toUpperCase()}.png`}
                          alt={game.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <Dialog.Title className="text-lg font-bold text-white">
                          {game.title}
                        </Dialog.Title>
                        <p className="text-[#00ffff] text-sm">Balance: $0</p>
                      </div>
                    </div>
                    <button 
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                      aria-label="Close dialog"
                    >
                      <CloseIcon className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  {/* Credentials Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[#00ffff] text-sm">Username:</label>
                      <div className="p-3 bg-black/20 rounded-lg border border-white/10">
                        <p className="text-white">user_{game.code.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[#00ffff] text-sm">Password:</label>
                      <div className="p-3 bg-black/20 rounded-lg border border-white/10 flex justify-between items-center">
                        <p className="text-white">********</p>
                        <button 
                          className="text-[#00ffff] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ffff] rounded-lg p-1"
                          aria-label="Reset password"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        className="flex items-center justify-center gap-2 p-3
                          bg-[#6f42c1] text-white rounded-xl text-base font-medium
                          hover:bg-[#6f42c1]/80 transition-all duration-300
                          focus:outline-none focus:ring-2 focus:ring-[#6f42c1]"
                        onClick={() => setIsRechargeModalOpen(true)}
                      >
                        <Plus className="w-5 h-5" />
                        Recharge
                      </button>
                      <button
                        className="flex items-center justify-center gap-2 p-3
                          bg-[#fd7e14] text-white rounded-xl text-base font-medium
                          hover:bg-[#fd7e14]/80 transition-all duration-300
                          focus:outline-none focus:ring-2 focus:ring-[#fd7e14]"
                        onClick={() => setIsRedeemModalOpen(true)}
                      >
                        <CircleMinus className="w-5 h-5" />
                        Redeem
                      </button>
                    </div>

                    <button 
                      ref={initialFocusRef}
                      className="w-full p-3 bg-[#00ffff] hover:bg-[#00ffff]/90
                        text-[#1a1f2d] rounded-xl text-lg font-bold
                        transition-all duration-300 flex items-center justify-center gap-2
                        focus:outline-none focus:ring-2 focus:ring-[#00ffff] focus:ring-offset-2 focus:ring-offset-[#1a1f2d]"
                    >
                      <Gamepad2 className="w-5 h-5" />
                      Play Now
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
      
      {/* Recharge Modal */}
      <RechargeModal 
        isOpen={isRechargeModalOpen} 
        onClose={() => setIsRechargeModalOpen(false)} 
        game={game} 
      />
      
      {/* Redeem Modal */}
      <RedeemModal 
        isOpen={isRedeemModalOpen} 
        onClose={() => setIsRedeemModalOpen(false)} 
        game={game} 
      />
    </Transition>
  );
}

function RechargeModal({ isOpen, onClose, game }: { isOpen: boolean; onClose: () => void; game: Game }) {
  const { games } = useGameStore();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const [gameTitle, setGameTitle] = useState<string>('');
  const [resolvedGameId, setResolvedGameId] = useState<string>('');
  
  // Resolve game information when the modal opens
  useEffect(() => {
    if (isOpen && game) {
      console.log('Games from store:', games.map(g => ({
        id: g.id,
        code: g.code,
        title: g.title
      })));
      
      console.log('Trying to match game:', {
        id: game.id,
        code: game.code,
        title: game.title
      });
      
      // Try to find the game by code in the games list
      const matchedGame = games.find(g => g.code === game.code);
      
      if (matchedGame) {
        console.log('Found matching game in game list:', matchedGame);
        setGameTitle(matchedGame.title);
        setResolvedGameId(matchedGame.id.toString());
      } else {
        console.log('No exact match found, trying case insensitive match');
        // Try case insensitive match
        const caseInsensitiveMatch = games.find(g => 
          g.code.toLowerCase() === game.code.toLowerCase()
        );
        
        if (caseInsensitiveMatch) {
          console.log('Found case insensitive match:', caseInsensitiveMatch);
          setGameTitle(caseInsensitiveMatch.title);
          setResolvedGameId(caseInsensitiveMatch.id.toString());
        } else {
          console.warn('No matching game found in game list for code:', game.code);
          // Fallback to the provided game
          setGameTitle(game.title || 'Unknown Game');
          setResolvedGameId(game.id.toString());
        }
      }
    }
  }, [isOpen, game, games]);
  
  // Use a ref to keep a stable reference to the current title
  const gameTitleRef = useRef(game.title);
  useEffect(() => {
    gameTitleRef.current = game.title;
  }, [game.title]);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Use the resolved game information
      const gameIdToUse = resolvedGameId || game.id.toString();
      const currentTitle = gameTitle || gameTitleRef.current || 'Unknown Game';
      
      console.log('Recharging game with resolved info:', {
        originalId: game.id,
        resolvedId: gameIdToUse,
        originalTitle: game.title,
        resolvedTitle: currentTitle,
        originalCode: game.code
      });
      
      let token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      if (!token) {
        const localStorageToken = localStorage.getItem('accessToken');
        if (localStorageToken) {
          token = localStorageToken;
        }
      }
      
      const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
      const user_id = localStorage.getItem('user_id');
      
      if (!whitelabel_admin_uuid || !token) {
        console.error('Missing auth data:', { 
          hasToken: !!token, 
          hasUUID: !!whitelabel_admin_uuid, 
          hasUserId: !!user_id 
        });
        throw new Error('Authentication data missing. Please log in again.');
      }
      
      const payload = {
        amount: amount,
        whitelabel_admin_uuid: whitelabel_admin_uuid,
        game_id: gameIdToUse
      };
      
      // More detailed payload logging
      console.log('Sending recharge request with payload:', {
        ...payload,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.substring(0, 10)}...`, // Log partial token for security
        },
        gameInfo: {
          id: gameIdToUse,
          title: currentTitle,
          code: game.code
        }
      });
      
      const response = await fetch('https://serverhub.biz/games/recharge/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.clear();
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to recharge. Please try again.');
      }
      
      const result = await response.json();
      console.log('Recharge successful:', result);
      
      // Use message from the API response if available, otherwise use our fallback message
      const successMessage = result.message || `Successfully recharged $${amount} to ${currentTitle}`;
      
      toast.success(successMessage);
      setAmount('');
      onClose();
    } catch (err) {
      console.error('Recharge error:', err);
      setError(err instanceof Error ? err.message : 'Failed to recharge. Please try again.');
      toast.error(err instanceof Error ? err.message : 'Failed to recharge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        initialFocus={initialFocusRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl 
                bg-[#1a1f2d] p-6 shadow-xl transition-all focus:outline-none">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#6f42c1] rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      Recharge {game.title}
                    </Dialog.Title>
                    <button 
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                      aria-label="Close dialog"
                    >
                      <CloseIcon className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20" role="alert">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleRecharge} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="recharge-amount" className="text-[#00ffff] text-sm block">
                        Amount to Recharge:
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">$</span>
                        <input
                          ref={initialFocusRef}
                          id="recharge-amount"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full p-3 pl-8 bg-black/20 text-white placeholder-white/40
                            rounded-lg border border-white/10 focus:border-[#6f42c1]
                            focus:outline-none focus:ring-2 focus:ring-[#6f42c1]"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                      className="w-full p-3 bg-[#6f42c1] hover:bg-[#6f42c1]/90
                        text-white rounded-xl text-lg font-bold
                        transition-all duration-300 flex items-center justify-center gap-2
                        focus:outline-none focus:ring-2 focus:ring-[#6f42c1] focus:ring-offset-2 focus:ring-offset-[#1a1f2d]
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span>Confirm Recharge</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function RedeemModal({ isOpen, onClose, game }: { isOpen: boolean; onClose: () => void; game: Game }) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      // Here you would implement the actual redeem logic
      console.log(`Redeeming ${amount} from game ${game.title}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Successfully redeemed $${amount}`);
      onClose();
    } catch (error) {
      toast.error('Failed to redeem. Please try again.');
      console.error('Redeem error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        initialFocus={initialFocusRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl 
                bg-[#1a1f2d] p-6 shadow-xl transition-all focus:outline-none">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#fd7e14] rounded-lg flex items-center justify-center">
                        <CircleMinus className="w-5 h-5 text-white" />
                      </div>
                      Redeem from {game.title}
                    </Dialog.Title>
                    <button 
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                      aria-label="Close dialog"
                    >
                      <CloseIcon className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  <form onSubmit={handleRedeem} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="redeem-amount" className="text-[#00ffff] text-sm block">
                        Amount to Redeem:
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">$</span>
                        <input
                          ref={initialFocusRef}
                          id="redeem-amount"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full p-3 pl-8 bg-black/20 text-white placeholder-white/40
                            rounded-lg border border-white/10 focus:border-[#fd7e14]
                            focus:outline-none focus:ring-2 focus:ring-[#fd7e14]"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                      className="w-full p-3 bg-[#fd7e14] hover:bg-[#fd7e14]/90
                        text-white rounded-xl text-lg font-bold
                        transition-all duration-300 flex items-center justify-center gap-2
                        focus:outline-none focus:ring-2 focus:ring-[#fd7e14] focus:ring-offset-2 focus:ring-offset-[#1a1f2d]
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CircleMinus className="w-5 h-5" />
                          <span>Confirm Redeem</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function GameActionModal({ isOpen, onClose, game }: { isOpen: boolean; onClose: () => void; game: Game }) {
  const { games, isRefreshing, fetchGames } = useGameStore();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Log all available games and their codes
    console.log('Available games:', games.map(g => ({ id: g.id, code: g.code, title: g.title })));
    console.log('Selected game:', { id: game.id, code: game.code, title: game.title });

    // Try to find the game by ID first, then by code
    const gameById = games.find(g => g.id === game.id);
    if (gameById) {
      console.log('Found game by ID:', gameById);
      setSelectedGame(gameById);
      return;
    }

    // If not found by ID, try to find by normalizing the code
    const normalizedCode = game.code.toLowerCase().replace(/[^a-z0-9]/g, '');
    const gameByCode = games.find(g => {
      const currentCode = g.code.toLowerCase().replace(/[^a-z0-9]/g, '');
      return currentCode === normalizedCode;
    });

    if (gameByCode) {
      console.log('Found game by normalized code:', gameByCode);
      setSelectedGame(gameByCode);
      return;
    }

    // If still not found, use the original game
    console.log('Using original game as fallback');
    setSelectedGame(game);
  }, [game, games]);

  if (!selectedGame) return null;

  const handleAddGame = async () => {
    if (!selectedGame) return;
    
    // Log the game being added
    console.log('Adding game:', {
      id: selectedGame.id,
      code: selectedGame.code,
      title: selectedGame.title
    });
    
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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        initialFocus={initialFocusRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl 
                bg-[#1a1f2d] p-6 shadow-xl transition-all focus:outline-none">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image
                          src={`/Game Logos/games/${selectedGame.code === 'gameroom' ? 'GAME_ROOM' : selectedGame.code.toUpperCase()}.png`}
                          alt={selectedGame.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <Dialog.Title className="text-lg font-bold text-white">
                        {selectedGame.title}
                      </Dialog.Title>
                    </div>
                    <button 
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                      aria-label="Close dialog"
                    >
                      <CloseIcon className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20" role="alert">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button 
                    ref={initialFocusRef}
                    onClick={handleAddGame}
                    disabled={isAddingGame}
                    className="w-full p-3 bg-[#00ffff] hover:bg-[#00ffff]/90
                      text-[#1a1f2d] rounded-xl text-lg font-bold
                      transition-all duration-300 flex items-center justify-center gap-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-[#00ffff] focus:ring-offset-2 focus:ring-offset-[#1a1f2d]"
                  >
                    {isAddingGame ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#1a1f2d] border-t-transparent rounded-full animate-spin" />
                        <span>Adding Game...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Add Game</span>
                      </>
                    )}
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
  const { games, userGames, fetchGames, isLoading, error } = useGameStore();
  const [isGameSelectionOpen, setIsGameSelectionOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isFromUserGames, setIsFromUserGames] = useState(false);
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

  const handleGameSelect = async (game: Game, fromUserGames: boolean = false) => {
    console.log('Selected game:', game, 'from user games:', fromUserGames);
    setSelectedGame(game);
    setIsFromUserGames(fromUserGames);
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
        onSelectGame={(game) => handleGameSelect(game, false)}
      />

      {/* Use different modals based on where the game is from */}
      {selectedGame && (
        isFromUserGames ? (
          <UserGameModal
            isOpen={isActionModalOpen}
            onClose={() => setIsActionModalOpen(false)}
            game={selectedGame}
          />
        ) : (
          <GameActionModal
            isOpen={isActionModalOpen}
            onClose={() => setIsActionModalOpen(false)}
            game={selectedGame}
          />
        )
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
                  onClick={() => handleGameSelect(game, true)}
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
                      src={`/Game Logos/games/${game.code === 'gameroom' ? 'GAME_ROOM' : game.code.toUpperCase()}.png`}
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