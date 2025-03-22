'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { BiMoney } from 'react-icons/bi';
import { MotionDiv } from '@/app/types/motion';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PurchaseOption {
  id: number;
  name: string;
  price: number;
  credits: number;
  description: string;
  isPopular?: boolean;
}

const purchaseOptions: PurchaseOption[] = [
  {
    id: 1,
    name: 'Starter',
    price: 10,
    credits: 1000,
    description: 'Perfect for getting started'
  },
  {
    id: 2,
    name: 'Popular',
    price: 25,
    credits: 3000,
    description: 'Most popular choice',
    isPopular: true
  },
  {
    id: 3,
    name: 'Pro',
    price: 50,
    credits: 7000,
    description: 'Best value for power users'
  }
];

const PurchaseModal = ({ isOpen, onClose }: PurchaseModalProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handlePurchase = async (optionId: number) => {
    // TODO: Implement purchase logic
    console.log('Purchase option:', optionId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 md:p-6 lg:p-8"
        >
          <MotionDiv
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-[#001a1a] to-[#002f2f] w-full max-h-[90vh] md:max-h-[80vh] rounded-2xl 
              shadow-2xl shadow-[#00ffff]/5 border border-[#00ffff]/10 
              overflow-hidden flex flex-col relative
              sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
          >
            {/* Purchase Header */}
            <div className="p-3 sm:p-4 border-b border-[#00ffff]/10 flex items-center justify-between 
              bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#00ffff]/10 
                  shadow-lg shadow-[#00ffff]/5 backdrop-blur-sm">
                  <BiMoney className="w-5 h-5 sm:w-6 sm:h-6 text-[#00ffff]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-white tracking-wide">Purchase Credits</h3>
                  <p className="text-xs sm:text-sm text-[#00ffff]/70 font-light">Select your package</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white 
                  transition-all duration-300 hover:rotate-90 active:scale-95"
              >
                <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Purchase Options */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 
              bg-gradient-to-b from-black/20 via-transparent to-transparent
              scrollbar-thin scrollbar-thumb-[#00ffff]/10 scrollbar-track-transparent">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {purchaseOptions.map((option) => (
                  <MotionDiv
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative rounded-xl p-4 border ${
                      selectedOption === option.id
                        ? 'border-[#00ffff] bg-[#00ffff]/10'
                        : 'border-[#00ffff]/20 bg-black/20'
                    } hover:border-[#00ffff]/50 transition-all duration-300 cursor-pointer
                    backdrop-blur-sm group`}
                    onClick={() => setSelectedOption(option.id)}
                  >
                    {option.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 
                        bg-[#00ffff] text-black text-xs font-medium px-3 py-1 rounded-full">
                        Popular
                      </div>
                    )}
                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-medium text-white">{option.name}</h4>
                      <div className="text-3xl font-bold text-[#00ffff]">
                        ${option.price}
                      </div>
                      <div className="text-white/70">{option.credits.toLocaleString()} Credits</div>
                      <p className="text-sm text-white/50">{option.description}</p>
                      <button
                        onClick={() => handlePurchase(option.id)}
                        className={`w-full py-2 px-4 rounded-lg ${
                          selectedOption === option.id
                            ? 'bg-[#00ffff] text-black font-medium'
                            : 'bg-[#00ffff]/10 text-[#00ffff] group-hover:bg-[#00ffff]/20'
                        } transition-all duration-300 mt-4`}
                      >
                        Select Package
                      </button>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </div>

            {/* Purchase Footer */}
            <div className="p-4 border-t border-[#00ffff]/10 
              bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm">
              <div className="text-center text-sm text-white/50">
                Secure payment processing powered by Stripe
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default PurchaseModal; 