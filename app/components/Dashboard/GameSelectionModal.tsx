'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';

// Define the Game type
export interface Game {
  id: string;
  name: string;
  image: string;
  gameId: string;
  entries: number;
  active: boolean;
  balance: number;
  safe?: number;
  fallbackImage: string;
}

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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl 
                bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 shadow-xl 
                transition-all border border-[#00ffff]/20">
                <Dialog.Title className="text-xl font-bold text-white mb-4 flex justify-between items-center">
                  Select a Game to Add
                  <button
                    onClick={onClose}
                    className="text-[#00ffff]/60 hover:text-[#00ffff] transition-colors"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="text-white mb-4">
                  Number of games: {games?.length || 0}
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
                          src={game.image}
                          alt={game.name}
                          fill
                          className="object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 group-hover:opacity-75 transition-opacity duration-300" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-base font-bold text-white text-center truncate mb-1">
                          {game.name}
                        </h3>
                        <p className="text-[#00ffff] text-xs text-center opacity-80">
                          {game.gameId}
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
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}