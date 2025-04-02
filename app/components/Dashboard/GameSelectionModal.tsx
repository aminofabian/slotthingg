'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import type { Game } from '@/lib/store/useGameStore';

// Define the component props
export interface GameSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onSelectGame: (game: Game) => void;
}

// GameSelectionModal component
export default function GameSelectionModal({ 
  isOpen, 
  onClose, 
  games,
  onSelectGame 
}: GameSelectionModalProps) {
  console.log('GameSelectionModal games:', games); // Debug log

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-black p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-2xl font-bold text-white">
                    Select a Game
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <FaTimes className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-4">
                  {games?.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => {
                        console.log('Selecting game:', game);
                        onSelectGame(game);
                        onClose();
                      }}
                      className="group relative bg-black/40 rounded-xl overflow-hidden 
                        border-2 border-[#00ffff]/20 hover:border-[#00ffff] 
                        transition-all duration-300 shadow-lg hover:shadow-[#00ffff]/20
                        transform hover:-translate-y-1"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={`/Game Logos/games/${game.code === 'gameroom' ? 'GAME_ROOM' : game.code.toUpperCase()}.png`}
                          alt={game.title}
                          fill
                          className="object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 group-hover:opacity-75 transition-opacity duration-300" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-base font-bold text-white text-center truncate mb-1">
                          {game.title}
                        </h3>
                        <p className="text-[#00ffff] text-xs text-center opacity-80">
                          {game.code}
                        </p>
                      </div>
                      {game.coming_soon && (
                        <div className="absolute top-2 right-2 bg-[#00ffff] text-black text-xs font-bold px-2 py-1 rounded">
                          Coming Soon
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}