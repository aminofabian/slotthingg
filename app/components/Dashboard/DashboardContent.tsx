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
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);

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
                          onClick={() => setIsPasswordChangeModalOpen(true)}
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

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordChangeModalOpen}
        onClose={() => setIsPasswordChangeModalOpen(false)}
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
      console.log('Games from store (Redeem):', games.map(g => ({
        id: g.id,
        code: g.code,
        title: g.title
      })));
      
      console.log('Trying to match game for redeem:', {
        id: game.id,
        code: game.code,
        title: game.title
      });
      
      // Try to find the game by code in the games list
      const matchedGame = games.find(g => g.code === game.code);
      
      if (matchedGame) {
        console.log('Found matching game in game list for redeem:', matchedGame);
        setGameTitle(matchedGame.title);
        setResolvedGameId(matchedGame.id.toString());
      } else {
        console.log('No exact match found for redeem, trying case insensitive match');
        // Try case insensitive match
        const caseInsensitiveMatch = games.find(g => 
          g.code.toLowerCase() === game.code.toLowerCase()
        );
        
        if (caseInsensitiveMatch) {
          console.log('Found case insensitive match for redeem:', caseInsensitiveMatch);
          setGameTitle(caseInsensitiveMatch.title);
          setResolvedGameId(caseInsensitiveMatch.id.toString());
        } else {
          console.warn('No matching game found in game list for redeem code:', game.code);
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

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Use the resolved game information
      const gameIdToUse = resolvedGameId || game.id.toString();
      const currentTitle = gameTitle || gameTitleRef.current || 'Unknown Game';
      
      console.log('Redeeming from game with resolved info:', {
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
        console.error('Missing auth data for redeem:', { 
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
      console.log('Sending redeem request with payload:', {
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
      
      const response = await fetch('https://serverhub.biz/games/redeem/', {
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
        throw new Error(errorData.message || 'Failed to redeem. Please try again.');
      }
      
      const result = await response.json();
      console.log('Redeem successful:', result);
      
      // Use message from the API response if available, otherwise use our fallback message
      const successMessage = result.message || `Successfully redeemed $${amount} from ${currentTitle}`;
      
      toast.success(successMessage);
      setAmount('');
      onClose();
    } catch (err) {
      console.error('Redeem error:', err);
      setError(err instanceof Error ? err.message : 'Failed to redeem. Please try again.');
      toast.error(err instanceof Error ? err.message : 'Failed to redeem. Please try again.');
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

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20" role="alert">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

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

function PasswordChangeModal({ isOpen, onClose, game }: { isOpen: boolean; onClose: () => void; game: Game }) {
  const { games } = useGameStore();
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const [resolvedGameId, setResolvedGameId] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  
  // Resolve game information when the modal opens
  useEffect(() => {
    if (isOpen && game) {
      console.log('Games from store (Password Change):', games.map(g => ({
        id: g.id,
        code: g.code,
        title: g.title
      })));
      
      console.log('Trying to match game for password change:', {
        id: game.id,
        code: game.code,
        title: game.title
      });
      
      // Try to find the game by code in the games list
      const matchedGame = games.find(g => g.code === game.code);
      
      if (matchedGame) {
        console.log('Found matching game in game list for password change:', matchedGame);
        setResolvedGameId(matchedGame.id.toString());
      } else {
        console.log('No exact match found for password change, trying case insensitive match');
        // Try case insensitive match
        const caseInsensitiveMatch = games.find(g => 
          g.code.toLowerCase() === game.code.toLowerCase()
        );
        
        if (caseInsensitiveMatch) {
          console.log('Found case insensitive match for password change:', caseInsensitiveMatch);
          setResolvedGameId(caseInsensitiveMatch.id.toString());
        } else {
          console.warn('No matching game found in game list for password change code:', game.code);
          // Fallback to the provided game
          setResolvedGameId(game.id.toString());
        }
      }
    }
  }, [isOpen, game, games]);

  // Check password strength when password changes
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(null);
      return;
    }
    
    // Simple password strength checker
    if (newPassword.length < 8) {
      setPasswordStrength('weak');
    } else if (
      newPassword.length >= 8 && 
      /[A-Z]/.test(newPassword) && 
      /[a-z]/.test(newPassword) && 
      /[0-9]/.test(newPassword)
    ) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  }, [newPassword]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Use the resolved game information
      const gameIdToUse = resolvedGameId || game.id.toString();
      const username = `user_${game.code.toLowerCase()}`; // User the same format as displayed in the UI
      
      console.log('Changing password for game with resolved info:', {
        originalId: game.id,
        resolvedId: gameIdToUse,
        gameTitle: game.title,
        username: username
      });
      
      let token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      if (!token) {
        const localStorageToken = localStorage.getItem('accessToken');
        if (localStorageToken) {
          token = localStorageToken;
        }
      }
      
      const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
      
      if (!whitelabel_admin_uuid || !token) {
        console.error('Missing auth data for password change:', { 
          hasToken: !!token, 
          hasUUID: !!whitelabel_admin_uuid
        });
        throw new Error('Authentication data missing. Please log in again.');
      }
      
      const payload = {
        whitelabel_admin_uuid: whitelabel_admin_uuid,
        game_id: gameIdToUse,
        username: username,
        password: newPassword
      };
      
      // More detailed payload logging (omit password for security)
      console.log('Sending password change request with payload:', {
        ...payload,
        password: '********', // Hide actual password in logs
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.substring(0, 10)}...`, // Log partial token for security
        }
      });
      
      const response = await fetch('https://serverhub.biz/games/change_password/', {
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
        throw new Error(errorData.message || 'Failed to change password. Please try again.');
      }
      
      const result = await response.json();
      console.log('Password change successful:', result);
      
      // Use message from the API response if available, otherwise use our fallback message
      const successMessage = result.message || `Password successfully changed for ${game.title}`;
      
      toast.success(successMessage);
      setNewPassword('');
      onClose();
    } catch (err) {
      console.error('Password change error:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
      toast.error(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
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
                bg-gradient-to-br from-[#1a1f2d] to-[#262f42]
                p-6 shadow-xl transition-all focus:outline-none
                border border-white/5 backdrop-blur-sm">
                <div className="space-y-6">
                  {/* Decorative elements */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[#00bbff]/20 blur-xl"></div>
                  <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-[#00bbff]/10 blur-lg"></div>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#00bbff] to-[#00ffff] rounded-lg flex items-center justify-center
                        shadow-lg shadow-[#00bbff]/20 transform -rotate-3">
                        <RotateCw className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg tracking-wide">Change Password</span>
                        <span className="text-xs text-[#00bbff]/80 font-normal">For {game.title}</span>
                      </div>
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
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 animate-pulse" role="alert">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-6 relative">
                    <div className="space-y-2">
                      <label htmlFor="new-password" className="text-[#00ffff] text-sm block flex items-center justify-between">
                        <span>New Password:</span>
                        {passwordStrength && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            passwordStrength === 'weak' ? 'bg-red-500/20 text-red-400' :
                            passwordStrength === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)} Password
                          </span>
                        )}
                      </label>
                      <div className="relative group">
                        <input
                          ref={initialFocusRef}
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-3 pl-10 pr-10 bg-black/30 text-white placeholder-white/40
                            rounded-lg border border-white/10 focus:border-[#00bbff]
                            focus:outline-none focus:ring-2 focus:ring-[#00bbff] transition-all duration-300
                            group-hover:border-white/20"
                          required
                          minLength={6}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#00bbff]/70">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white
                            focus:outline-none transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      {/* Password strength indicator */}
                      <div className="h-1 w-full bg-gray-200/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStrengthColor()} transition-all duration-500 ease-out ${getStrengthWidth()}`}
                        ></div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <p className="text-white/60 text-xs">
                          For a strong password:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${newPassword.length >= 8 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                            8+ chars
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${/[A-Z]/.test(newPassword) ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                            Uppercase
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${/[a-z]/.test(newPassword) ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                            Lowercase
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${/[0-9]/.test(newPassword) ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                            Number
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting || !newPassword || newPassword.length < 6}
                      className="w-full p-3 bg-gradient-to-r from-[#00bbff] to-[#00ffff] hover:from-[#00bbff]/90 hover:to-[#00ffff]/90
                        text-white rounded-xl text-lg font-bold
                        transition-all duration-300 flex items-center justify-center gap-2
                        focus:outline-none focus:ring-2 focus:ring-[#00bbff] focus:ring-offset-2 focus:ring-offset-[#1a1f2d]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        shadow-lg shadow-[#00bbff]/20 hover:shadow-[#00bbff]/30 transform hover:-translate-y-1"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <RotateCw className="w-5 h-5" />
                          <span>Change Password</span>
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