import { useState, Fragment, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { 
  Gamepad2, 
  Plus, 
  X as CloseIcon, 
  RotateCw, 
  CircleMinus, 
  Gamepad
} from 'lucide-react';
import type { Game } from '@/lib/store/useGameStore';
import useGameStore from '@/lib/store/useGameStore';
import { toast } from 'react-hot-toast';
import RechargeModal from './RechargeModal';
import RedeemModal from './RedeemModal';
import PasswordChangeModal from './PasswordChangeModal';

interface UserGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
}

export default function UserGameModal({ isOpen, onClose, game }: UserGameModalProps) {
  const { games } = useGameStore();
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [resolvedGameId, setResolvedGameId] = useState<string>('');

  // Resolve game ID and fetch balance when modal opens
  useEffect(() => {
    if (isOpen && game) {
      // Try to find the game by code in the games list
      const matchedGame = games.find(g => g.code === game.code);
      
      if (matchedGame) {
        setResolvedGameId(matchedGame.id.toString());
      } else {
        // Try case insensitive match
        const caseInsensitiveMatch = games.find(g => 
          g.code.toLowerCase() === game.code.toLowerCase()
        );
        
        if (caseInsensitiveMatch) {
          setResolvedGameId(caseInsensitiveMatch.id.toString());
        } else {
          setResolvedGameId(game.id.toString());
        }
      }
    }
  }, [isOpen, game, games]);

  // Fetch balance whenever resolvedGameId changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!resolvedGameId) return;
      
      setIsLoadingBalance(true);
      try {
        let token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        if (!token) {
          const localStorageToken = localStorage.getItem('accessToken');
          if (localStorageToken) {
            token = localStorageToken;
          }
        }
        
        const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
        
        if (!whitelabel_admin_uuid || !token) {
          throw new Error('Authentication data missing. Please log in again.');
        }

        const response = await fetch('https://serverhub.biz/games/check-balance/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            whitelabel_admin_uuid,
            game_id: resolvedGameId
          })
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            return;
          }
          throw new Error('Failed to fetch balance');
        }
        
        const result = await response.json();
        if (result.status === 'success') {
          // Ensure balance is a number
          setBalance(typeof result.balance === 'string' ? parseFloat(result.balance) : result.balance);
        } else {
          throw new Error(result.message || 'Failed to fetch balance');
        }
      } catch (err) {
        console.error('Error fetching balance:', err);
        toast.error(err instanceof Error ? err.message : 'Failed to fetch balance');
        setBalance(null);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    if (isOpen) {
      fetchBalance();
    }
  }, [resolvedGameId, isOpen]);

  // Prepare image path on the client side only
  const [imagePath, setImagePath] = useState<string>('');
  useEffect(() => {
    setImagePath(`/Game Logos/games/${game.code === 'gameroom' ? 'GAME_ROOM' : game.code.toUpperCase()}.png`);
  }, [game.code]);

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
                        {imagePath && (
                          <Image
                            src={imagePath}
                            alt={`${game.title} logo`}
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div>
                        <Dialog.Title className="text-lg font-bold text-white">
                          {game.title}
                        </Dialog.Title>
                        <p className="text-[#00ffff] text-sm flex items-center gap-1">
                          Balance: {isLoadingBalance ? (
                            <span className="inline-flex items-center">
                              <svg className="animate-spin h-3 w-3 text-[#00ffff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </span>
                          ) : (
                            <span>${typeof balance === 'number' ? balance.toFixed(2) : '0.00'}</span>
                          )}
                        </p>
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