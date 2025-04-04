'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardSlider from './DashboardSlider';
import GameSelectionModal from './GameSelectionModal';
import useGameStore from '@/lib/store/useGameStore';
import type { Game } from '@/lib/store/useGameStore';
import GameGrid from './GameGrid';
import { 
  UserGameModal,
  GameActionModal
} from './modals';

export default function DashboardContent() {
  const { games, userGames, fetchGames, isLoading, error } = useGameStore();
  const [isGameSelectionOpen, setIsGameSelectionOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isFromUserGames, setIsFromUserGames] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialFetchRef = useRef(false);

  // Debug logging for state changes
  useEffect(() => {
    console.log('Current state:', {
      games: games.length,
      userGames: userGames.length,
      isLoading,
      error,
      isRefreshing
    });
  }, [games, userGames, isLoading, error, isRefreshing]);

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

  return (
    <div className="min-h-screen w-full mx-auto pb-24 md:pb-6">
      {/* Error Message Display */}
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

      {/* Slider Section */}
      <DashboardSlider />

      {/* Games Grid */}
      <GameGrid 
        userGames={userGames}
        onGameSelect={(game) => handleGameSelect(game, true)}
        onAddGameClick={handleOpenGameSelection}
      />
    </div>
  );
}