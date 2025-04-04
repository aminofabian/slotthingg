import Image from 'next/image';
import { Gamepad, Plus } from 'lucide-react';
import type { Game } from '@/lib/store/useGameStore';
import { useState, useEffect, useCallback } from 'react';

interface GameGridProps {
  userGames: Game[];
  onGameSelect: (game: Game) => void;
  onAddGameClick: () => void;
}

export default function GameGrid({ userGames, onGameSelect, onAddGameClick }: GameGridProps) {
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const totalImages = userGames.length;

  // Track image loading progress
  const handleImageLoad = useCallback(() => {
    setImagesLoaded(prev => prev + 1);
  }, []);

  // Reset counter when userGames changes
  useEffect(() => {
    setImagesLoaded(0);
  }, [userGames.length]);

  // Calculate loading progress
  const loadingProgress = Math.round((imagesLoaded / totalImages) * 100);
  const isInitialLoading = imagesLoaded < totalImages && totalImages > 0;

  return (
    <div className="w-full">
      <div className="max-w-none mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">My Games</h2>
          <button 
            onClick={onAddGameClick}
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

        {userGames.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 mb-4">No games available</p>
            <button 
              onClick={onAddGameClick}
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
                onClick={() => onGameSelect(game)}
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
  );
} 