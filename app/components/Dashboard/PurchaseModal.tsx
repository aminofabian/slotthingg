'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBitcoin, FaCreditCard, FaApplePay, FaGooglePay } from 'react-icons/fa';
import { SiCashapp, SiLitecoin } from 'react-icons/si';
import { IoClose } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi';
import { TbBolt } from 'react-icons/tb';
import { FiLock } from 'react-icons/fi';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = {
  id: string;
  apiValue?: string;
  title: string;
  icon: React.ReactNode;
  minAmount: number;
  maxAmount?: number;
  bonus?: number;
  icons?: React.ReactNode[];
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
    apiValue: 'BTC-LN',
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
    apiValue: 'BTC-CHAIN',
    title: 'Bitcoin',
    icon: <FaBitcoin className="w-6 h-6" />,
    minAmount: 20
  },
  {
    id: 'litecoin',
    apiValue: 'LTC-CHAIN',
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
  const [amount, setAmount] = useState<number | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get the selected payment method object
  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);
  
  // Check if amount is valid
  const isAmountValid = typeof amount === 'number' && 
    amount >= (selectedPaymentMethod?.minAmount || 0) && 
    (selectedPaymentMethod?.maxAmount ? amount <= selectedPaymentMethod.maxAmount : true);

  // Check authentication status on component mount
  useEffect(() => {
    // Check for token in cookies
    const token = getCookie('token');
    
    // If no token in cookies, try localStorage as fallback
    const localStorageToken = localStorage.getItem('token');
    
    const tokenToUse = token || localStorageToken;
    
    setAuthToken(tokenToUse);
    setIsAuthenticated(!!tokenToUse);
    
    // Also check if user_id exists in localStorage as additional auth check
    const userId = localStorage.getItem('user_id');
    if (!tokenToUse && userId) {
      setIsAuthenticated(true);
    }
  }, []);

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
      setError('You must be logged in to make a purchase');
      return;
    }

    if (!selectedPaymentMethod || !selectedPaymentMethod.apiValue || !isAmountValid) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Prepare headers with authentication
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('https://serverhub.biz/payments/btcpay-payment/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: amount,
          currency: 'USD',
          payment_method: selectedPaymentMethod.apiValue
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Payment request failed');
      }
      
      const data = await response.json();
      setPaymentUrl(data.payment_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the modal state
  const resetModal = () => {
    setSelectedMethod(null);
    setAmount('');
    setPaymentUrl(null);
    setError(null);
  };

  // Close modal and reset state
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Close the modal
    handleClose();
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
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
                onClick={handleClose}
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

              {!isAuthenticated ? (
                // Authentication required message
                <div className="text-center space-y-4 py-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-white/5 text-[#00ffff]">
                      <FiLock className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">Authentication Required</h3>
                  <p className="text-white/60">
                    You need to be logged in to make a purchase.
                  </p>
                  <button
                    onClick={handleLoginRedirect}
                    className="mt-4 w-full py-3 px-6 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                      hover:bg-[#00ffff]/20 border border-[#00ffff]/30 transition-all duration-200"
                  >
                    Log In
                  </button>
                </div>
              ) : paymentUrl ? (
                // Payment URL display
                <div className="text-center space-y-4">
                  <p className="text-white font-medium">Your payment is ready!</p>
                  <a 
                    href={paymentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-6 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                      hover:bg-[#00ffff]/20 border border-[#00ffff]/30 transition-all duration-200"
                  >
                    Complete Payment
                  </a>
                  <p className="text-white/40 text-sm">
                    Click the button above to complete your payment
                  </p>
                </div>
              ) : (
                <>
                  {/* Amount Input - Show only when payment method is selected */}
                  {selectedMethod && (
                    <div className="mb-8">
                      <div className="bg-[#0f1520] border border-[#00ffff]/20 rounded-xl p-5 shadow-lg shadow-[#00ffff]/5">
                        <label htmlFor="amount" className="block text-white/90 text-center font-medium mb-3 text-lg">
                          Enter Amount
                        </label>
                        
                        <div className="relative mb-2">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-[#00ffff]/10 text-[#00ffff] font-bold">
                            $
                          </div>
                          <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            min={selectedPaymentMethod?.minAmount}
                            max={selectedPaymentMethod?.maxAmount}
                            className="w-full bg-black/40 border-2 border-[#00ffff]/20 rounded-xl py-4 px-14
                              text-white text-center text-xl font-bold focus:outline-none focus:border-[#00ffff]/50
                              transition-all duration-200 hover:border-[#00ffff]/30"
                            placeholder={`${selectedPaymentMethod?.minAmount}`}
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-sm">
                            USD
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-white/60 px-2 mb-3">
                          <span>Min: ${selectedPaymentMethod?.minAmount}</span>
                          {selectedPaymentMethod?.maxAmount && (
                            <span>Max: ${selectedPaymentMethod?.maxAmount}</span>
                          )}
                        </div>
                        
                        {selectedPaymentMethod?.bonus && (
                          <div className="mt-3 text-center flex items-center justify-center gap-2 text-[#00ffff] bg-[#00ffff]/5 py-2 px-4 rounded-lg">
                            <HiSparkles className="w-5 h-5" />
                            <span className="font-medium">
                              +{selectedPaymentMethod.bonus}% bonus will be applied
                            </span>
                          </div>
                        )}
                        
                        {typeof amount === 'number' && amount > 0 && (
                          <div className="mt-4 p-3 bg-[#00ffff]/5 rounded-lg text-center">
                            <p className="text-white/70 text-sm mb-1">You will receive:</p>
                            <p className="text-[#00ffff] text-xl font-bold">
                              ${amount}{selectedPaymentMethod?.bonus ? ` + ${(amount * selectedPaymentMethod.bonus / 100).toFixed(2)} bonus` : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <p className="text-white/80 text-center font-medium">
                      {selectedMethod ? 'Selected Payment Method:' : 'Choose your payment method:'}
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
                </>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-6 rounded-xl border border-white/10 
                  text-white hover:bg-white/5 transition-colors"
              >
                {paymentUrl ? 'Close' : 'Cancel'}
              </button>
              
              {isAuthenticated && !paymentUrl && (
                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || !isAmountValid || isProcessing}
                  className={`flex-1 py-3 px-6 rounded-xl flex items-center justify-center
                    ${selectedMethod && isAmountValid && !isProcessing
                      ? 'bg-[#00ffff]/10 text-[#00ffff] hover:bg-[#00ffff]/20'
                      : 'bg-white/5 text-white/40 cursor-not-allowed'
                    }
                    border border-[#00ffff]/30
                    transition-all duration-200`}
                >
                  {isProcessing ? (
                    <span className="inline-block w-5 h-5 border-2 border-[#00ffff]/30 border-t-[#00ffff] rounded-full animate-spin"></span>
                  ) : (
                    'Process Payment'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseModal; 