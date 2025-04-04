import { useState, Fragment, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CircleMinus, X as CloseIcon } from 'lucide-react';
import type { Game } from '@/lib/store/useGameStore';
import useGameStore from '@/lib/store/useGameStore';
import { toast } from 'react-hot-toast';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
}

export default function RedeemModal({ isOpen, onClose, game }: RedeemModalProps) {
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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-xl 
                bg-[#1a1f2d] p-6 shadow-md transition-all focus:outline-none
                border border-white/5">
                <div className="space-y-5">                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <Dialog.Title className="text-lg font-medium text-white flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#fd7e14] rounded-md flex items-center justify-center">
                        <CircleMinus className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-medium">Redeem</span>
                        <span className="text-xs text-white/60 font-normal">Withdraw from <span className="text-white">{gameTitle || game.title}</span></span>
                      </div>
                    </Dialog.Title>
                    <button 
                      onClick={onClose}
                      className="p-1.5 rounded hover:bg-white/10 transition-colors focus:outline-none"
                      aria-label="Close dialog"
                    >
                      <CloseIcon className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  {error && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20" role="alert">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleRedeem} className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="redeem-amount" className="text-white/80 text-sm block">
                        Amount to Redeem
                      </label>
                      <div className="relative">
                        <input
                          ref={initialFocusRef}
                          id="redeem-amount"
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full p-2.5 pl-9 bg-black/20 text-white placeholder-white/30
                            rounded border border-white/10 focus:border-[#fd7e14]
                            focus:outline-none focus:ring-1 focus:ring-[#fd7e14] transition-colors"
                          required
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#fd7e14]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      
                      {amount && parseFloat(amount) > 0 && (
                        <div className="mt-2 py-1.5 px-3 bg-[#fd7e14]/10 rounded border border-[#fd7e14]/20 flex items-center justify-between">
                          <span className="text-xs text-white/80">Total to withdraw:</span>
                          <span className="font-medium text-sm text-[#fd7e14]">${parseFloat(amount).toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                      className="w-full p-2.5 bg-[#fd7e14] hover:bg-[#fd7e14]/90
                        text-white rounded text-base font-medium
                        transition-colors flex items-center justify-center gap-2
                        focus:outline-none focus:ring-2 focus:ring-[#fd7e14] focus:ring-offset-1
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CircleMinus className="w-4 h-4" />
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