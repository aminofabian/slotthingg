import { useState, Fragment, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, X as CloseIcon } from 'lucide-react';
import type { Game } from '@/lib/store/useGameStore';
import useGameStore from '@/lib/store/useGameStore';
import { toast } from 'react-hot-toast';

interface GameActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
}

export default function GameActionModal({ isOpen, onClose, game }: GameActionModalProps) {
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