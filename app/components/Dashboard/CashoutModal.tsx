'use client';

import { Fragment, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBitcoin, FaMoneyBillWave } from 'react-icons/fa';
import { SiLitecoin } from 'react-icons/si';
import { IoClose } from 'react-icons/io5';
import { BsCashStack, BsShieldCheck, BsInfoCircle } from 'react-icons/bs';
import { MotionDiv } from '@/app/types/motion';

interface CashoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

const paymentMethods = [
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    icon: <div className="group relative flex items-center justify-center w-6 h-6">
      <div className="absolute inset-0 bg-[#F7931A] blur-lg opacity-20 group-hover:opacity-30 transition-opacity rounded-full" />
      <FaBitcoin className="w-6 h-6 text-[#F7931A] relative z-10 group-hover:scale-110 transition-transform duration-200" />
    </div>,
    description: 'Fast & secure cryptocurrency payments'
  },
  { 
    id: 'ach', 
    name: 'ACH Transfer', 
    icon: <div className="group relative flex items-center justify-center w-6 h-6">
      <div className="absolute inset-0 bg-green-500 blur-lg opacity-20 group-hover:opacity-30 transition-opacity rounded-full" />
      <BsCashStack className="w-6 h-6 text-green-500 relative z-10 group-hover:scale-110 transition-transform duration-200" />
    </div>,
    description: 'Direct bank transfer (US only)'
  },
  { 
    id: 'litecoin', 
    name: 'Litecoin', 
    icon: <div className="group relative flex items-center justify-center w-6 h-6">
      <div className="absolute inset-0 bg-[#345D9D] blur-lg opacity-20 group-hover:opacity-30 transition-opacity rounded-full" />
      <SiLitecoin className="w-6 h-6 text-[#345D9D] relative z-10 group-hover:scale-110 transition-transform duration-200" />
    </div>,
    description: 'Lower fees, faster transactions'
  },
];

export default function CashoutModal({ isOpen, onClose, currentBalance }: CashoutModalProps) {
  const [step, setStep] = useState<'method' | 'details' | 'confirm'>('method');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [publicKey, setPublicKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the selected payment method object
  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);
  
  // Check if amount is valid
  const isAmountValid = typeof amount === 'number' && amount > 0;

  // Reset the modal state
  const resetModal = () => {
    setSelectedMethod(null);
    setAmount('');
    setPublicKey('');
    setError(null);
    setStep('method');
  };

  // Close modal and reset state
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Handle method selection
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep('details');
  };

  // Handle back button
  const handleBack = () => {
    setStep('method');
    setAmount('');
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setAmount('');
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setAmount(numValue);
      }
    }
  };

  // Handle cashout submission
  const handleCashout = async () => {
    if (!selectedPaymentMethod || !isAmountValid) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Add your cashout API call here
      console.log('Processing cashout:', {
        method: selectedMethod,
        amount,
        publicKey
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success handling
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <MotionDiv
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md mx-auto my-4 bg-[#0a0a0a] rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-4 sm:p-6">
              <div className="flex flex-col items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Cashout</h2>
                <p className="text-[#00ffff] text-sm mt-1">Request your withdrawal</p>
              </div>
              <button
                onClick={handleClose}
                className="absolute right-3 top-3 p-2 text-[#00ffff] hover:text-white
                  rounded-lg hover:bg-white/5 transition-colors"
              >
                <IoClose className="w-5 h-5" />
              </button>

              {/* Step Indicators */}
              <div className="mt-6 flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#1a2634]" />
                
                {/* Steps */}
                {['Method', 'Details', 'Confirm'].map((label, index) => {
                  const stepNumber = index + 1;
                  const isActive = (
                    (step === 'method' && stepNumber === 1) ||
                    (step === 'details' && stepNumber === 2) ||
                    (step === 'confirm' && stepNumber === 3)
                  );
                  const isPast = (
                    (step === 'details' && stepNumber === 1) ||
                    (step === 'confirm' && stepNumber <= 2)
                  );

                  return (
                    <div key={label} className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                        ${isActive ? 'bg-[#00ffff] text-black' : 
                          isPast ? 'bg-[#1a2634] text-[#00ffff]' : 
                          'bg-[#1a2634] text-gray-500'}`}>
                        {stepNumber}
                      </div>
                      <span className={`mt-2 text-xs
                        ${isActive ? 'text-[#00ffff]' : 
                          isPast ? 'text-white' : 
                          'text-gray-500'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Available Balance Card */}
              <div className="bg-[#0f1520] rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Available Balance</span>
                  <div className="w-6 h-6 text-[#00ffff]">
                    <FaMoneyBillWave className="w-full h-full" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  ${currentBalance.toFixed(2)}
                </div>
              </div>

              {step === 'method' && (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      className="w-full p-4 rounded-xl bg-[#0f1520] hover:bg-[#1a2634] 
                        transition-colors duration-200 flex items-center gap-4"
                    >
                      <div className="text-2xl">
                        {method.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-medium">{method.name}</h3>
                        <p className="text-gray-400 text-sm">{method.description}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                    </button>
                  ))}
                </div>
              )}

              {/* Next Button */}
              {step === 'method' && (
                <div className="mt-6">
                  <button
                    onClick={() => setStep('details')}
                    disabled={!selectedMethod}
                    className={`w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2
                      ${selectedMethod 
                        ? 'bg-[#00ffff] text-black hover:bg-[#00ffff]/90' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                      transition-colors duration-200 font-medium`}
                  >
                    Next
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Rest of the content for other steps */}
              {step !== 'method' && (
                // Amount Input Step
                <div className="mb-6 sm:mb-8">
                  <div className="bg-[#0f1520] border border-[#00ffff]/20 rounded-xl p-4 sm:p-5 shadow-lg shadow-[#00ffff]/5">
                    <div className="flex items-center gap-3 mb-4">
                      {selectedPaymentMethod?.icon}
                      <h3 className="text-lg sm:text-xl font-bold text-white">{selectedPaymentMethod?.name}</h3>
                    </div>
                    
                    <label htmlFor="amount" className="block text-white/90 text-center font-medium mb-2 sm:mb-3 text-base sm:text-lg">
                      Enter Amount
                    </label>
                    
                    <div className="relative mb-2">
                      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#00ffff]/10 text-[#00ffff] font-bold text-sm sm:text-base">
                        $
                      </div>
                      <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        className="w-full bg-black/40 border-2 border-[#00ffff]/20 rounded-xl py-3 sm:py-4 px-10 sm:px-14
                          text-white text-center text-lg sm:text-xl font-bold focus:outline-none focus:border-[#00ffff]/50
                          transition-all duration-200 hover:border-[#00ffff]/30"
                        placeholder="Enter amount"
                      />
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/60 text-xs sm:text-sm">
                        USD
                      </div>
                    </div>

                    {selectedPaymentMethod?.id === 'bitcoin' && (
                      <div className="mt-4">
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Bitcoin Address
                        </label>
                        <input
                          type="text"
                          value={publicKey}
                          onChange={(e) => setPublicKey(e.target.value)}
                          placeholder="Enter your Bitcoin address"
                          className="w-full bg-black/40 border border-[#00ffff]/20 rounded-lg px-4 py-3
                            text-white placeholder-gray-400 focus:outline-none focus:border-[#00ffff]/50
                            font-mono text-sm"
                        />
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-start gap-3 bg-[#00ffff]/5 p-3 rounded-lg">
                      <BsInfoCircle className="text-[#00ffff] text-lg flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-white/70">
                        Cashouts are processed within 24 hours. Minimum amount is $50.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs sm:text-sm text-center">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/10 flex gap-2 sm:gap-3">
              {step === 'method' ? (
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border border-white/10 
                    text-white hover:bg-white/5 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              ) : (
                <>
                  <button
                    onClick={handleBack}
                    className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border border-white/10 
                      text-white hover:bg-white/5 transition-colors text-sm sm:text-base"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCashout}
                    disabled={!isAmountValid || isProcessing || (selectedPaymentMethod?.id === 'bitcoin' && !publicKey)}
                    className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center
                      ${isAmountValid && !isProcessing && (selectedPaymentMethod?.id !== 'bitcoin' || publicKey)
                        ? 'bg-[#00ffff]/10 text-[#00ffff] hover:bg-[#00ffff]/20'
                        : 'bg-white/5 text-white/40 cursor-not-allowed'
                      }
                      border border-[#00ffff]/30
                      transition-all duration-200 text-sm sm:text-base
                      disabled:bg-white/5 disabled:text-white/40 disabled:cursor-not-allowed disabled:border-white/10`}
                  >
                    {isProcessing ? (
                      <span className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#00ffff]/30 border-t-[#00ffff] rounded-full animate-spin"></span>
                    ) : (
                      'Process Cashout'
                    )}
                  </button>
                </>
              )}
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
} 