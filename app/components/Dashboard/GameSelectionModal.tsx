'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

interface Game {
  id: number;
  name: string;
  image: string;
  gameId: string;
  balance: number;
  active: boolean;
}

interface GameSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  onSelectGame: (game: Game) => void;
}

export default function GameSelectionModal({ 
  isOpen, 
  onClose, 
  games,
  onSelectGame 
}: GameSelectionModalProps) {
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl 
                bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 shadow-xl 
                transition-all border border-[#00ffff]/20">
                <Dialog.Title className="text-xl font-bold text-white mb-4 flex justify-between items-center">
                  Select a Game to Add
                  <button
                    onClick={onClose}
                    className="text-[#00ffff]/60 hover:text-[#00ffff] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Dialog.Title>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {games.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => {
                        onSelectGame(game);
                        onClose();
                      }}
                      className="group relative bg-black/40 rounded-lg overflow-hidden 
                        border border-[#00ffff]/10 hover:border-[#00ffff]/40 
                        transition-all duration-300"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={game.image}
                          alt={game.name}
                          fill
                          className="object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-sm font-bold text-white truncate">
                          {game.name}
                        </h3>
                        <p className="text-[#00ffff] text-xs mt-1">
                          ID: {game.gameId}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t border-[#00ffff]/10">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-[#00ffff]/70 hover:text-[#00ffff] 
                      font-medium rounded-lg transition-colors duration-300
                      hover:bg-[#00ffff]/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Add your logic for adding selected game
                      onClose();
                    }}
                    className="px-6 py-2 bg-[#00ffff] text-[#003333] font-bold 
                      rounded-lg transition-all duration-300
                      hover:bg-[#7ffdfd] shadow-lg 
                      hover:shadow-[#00ffff]/20"
                  >
                    Add Game
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