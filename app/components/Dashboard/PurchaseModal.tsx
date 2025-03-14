'use client';
import { useState, useEffect, useRef } from 'react';
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
    
    // Use a ref to track the interval
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    // Set up silent token refresh that runs periodically in the background
    const setupSilentRefresh = () => {
      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      // Set up a silent refresh interval
      refreshIntervalRef.current = setInterval(async () => {
        const tokenLastRefreshed = localStorage.getItem('token_refreshed_at');
        const tokenNeedsRefresh = !tokenLastRefreshed || 
          (Date.now() - parseInt(tokenLastRefreshed)) > 1000 * 60 * 10; // 10 minutes
        
        if (tokenNeedsRefresh) {
          console.log('Token needs refresh, performing silent refresh');
          await silentTokenRefresh();
        }
      }, 60000); // Check every minute
    };
    
    const checkAuthAndFetchProfile = async () => {
      // First check if we have authentication tokens
      const isAuth = checkAuthentication();
      
      if (isAuth) {
        // Perform a silent token refresh when the modal opens
        // This is non-blocking and won't show any UI if it fails
        silentTokenRefresh().then(refreshed => {
          if (refreshed) {
            console.log('Token silently refreshed on modal open');
          }
        });
        
        // Fetch profile data regardless of token refresh result
        try {
          await fetchProfileData();
        } catch (error) {
          console.error('Error fetching profile data:', error);
          // Don't show error toast here, we'll handle it more gracefully
        }
        
        // Set up the silent refresh mechanism
        setupSilentRefresh();
      } else {
        setIsLoadingBalance(false);
      }
    };
    
    // Run the auth check and profile fetch
    checkAuthAndFetchProfile();
    
    // Return cleanup function
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [isOpen]);

  // Check authentication status
  const checkAuthentication = () => {
    // Check for token in cookies
    const token = getCookie('token');
    
    // If no token in cookies, try localStorage as fallback
    const localStorageToken = localStorage.getItem('token');
    
    const tokenToUse = token || localStorageToken;
    
    // If we have a token and it's different from the current one, update the refresh timestamp
    if (tokenToUse && tokenToUse !== authToken) {
      console.log('New token detected, updating refresh timestamp');
      localStorage.setItem('token_refreshed_at', Date.now().toString());
    }
    
    setAuthToken(tokenToUse);
    setIsAuthenticated(!!tokenToUse);
    
    // Also check if user_id exists in localStorage as additional auth check
    const userId = localStorage.getItem('user_id');
    if (!tokenToUse && userId) {
      setIsAuthenticated(true);
    }
    
    return !!tokenToUse || !!userId;
  };

  // Helper function to refresh the authentication token
  const refreshAuthToken = async (): Promise<boolean> => {
    try {
      setIsProcessing(true);
      console.log('Attempting to refresh authentication token before payment');
      
      // Get current token
      const currentToken = authToken || getCookie('token') || localStorage.getItem('token');
      if (!currentToken) {
        console.error('No token available to refresh');
        setIsAuthenticated(false);
        return false;
      }
      
      // Add a timestamp to prevent caching
      const timestamp = Date.now();
      
      // Call the token refresh endpoint
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
          'X-Refresh-Token': 'true',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache',
          'X-Timestamp': timestamp.toString()
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Token refresh failed with status:', response.status);
        
        // If authentication failed completely, update UI state
        if (response.status === 401 || response.status === 403) {
          setIsAuthenticated(false);
          // Clear any stored tokens that might be invalid
          localStorage.removeItem('token');
          localStorage.removeItem('token_refreshed_at');
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          
          // Show a message to the user
          toast.error('Your session has expired. Please log in again.');
        }
        
        return false;
      }
      
      const data = await response.json();
      
      if (data.refreshed) {
        console.log('Token refreshed successfully');
        
        // Check for new token in response header
        const newToken = response.headers.get('X-New-Token');
        if (newToken) {
          // Update token in localStorage
          localStorage.setItem('token', newToken);
          setAuthToken(newToken);
          
          // Update the refresh timestamp
          localStorage.setItem('token_refreshed_at', Date.now().toString());
        } else {
          // If no header, the token should be in the cookies already
          const cookieToken = getCookie('token');
          if (cookieToken && cookieToken !== currentToken) {
            localStorage.setItem('token', cookieToken);
            setAuthToken(cookieToken);
            
            // Update the refresh timestamp
            localStorage.setItem('token_refreshed_at', Date.now().toString());
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch user profile data including balance
  const fetchProfileData = async () => {
    setIsLoadingBalance(true);
    let retryCount = 0;
    const maxRetries = 2;
    
    const attemptFetch = async (): Promise<boolean> => {
      try {
        // Get the latest token
        const currentToken = authToken || getCookie('token') || localStorage.getItem('token');
        
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': currentToken ? `Bearer ${currentToken}` : '',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache',
            'X-Timestamp': Date.now().toString()
          },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // If we get an authentication error, try refreshing the token silently
          if (errorData.error === "User not authenticated" || response.status === 401) {
            console.log('Authentication failed when fetching profile, attempting silent token refresh');
            const refreshed = await silentTokenRefresh();
            
            if (refreshed && retryCount < maxRetries) {
              retryCount++;
              console.log(`Token refreshed, retrying profile fetch (attempt ${retryCount})`);
              return attemptFetch(); // Recursive call with fresh token
            } else if (!refreshed) {
              // If refresh failed but we're still within retry attempts, try again with a delay
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Token refresh failed, retrying anyway after delay (attempt ${retryCount})`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
                return attemptFetch();
              } else {
                // If we've exhausted retries, update auth state silently
                console.log('Max retries reached, updating auth state silently');
                setIsAuthenticated(false);
                return false;
              }
            }
          }
          
          // For other errors, just log them without showing to user
          console.error('Error fetching profile data:', errorData.error || 'Unknown error');
          return false;
        }

        const data = await response.json();
        setProfileData(data);
        setIsAuthenticated(true);
        return true;
      } catch (err) {
        console.error('Error in profile data fetch attempt:', err);
        return false;
      }
    };
    
    try {
      const success = await attemptFetch();
      
      // Only show error if all retries failed and we're authenticated
      // This prevents showing errors during normal session expiration
      if (!success && isAuthenticated) {
        // Use a more subtle approach - update UI without disruptive alerts
        console.log('All profile fetch attempts failed, updating UI silently');
        // We don't show a toast here to avoid disrupting the user
      }
    } catch (err) {
      console.error('Unhandled error in fetchProfileData:', err);
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
      // Silently refresh the token before payment - this won't disrupt the user if it fails
      console.log('Silently refreshing token before payment');
      await silentTokenRefresh();
      
      // Prepare headers with authentication
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache',
        'X-Timestamp': Date.now().toString()
      };
      
      // Add auth token if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('Adding auth token to request headers');
      } else {
        // Try to get token again as a fallback
        const token = getCookie('token') || localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('Using fallback auth token from cookies/localStorage');
        } else {
          console.warn('No authentication token available for payment request');
        }
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
          
          // Check if token was refreshed and we should retry
          if (errorData.refreshed) {
            console.log('Token was refreshed during payment attempt, retrying...');
            
            // Update token from response if available
            const newToken = response.headers.get('X-New-Token');
            if (newToken) {
              localStorage.setItem('token', newToken);
              setAuthToken(newToken);
            }
            
            // Update the refresh timestamp
            localStorage.setItem('token_refreshed_at', Date.now().toString());
            
            // Retry the payment with the new token
            toast.loading('Retrying payment...', { id: 'payment-processing' });
            
            // Small delay to ensure token is properly set
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Retry the payment (recursive call)
            clearTimeout(paymentTimeout);
            setIsProcessing(false);
            handlePayment();
            return;
          }
          
          // Handle authentication errors more gracefully
          if (errorData.error === "User not authenticated" || 
              errorData.error?.includes("Authentication required") || 
              errorData.error?.includes("Authentication failed") || 
              response.status === 401) {
            
            // Try a silent refresh as a last resort
            const refreshed = await silentTokenRefresh();
            if (refreshed) {
              // If refresh succeeded, retry the payment
              console.log('Authentication failed but token refreshed, retrying payment');
              toast.loading('Retrying payment...', { id: 'payment-processing' });
              
              // Small delay to ensure token is properly set
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Retry the payment (recursive call)
              clearTimeout(paymentTimeout);
              setIsProcessing(false);
              handlePayment();
              return;
            }
            
            // If refresh failed, show a more user-friendly message
            setIsAuthenticated(false);
            setError('Your session has expired. Please log in again to continue.');
            toast.error('Session expired. Please log in again.', { id: 'payment-processing' });
            
            // Offer login button instead of disruptive prompt
            return;
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
            setError('Your session has expired. Please log in again to continue.');
            toast.error('Session expired. Please log in again.', { id: 'payment-processing' });
            return;
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
      
      // Store payment ID if available for reference
      if (data.payment_id) {
        console.log('Payment ID:', data.payment_id);
        // You can store this in state if needed for tracking
      }
      
      // Refresh profile data after successful payment initiation
      // Add a small delay to allow backend to process the payment
      setTimeout(async () => {
        console.log('Refreshing profile data after payment');
        await fetchProfileData();
      }, 1000);
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      
      // Show toast for errors
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.', { id: 'payment-processing' });
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
    setIsLoadingBalance(true);
    
    try {
      // Check authentication first
      const isAuth = checkAuthentication();
      
      if (isAuth) {
        // Try silent refresh first
        const refreshed = await silentTokenRefresh();
        console.log('Silent refresh during retry:', refreshed ? 'successful' : 'failed');
        
        // Fetch profile data regardless of refresh result
        await fetchProfileData();
      } else {
        setError('Authentication required. Please log in.');
      }
    } catch (error) {
      console.error('Error during auth retry:', error);
      setError('Failed to authenticate. Please try logging in again.');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Add a new function for silent token refresh
  const silentTokenRefresh = async (): Promise<boolean> => {
    try {
      // Get current token
      const currentToken = authToken || getCookie('token') || localStorage.getItem('token');
      if (!currentToken) {
        console.log('No token available for silent refresh');
        return false;
      }
      
      console.log('Performing silent token refresh');
      
      // Call the token refresh endpoint
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
          'X-Refresh-Token': 'true',
          'X-Silent-Refresh': 'true', // Flag for silent refresh
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache',
          'X-Timestamp': Date.now().toString()
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.log('Silent token refresh failed with status:', response.status);
        return false;
      }
      
      const data = await response.json();
      
      if (data.refreshed) {
        // Check for new token in response header
        const newToken = response.headers.get('X-New-Token');
        if (newToken) {
          // Update token in localStorage
          localStorage.setItem('token', newToken);
          setAuthToken(newToken);
          localStorage.setItem('token_refreshed_at', Date.now().toString());
        } else {
          // If no header, the token should be in the cookies already
          const cookieToken = getCookie('token');
          if (cookieToken && cookieToken !== currentToken) {
            localStorage.setItem('token', cookieToken);
            setAuthToken(cookieToken);
            localStorage.setItem('token_refreshed_at', Date.now().toString());
          }
        }
        
        console.log('Silent token refresh successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Error during silent token refresh:', error);
      return false;
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
                    {error || 'You need to be logged in to make a purchase.'}
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