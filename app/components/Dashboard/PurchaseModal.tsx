'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBitcoin, FaCreditCard, FaApplePay, FaGooglePay } from 'react-icons/fa';
import { SiCashapp, SiLitecoin } from 'react-icons/si';
import { IoClose } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi';
import { TbBolt } from 'react-icons/tb';
import { FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

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
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<{
    balance: string;
    cashable_balance: string;
    bonus_balance: string;
    full_name: string;
  } | null>(null);

  // Get the selected payment method object
  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);
  
  // Check if amount is valid
  const isAmountValid = typeof amount === 'number' && 
    amount >= (selectedPaymentMethod?.minAmount || 0) && 
    (selectedPaymentMethod?.maxAmount ? amount <= selectedPaymentMethod.maxAmount : true);

  // Check authentication status first
  useEffect(() => {
    if (!isOpen) return;
    
    const checkAuthAndFetchProfile = async () => {
      // First check if we have authentication tokens
      checkAuthentication();
      
      // Then try to fetch profile data if authenticated
      if (isAuthenticated) {
        await fetchProfileData();
      } else {
        setIsLoadingBalance(false);
      }
    };
    
    checkAuthAndFetchProfile();
  }, [isOpen]);

  // Check authentication status
  const checkAuthentication = () => {
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
    
    return !!tokenToUse || !!userId;
  };

  // Fetch user profile data including balance
  const fetchProfileData = async () => {
    setIsLoadingBalance(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If we get an authentication error, update the auth state
        if (errorData.error === "User not authenticated" || response.status === 401) {
          setIsAuthenticated(false);
          // Clear any stored tokens that might be invalid
          localStorage.removeItem('token');
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          throw new Error('Authentication required');
        }
        
        throw new Error(errorData.error || 'Failed to fetch profile data');
      }

      const data = await response.json();
      setProfileData(data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      if ((err as Error).message !== 'Authentication required') {
        toast.error('Failed to load balance. Please try again.');
      }
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
      setError('You must be logged in to make a purchase');
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
    }, 45000); // 45 seconds timeout (longer than server timeout to allow for retries)
    
    try {
      // Prepare headers with authentication
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // Add auth token if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      console.log('Initiating payment request for', selectedPaymentMethod.title);
      
      // Use a proxy endpoint to avoid CORS issues
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: amount,
          currency: 'USD',
          payment_method: selectedPaymentMethod.apiValue
        }),
        credentials: 'include'
      });
      
      // Dismiss the loading toast
      toast.dismiss('payment-processing');
      
      if (!response.ok) {
        // Try to parse error response
        let errorMessage = 'Payment request failed';
        try {
          const errorData = await response.json();
          console.log('Payment error response:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
          
          // Handle authentication errors
          if (errorData.error === "User not authenticated" || response.status === 401) {
            setIsAuthenticated(false);
            throw new Error('Authentication required. Please log in again.');
          }
          
          // Handle specific error cases
          if (response.status === 504) {
            throw new Error('Payment service timed out. Please try again later.');
          } else if (response.status === 502) {
            throw new Error('Unable to connect to payment service. Please try again later.');
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          
          // If we can't parse the response, check for specific status codes
          if (response.status === 401 || response.status === 403) {
            setIsAuthenticated(false);
            throw new Error('Authentication required. Please log in again.');
          } else if (response.status === 0 || response.status === 520) {
            // Network error or server error
            throw new Error('Network error. Please check your connection and try again.');
          } else if (response.status === 429) {
            throw new Error('Too many requests. Please try again later.');
          } else if (response.status === 500) {
            throw new Error('Server error. Please try again later.');
          } else if (response.status === 400) {
            throw new Error('Invalid request. Please check your payment details.');
          } else if (response.status === 404) {
            throw new Error('Payment service not available. Please try again later.');
          } else if (response.status === 504) {
            throw new Error('Payment service timed out. Please try again later.');
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Payment response received');
      
      if (!data.payment_url) {
        throw new Error('Invalid payment response. Missing payment URL.');
      }
      
      setPaymentUrl(data.payment_url);
      toast.success('Payment initiated successfully!');
      
      // Refresh profile data after successful payment initiation
      fetchProfileData();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // If authentication error, show login prompt
      if ((err as Error).message.includes('Authentication required')) {
        setIsAuthenticated(false);
      }
      
      // Show toast for error
      toast.error(err instanceof Error ? err.message : 'Payment failed. Please try again.', { id: 'payment-processing' });
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

  // Retry authentication and profile fetch
  const handleRetryAuth = async () => {
    setError(null);
    const isAuth = checkAuthentication();
    
    if (isAuth) {
      await fetchProfileData();
    } else {
      setError('Authentication required. Please log in.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
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

              {!isAuthenticated ? (
                // Authentication required message
                <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-6">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="p-3 sm:p-4 rounded-full bg-white/5 text-[#00ffff]">
                      <FiLock className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Authentication Required</h3>
                  <p className="text-sm sm:text-base text-white/60">
                    You need to be logged in to make a purchase.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <button
                      onClick={handleRetryAuth}
                      className="py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl bg-white/5 text-white 
                        hover:bg-white/10 border border-white/10 transition-all duration-200 text-sm sm:text-base"
                    >
                      Retry
                    </button>
                    <button
                      onClick={handleLoginRedirect}
                      className="py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl bg-[#00ffff]/10 text-[#00ffff] 
                        hover:bg-[#00ffff]/20 border border-[#00ffff]/30 transition-all duration-200 text-sm sm:text-base"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              ) : paymentUrl ? (
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
                </div>
              ) : (
                <>
                  {/* Amount Input - Show only when payment method is selected */}
                  {selectedMethod && (
                    <div className="mb-6 sm:mb-8">
                      <div className="bg-[#0f1520] border border-[#00ffff]/20 rounded-xl p-4 sm:p-5 shadow-lg shadow-[#00ffff]/5">
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
                            min={selectedPaymentMethod?.minAmount}
                            max={selectedPaymentMethod?.maxAmount}
                            className="w-full bg-black/40 border-2 border-[#00ffff]/20 rounded-xl py-3 sm:py-4 px-10 sm:px-14
                              text-white text-center text-lg sm:text-xl font-bold focus:outline-none focus:border-[#00ffff]/50
                              transition-all duration-200 hover:border-[#00ffff]/30"
                            placeholder={`${selectedPaymentMethod?.minAmount}`}
                          />
                          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/60 text-xs sm:text-sm">
                            USD
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs sm:text-sm text-white/60 px-2 mb-2 sm:mb-3">
                          <span>Min: ${selectedPaymentMethod?.minAmount}</span>
                          {selectedPaymentMethod?.maxAmount && (
                            <span>Max: ${selectedPaymentMethod?.maxAmount}</span>
                          )}
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
                  )}

                  {/* Payment Methods */}
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-sm sm:text-base text-white/80 text-center font-medium">
                      {selectedMethod ? 'Selected Payment Method:' : 'Choose your payment method:'}
                    </p>
                    <p className="text-xs sm:text-sm text-white/40 text-center">
                      All purchases are processed automatically
                    </p>

                    <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`w-full p-3 sm:p-4 rounded-xl border transition-all duration-200
                            flex items-center gap-3 sm:gap-4 group relative
                            ${selectedMethod === method.id
                              ? 'bg-[#00ffff]/10 border-[#00ffff]/30'
                              : 'bg-black/40 border-white/10 hover:bg-white/5 hover:border-white/20'
                            }`}
                        >
                          {/* Icon */}
                          <div className="text-[#00ffff]">
                            {method.icons ? (
                              <div className="flex items-center gap-1 sm:gap-2">
                                {method.icons.map((icon, index) => (
                                  <div key={index} className="text-base sm:text-xl">{icon}</div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-base sm:text-xl">{method.icon}</div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 text-left">
                            <p className="text-sm sm:text-base text-white font-medium">{method.title}</p>
                            <p className="text-xs sm:text-sm text-white/40">
                              Min.${method.minAmount}
                              {method.maxAmount ? ` - Max. $${method.maxAmount}` : ''}
                            </p>
                          </div>

                          {/* Bonus Badge */}
                          {method.bonus && (
                            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-[#00ffff]/10 px-2 sm:px-3 py-0.5 sm:py-1 
                              rounded-full flex items-center gap-1 sm:gap-1.5">
                              <span className="text-[#00ffff] text-xs sm:text-sm font-medium">
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
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs sm:text-sm text-center">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/10 flex gap-2 sm:gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl border border-white/10 
                  text-white hover:bg-white/5 transition-colors text-sm sm:text-base"
              >
                {paymentUrl ? 'Close' : 'Cancel'}
              </button>
              
              {isAuthenticated && !paymentUrl && (
                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || !isAmountValid || isProcessing}
                  className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center
                    ${selectedMethod && isAmountValid && !isProcessing
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseModal; 