import { useState, Fragment, useRef } from 'react';
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
import RechargeModal from './RechargeModal';
import RedeemModal from './RedeemModal';
import PasswordChangeModal from './PasswordChangeModal';

interface UserGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
}

export default function UserGameModal({ isOpen, onClose, game }: UserGameModalProps) {
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