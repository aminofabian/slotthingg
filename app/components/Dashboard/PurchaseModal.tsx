'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaBitcoin, FaCreditCard, FaApplePay, FaGooglePay } from 'react-icons/fa';
import { SiCashapp, SiLitecoin } from 'react-icons/si';
import { IoClose } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi';
import { TbBolt } from 'react-icons/tb';
import { FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { BiMoney } from 'react-icons/bi';
import { MotionDiv } from '@/app/types/motion';
import { BsLightningChargeFill } from 'react-icons/bs';
import Image from 'next/image';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = {
  id: string;
  apiValue?: string;
  title: string;
  icon: React.ReactNode;
  bonus?: number;
  icons?: React.ReactNode[];
  serviceIcons?: React.ReactNode[];
};

// Helper function to get cookie by name
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: 'bitcoin-lightning',
    apiValue: 'BTC-LN',
    title: 'Bitcoin Lightning',
    icon: <TbBolt className="w-6 h-6" />,
    icons: [
      <div key="btc-ln" className="relative group flex items-center justify-center w-6 h-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7931A] to-[#FFD700] blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
        <BsLightningChargeFill className="w-6 h-6 text-[#F7931A] relative z-10 group-hover:scale-110 transition-transform duration-200" />
      </div>
    ],
    serviceIcons: [
      <div key="cashapp" className="group relative px-2">
        <SiCashapp className="w-6 h-6 text-[#00D632] group-hover:scale-110 transition-all duration-200 group-hover:drop-shadow-[0_0_8px_rgba(0,214,50,0.5)]" />
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-black/90 text-white text-xs px-2 py-1 rounded-md
          opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap
          border border-white/10 backdrop-blur-sm">
          Cash App
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-transparent border-t-black/90"></div>
        </div>
      </div>,
      <div key="strike" className="group relative px-2">
        <div className="absolute inset-0 bg-white rounded-full blur opacity-10 group-hover:opacity-20 transition-opacity" />
        <div className="relative w-6 h-6 bg-white rounded-full overflow-hidden transform group-hover:scale-110 transition-transform duration-200">
          <Image
            src="/payment/Strike.jpg"
            alt="Strike"
            width={24}
            height={24}
            className="object-contain scale-150"
          />
        </div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-black/90 text-white text-xs px-2 py-1 rounded-md
          opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap
          border border-white/10 backdrop-blur-sm">
          Strike
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-transparent border-t-black/90"></div>
        </div>
      </div>
    ]
  },
  {
    id: 'bitcoin',
    apiValue: 'BTC-CHAIN',
    title: 'Bitcoin',
    icon: <div className="group relative flex items-center justify-center w-6 h-6">
      <div className="absolute inset-0 bg-[#F7931A] blur-lg opacity-20 group-hover:opacity-30 transition-opacity rounded-full" />
      <FaBitcoin className="w-6 h-6 text-[#F7931A] relative z-10 group-hover:scale-110 transition-transform duration-200" />
    </div>
  },
  {
    id: 'litecoin',
    apiValue: 'LTC-CHAIN',
    title: 'Litecoin',
    icon: <div className="group relative flex items-center justify-center w-6 h-6">
      <div className="absolute inset-0 bg-[#345D9D] blur-lg opacity-20 group-hover:opacity-30 transition-opacity rounded-full" />
      <SiLitecoin className="w-6 h-6 text-[#345D9D] relative z-10 group-hover:scale-110 transition-transform duration-200" />
    </div>
  }
];

const PurchaseModal = ({ isOpen, onClose }: PurchaseModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true);
  const [step, setStep] = useState<'method' | 'amount'>('method');
  const [profileData, setProfileData] = useState<{
    balance: string;
    cashable_balance: string;
    bonus_balance: string;
    full_name: string;
  } | null>(null);

  // Get the selected payment method object
  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);
  
  // Check if amount is valid
  const isAmountValid = typeof amount === 'number' && amount > 0;

  // Check authentication status first
  useEffect(() => {
    if (!isOpen) return;
    
    const checkAuthAndFetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (!response.ok) {
          // Clear auth data and redirect
          localStorage.clear();
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }

        // Fetch profile data only if authenticated
        await fetchProfileData();
      } catch (error) {
        console.error('Auth check error:', error);
        // Redirect on any error
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    };
    
    checkAuthAndFetchProfile();
  }, [isOpen]);

  // Fetch user profile data including balance
  const fetchProfileData = async () => {
    setIsLoadingBalance(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      setProfileData(data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      // Redirect on profile fetch error
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    } finally {
      setIsLoadingBalance(false);
    }
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

  // Process payment
  const handlePayment = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (!selectedPaymentMethod || !selectedPaymentMethod.apiValue || !isAmountValid) return;
    
    setIsProcessing(true);
    setError(null);
    
    // Show processing message
    toast.loading('Processing payment...', { id: 'payment-processing' });
    
    // Set a timeout for the entire payment process
    const paymentTimeout = setTimeout(() => {
      if (isProcessing) {
        setIsProcessing(false);
        setError('Payment request timed out. Please try again.');
        toast.error('Payment request timed out. Please try again later.', { id: 'payment-processing' });
      }
    }, 45000); // 45 seconds timeout
    
    try {
      // Verify session is still valid
      const authCheck = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!authCheck.ok) {
        throw new Error('Authentication failed. Please log in again to refresh your session.');
      }
      
      // Proceed with payment
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: amount,
          currency: 'USD',
          payment_method: selectedPaymentMethod.apiValue
        })
      });
      
      // Dismiss the loading toast
      toast.dismiss('payment-processing');
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          // Clear auth data
          localStorage.clear();
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          throw new Error('Authentication failed. Please log in again.');
        }
        
        throw new Error(errorData.error || 'Payment request failed');
      }
      
      const data = await response.json();
      
      if (!data.payment_url) {
        throw new Error('Invalid payment response. Missing payment URL.');
      }
      
      setPaymentUrl(data.payment_url);
      toast.success('Payment initiated successfully!');
      
      // Refresh profile data after successful payment initiation
      setTimeout(() => fetchProfileData(), 1000);
    } catch (err) {
      console.error('Payment error:', err);
      
      // If authentication error, redirect to login
      if ((err as Error).message.includes('Authentication failed')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast.error(err instanceof Error ? err.message : 'Payment failed. Please try again.', { id: 'payment-processing' });
      }
    } finally {
      clearTimeout(paymentTimeout);
      setIsProcessing(false);
    }
  };

  // Reset the modal state
  const resetModal = () => {
    setSelectedMethod(null);
    setAmount('');
    setPaymentUrl(null);
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
    setStep('amount');
  };

  // Handle back button
  const handleBack = () => {
    setStep('method');
    setAmount('');
  };

  return (
    <AnimatePresence>
      {isOpen && isAuthenticated && (
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
            <div className="relative p-4 sm:p-6 border-b border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold text-white text-center">PURCHASE</h2>
              <button
                onClick={handleClose}
                className="absolute right-3 sm:right-4 top-3 sm:top-4 p-2 text-white/60 hover:text-white
                  rounded-lg hover:bg-white/5 transition-colors"
              >
                <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Current Balance */}
              <div className="mb-4 sm:mb-6 text-center">
                <p className="text-sm sm:text-base text-white/60 mb-1">Current balance:</p>
                {isLoadingBalance ? (
                  <div className="flex justify-center items-center h-8">
                    <div className="w-5 h-5 border-2 border-[#00ffff]/30 border-t-[#00ffff] rounded-full animate-spin"></div>
                  </div>
                ) : isAuthenticated ? (
                  <p className="text-xl sm:text-2xl font-bold text-[#00ffff]">
                    ${profileData?.balance || '0'}
                  </p>
                ) : (
                  <p className="text-sm text-white/40 italic">Login to view balance</p>
                )}
              </div>

              {paymentUrl ? (
                // Payment URL display
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="bg-[#0f1520] border border-[#00ffff]/20 rounded-xl p-4 sm:p-5 shadow-lg shadow-[#00ffff]/5 mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Your payment is ready!</h3>
                    
                    <div className="flex flex-col items-center justify-center mb-3">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#00ffff]/10 text-[#00ffff] mb-3">
                        {selectedPaymentMethod?.icon || <FaBitcoin className="w-8 h-8" />}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-white/60 text-xs sm:text-sm mb-1">Payment amount:</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#00ffff]">
                          ${amount}
                        </p>
                        
                        {selectedPaymentMethod?.bonus && (
                          <div className="mt-1 flex items-center justify-center gap-1 text-[#00ffff]">
                            <HiSparkles className="w-4 h-4" />
                            <span className="text-xs sm:text-sm">
                              +${(Number(amount) * selectedPaymentMethod.bonus / 100).toFixed(2)} bonus
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-white/60 mb-3 bg-black/20 p-2 rounded-lg">
                      <p>Payment method: <span className="text-white">{selectedPaymentMethod?.title || 'Cryptocurrency'}</span></p>
                    </div>

                    {/* Balance Information */}
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div className="bg-black/20 p-2 rounded-lg">
                        <p className="text-white/60 mb-1">Current Balance:</p>
                        <p className="text-white font-medium">${profileData?.balance || '0'}</p>
                      </div>
                      <div className="bg-[#00ffff]/5 p-2 rounded-lg">
                        <p className="text-white/60 mb-1">After Purchase:</p>
                        <p className="text-[#00ffff] font-medium">
                          ${typeof amount === 'number' && profileData?.balance 
                            ? (Number(profileData.balance) + amount + (selectedPaymentMethod?.bonus 
                                ? (amount * selectedPaymentMethod.bonus / 100) 
                                : 0)).toFixed(2)
                            : (Number(profileData?.balance || 0) + (typeof amount === 'number' ? amount : 0)).toFixed(2)
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <a 
                    href={paymentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                      hover:bg-[#00ffff]/20 border border-[#00ffff]/30 transition-all duration-200 text-sm sm:text-base"
                  >
                    Complete Payment
                  </a>
                  <p className="text-xs sm:text-sm text-white/40">
                    Click the button above to complete your payment
                  </p>
                  
                  {/* Payment URL Display */}
                  <div className="mt-2 p-2 bg-black/30 rounded-lg">
                    <p className="text-xs text-white/40 mb-1">Payment URL:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={paymentUrl}
                        className="w-full bg-black/50 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white/70 overflow-hidden text-ellipsis"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(paymentUrl);
                          toast.success('Payment URL copied to clipboard');
                        }}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : step === 'amount' ? (
                // Amount Input Step
                <div className="mb-6 sm:mb-8">
                  <div className="bg-[#0f1520] border border-[#00ffff]/20 rounded-xl p-4 sm:p-5 shadow-lg shadow-[#00ffff]/5">
                    <div className="flex items-center gap-3 mb-4">
                      {selectedPaymentMethod?.icons?.[0] || selectedPaymentMethod?.icon}
                      <h3 className="text-lg sm:text-xl font-bold text-white">{selectedPaymentMethod?.title}</h3>
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
                    
                    {selectedPaymentMethod?.bonus && (
                      <div className="mt-2 sm:mt-3 text-center flex items-center justify-center gap-1 sm:gap-2 text-[#00ffff] bg-[#00ffff]/5 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm">
                        <HiSparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium">
                          +{selectedPaymentMethod.bonus}% bonus will be applied
                        </span>
                      </div>
                    )}
                    
                    {typeof amount === 'number' && amount > 0 && (
                      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-[#00ffff]/5 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-white/70 mb-0.5 sm:mb-1">You will receive:</p>
                        <p className="text-[#00ffff] text-lg sm:text-xl font-bold">
                          ${amount}{selectedPaymentMethod?.bonus ? ` + ${(amount * selectedPaymentMethod.bonus / 100).toFixed(2)} bonus` : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Payment Method Selection Step
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-white/80 text-center font-medium">
                    Choose your payment method:
                  </p>
                  <p className="text-xs sm:text-sm text-white/40 text-center">
                    All purchases are processed automatically
                  </p>

                  <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleMethodSelect(method.id)}
                        className={`w-full p-3 sm:p-4 rounded-xl border transition-all duration-200
                          flex items-center gap-3 sm:gap-4 group relative
                          bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20`}
                      >
                        {/* Icon */}
                        <div className="text-[#00ffff]">
                          {method.icons ? (
                            <div className="flex items-center gap-1 sm:gap-2">
                              {method.icons.map((icon, index) => (
                                <div key={index} className="text-base sm:text-xl relative">
                                  {icon}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-base sm:text-xl">{method.icon}</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-left">
                          <p className="text-sm sm:text-base text-white font-medium">{method.title}</p>
                        </div>

                        {/* Service Icons */}
                        {method.serviceIcons && (
                          <div className="flex items-center gap-4 mr-3">
                            {method.serviceIcons.map((icon, index) => (
                              <div key={index}>
                                {icon}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Bonus Badge */}
                        {method.bonus && (
                          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-gradient-to-r from-[#00ffff]/10 to-[#00ffff]/5 
                            backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 
                            border border-[#00ffff]/20 shadow-lg shadow-[#00ffff]/5">
                            <HiSparkles className="w-4 h-4 text-[#00ffff]" />
                            <span className="text-[#00ffff] text-xs sm:text-sm font-medium">
                              +{method.bonus}% BONUS
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
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
              {paymentUrl ? (
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border border-white/10 
                    text-white hover:bg-white/5 transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
              ) : step === 'amount' ? (
                <>
                  <button
                    onClick={handleBack}
                    className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border border-white/10 
                      text-white hover:bg-white/5 transition-colors text-sm sm:text-base"
                  >
                    Back
                  </button>
                  {isAuthenticated && (
                    <button
                      onClick={handlePayment}
                      disabled={!isAmountValid || isProcessing}
                      className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center
                        ${isAmountValid && !isProcessing
                          ? 'bg-[#00ffff]/10 text-[#00ffff] hover:bg-[#00ffff]/20'
                          : 'bg-white/5 text-white/40 cursor-not-allowed'
                        }
                        border border-[#00ffff]/30
                        transition-all duration-200 text-sm sm:text-base`}
                    >
                      {isProcessing ? (
                        <span className="inline-block w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#00ffff]/30 border-t-[#00ffff] rounded-full animate-spin"></span>
                      ) : (
                        'Process Payment'
                      )}
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border border-white/10 
                    text-white hover:bg-white/5 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              )}
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default PurchaseModal;