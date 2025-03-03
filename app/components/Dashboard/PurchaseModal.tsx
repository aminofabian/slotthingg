'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBitcoin, FaCreditCard, FaApplePay, FaGooglePay } from 'react-icons/fa';
import { SiCashapp, SiLitecoin } from 'react-icons/si';
import { IoClose } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi';
import { TbBolt } from 'react-icons/tb';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = {
  id: string;
  title: string;
  icon: React.ReactNode;
  minAmount: number;
  maxAmount?: number;
  bonus?: number;
  icons?: React.ReactNode[];
};

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stripe',
    title: 'Stripe',
    icon: <FaCreditCard className="w-6 h-6" />,
    icons: [
      <FaCreditCard key="card" className="w-6 h-6" />,
      <FaApplePay key="apple" className="w-6 h-6" />,
      <FaGooglePay key="google" className="w-6 h-6" />
    ],
    minAmount: 10,
    maxAmount: 4000
  },
  {
    id: 'bitcoin-lightning',
    title: 'Bitcoin Lightning',
    icon: <TbBolt className="w-6 h-6" />,
    icons: [
      <FaBitcoin key="btc" className="w-6 h-6" />,
      <TbBolt key="lightning" className="w-6 h-6" />
    ],
    minAmount: 5,
    maxAmount: 1000
  },
  {
    id: 'bitcoin',
    title: 'Bitcoin',
    icon: <FaBitcoin className="w-6 h-6" />,
    minAmount: 20
  },
  {
    id: 'litecoin',
    title: 'Litecoin',
    icon: <SiLitecoin className="w-6 h-6" />,
    minAmount: 10
  },
  {
    id: 'cashapp',
    title: 'CASHAPP',
    icon: <SiCashapp className="w-6 h-6" />,
    minAmount: 10,
    maxAmount: 4000,
    bonus: 50
  }
];

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
            className="w-full max-w-md bg-[#0a0a0a] rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-white/10">
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
                <p className="text-2xl font-bold text-[#00ffff]">$0</p>
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
                        flex items-center gap-4 group relative
                        ${selectedMethod === method.id
                          ? 'bg-[#00ffff]/10 border-[#00ffff]/30'
                          : 'bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20'
                        }`}
                    >
                      {/* Icon */}
                      <div className="text-[#00ffff]">
                        {method.icons ? (
                          <div className="flex items-center gap-2">
                            {method.icons.map((icon, index) => (
                              <div key={index}>{icon}</div>
                            ))}
                          </div>
                        ) : (
                          method.icon
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{method.title}</p>
                        <p className="text-white/40 text-sm">
                          Min.${method.minAmount}
                          {method.maxAmount ? ` - Max. $${method.maxAmount}` : ''}
                        </p>
                      </div>

                      {/* Bonus Badge */}
                      {method.bonus && (
                        <div className="absolute top-2 right-2 bg-[#00ffff]/10 px-3 py-1 
                          rounded-full flex items-center gap-1.5">
                          <span className="text-[#00ffff] text-sm font-medium">
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
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-xl border border-white/10 
                  text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selectedMethod}
                className={`flex-1 py-3 px-6 rounded-xl
                  ${selectedMethod
                    ? 'bg-[#00ffff]/10 text-[#00ffff] hover:bg-[#00ffff]/20'
                    : 'bg-white/5 text-white/40 cursor-not-allowed'
                  }
                  border border-[#00ffff]/30
                  transition-all duration-200`}
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