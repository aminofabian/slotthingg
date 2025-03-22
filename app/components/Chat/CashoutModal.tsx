'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionDiv } from '@/app/types/motion';
import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { GiCash } from 'react-icons/gi';

interface CashoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CashoutModal = ({ isOpen, onClose }: CashoutModalProps) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const paymentMethods = [
    { id: 'bank', name: 'Bank Transfer', minAmount: 50 },
    { id: 'paypal', name: 'PayPal', minAmount: 20 },
    { id: 'crypto', name: 'Cryptocurrency', minAmount: 10 },
  ];

  const handleCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement cashout logic
    console.log('Cashout:', { amount, method: selectedMethod });
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
              sm:max-w-lg md:max-w-xl"
          >
            {/* Cashout Header */}
            <div className="p-3 sm:p-4 border-b border-[#00ffff]/10 flex items-center justify-between 
              bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#00ffff]/10 
                  shadow-lg shadow-[#00ffff]/5 backdrop-blur-sm">
                  <GiCash className="w-5 h-5 sm:w-6 sm:h-6 text-[#00ffff]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-white tracking-wide">Cashout</h3>
                  <p className="text-xs sm:text-sm text-[#00ffff]/70 font-light">Convert credits to cash</p>
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

            {/* Cashout Form */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6
              bg-gradient-to-b from-black/20 via-transparent to-transparent
              scrollbar-thin scrollbar-thumb-[#00ffff]/10 scrollbar-track-transparent">
              
              <form onSubmit={handleCashout} className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Amount to Cashout</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ffff]">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="10"
                      step="0.01"
                      className="w-full bg-white/5 border border-[#00ffff]/20 rounded-xl pl-8 pr-4 py-3
                        text-white placeholder-white/30
                        focus:border-[#00ffff]/40 focus:ring-2 focus:ring-[#00ffff]/20
                        transition-all duration-300 hover:border-[#00ffff]/30"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2">
                  <label className="text-sm text-white/70">Select Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 rounded-xl border ${
                          selectedMethod === method.id
                            ? 'border-[#00ffff] bg-[#00ffff]/10'
                            : 'border-[#00ffff]/20 bg-black/20'
                        } hover:border-[#00ffff]/50 transition-all duration-300
                        backdrop-blur-sm group text-left`}
                      >
                        <div className="text-white font-medium">{method.name}</div>
                        <div className="text-xs text-[#00ffff]/70">Min. ${method.minAmount}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!amount || !selectedMethod}
                  className="w-full py-3 px-4 rounded-xl bg-[#00ffff] text-black font-medium
                    hover:bg-[#00ffff]/90 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-300 active:scale-95 mt-4
                    disabled:hover:bg-[#00ffff]"
                >
                  Proceed to Cashout
                </button>
              </form>
            </div>

            {/* Cashout Footer */}
            <div className="p-4 border-t border-[#00ffff]/10 
              bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-sm">
              <div className="text-center text-sm text-white/50">
                Cashouts are typically processed within 24-48 hours
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default CashoutModal; 