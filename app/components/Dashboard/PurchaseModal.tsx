'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBitcoin, FaCreditCard, FaApplePay, FaGooglePay } from 'react-icons/fa';
import { SiCashapp } from 'react-icons/si';
import { IoClose } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi';

type PaymentMethod = {
  id: string;
  title: string;
  icons: React.ReactNode[];
  minAmount: number;
  maxAmount?: number;
  bonus?: number;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    title: 'VISA / Mastercard',
    icons: [<FaCreditCard key="card" className="w-6 h-6" />],
    minAmount: 10,
    maxAmount: 4000
  },
  {
    id: 'digital-wallet',
    title: 'Apple Pay / Google Pay',
    icons: [
      <FaApplePay key="apple" className="w-8 h-8" />,
      <FaGooglePay key="google" className="w-8 h-8" />
    ],
    minAmount: 10,
    maxAmount: 4000
  },
  {
    id: 'bitcoin',
    title: 'Bitcoin',
    icons: [<FaBitcoin key="bitcoin" className="w-6 h-6" />],
    minAmount: 20
  },
  {
    id: 'cashapp',
    title: 'CASHAPP',
    icons: [<SiCashapp key="cashapp" className="w-6 h-6" />],
    minAmount: 10,
    maxAmount: 4000,
    bonus: 50
  }
];

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseModal = ({ isOpen, onClose }: PurchaseModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-gradient-to-br from-gray-900 via-black to-gray-900 
              rounded-2xl overflow-hidden border border-[#7ffdfd]/20
              [box-shadow:0_0_15px_rgba(127,253,253,0.1)]"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-[#7ffdfd]/10">
              <h2 className="text-2xl font-bold text-white text-center">PURCHASE</h2>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 text-white/60 hover:text-white
                  rounded-lg hover:bg-white/5 transition-colors"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Current Balance */}
              <div className="mb-6 text-center">
                <p className="text-white/60 mb-1">Current balance:</p>
                <p className="text-2xl font-bold text-[#7ffdfd]">$0</p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <p className="text-white/80 text-center font-medium">
                  Choose your payment method:
                </p>
                <p className="text-white/40 text-sm text-center">
                  All purchases are processed automatically
                </p>

                <div className="space-y-3 mt-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full p-4 rounded-xl border transition-all duration-200
                        flex items-center gap-4 group relative overflow-hidden
                        ${selectedMethod === method.id
                          ? 'bg-[#7ffdfd]/10 border-[#7ffdfd]/30'
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04] hover:border-white/20'
                        }`}
                    >
                      {/* Icons */}
                      <div className="flex items-center gap-2">
                        {method.icons.map((icon, index) => (
                          <div key={index} className="text-[#7ffdfd]">
                            {icon}
                          </div>
                        ))}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium mb-1">{method.title}</p>
                        <p className="text-white/40 text-sm">
                          Min.${method.minAmount}
                          {method.maxAmount ? ` - Max. $${method.maxAmount}` : ''}
                        </p>
                      </div>

                      {/* Bonus Badge */}
                      {method.bonus && (
                        <div className="absolute top-2 right-2 bg-[#7ffdfd]/10 px-3 py-1 
                          rounded-full flex items-center gap-1.5 border border-[#7ffdfd]/20">
                          <HiSparkles className="w-4 h-4 text-[#7ffdfd]" />
                          <span className="text-[#7ffdfd] text-sm font-medium">
                            +{method.bonus}% BONUS
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#7ffdfd]/10 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-xl border border-white/10 
                  text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selectedMethod}
                className="flex-1 py-3 px-6 rounded-xl bg-[#7ffdfd]/10 text-[#7ffdfd]
                  border border-[#7ffdfd]/30 hover:bg-[#7ffdfd]/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200"
              >
                Next
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseModal; 