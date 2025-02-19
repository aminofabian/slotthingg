'use client';
import React, { useState, useEffect } from 'react';
import Logo from '../Logo/Logo';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [whitelabelAdminUuid, setWhitelabelAdminUuid] = useState('');

  // Fetch whitelabel_admin_uuid when component mounts
  useEffect(() => {
    const fetchWhitelabelUuid = async () => {
      try {
        const dashboardResponse = await fetch('/api/auth/dashboard-games', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            project_domain: "https://serverhub.biz"
          })
        });

        const data = await dashboardResponse.json();
        if (data.data?.whitelabel_admin_uuid) {
          setWhitelabelAdminUuid(data.data.whitelabel_admin_uuid);
        } else {
          throw new Error('Failed to get whitelabel admin UUID');
        }
      } catch (error) {
        console.error('Error fetching whitelabel UUID:', error);
        setError('Failed to initialize. Please try again.');
      }
    };

    fetchWhitelabelUuid();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (!whitelabelAdminUuid) {
        throw new Error('Missing required authentication data');
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          whitelabel_admin_uuid: whitelabelAdminUuid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || data.detail || 'Failed to process request');
      }

      setIsSubmitted(true);
      router.push('/check-email');
    } catch (error) {
      console.error('Error in forgot password flow:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Early return if submitted with loading indicator
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#002222]">
        <div className="w-12 h-12 border-4 border-[#00ffff]/20 border-t-[#00ffff] rounded-full animate-spin mb-4"/>
        <div className="text-[#00ffff] text-xl">Redirecting to check email page...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#002222]">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#00ffff05_1px,transparent_1px),linear-gradient(135deg,#00ffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div 
          className="w-full max-w-lg relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Logo section with glow */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-24 z-10">
            <div className="relative">
              <motion.div 
                className="relative z-10 scale-150"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2, ease: 'easeOut' }}
              >
                <Logo />
              </motion.div>
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00ffff]/5 rounded-full blur-[100px]" />
            </div>
          </div>

          {/* Main card */}
          <motion.div 
            className="backdrop-blur-xl bg-white/[0.02] rounded-2xl 
              border border-[#00ffff]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative h-28 overflow-hidden rounded-t-2xl">
              <div className="absolute inset-0 bg-[#00ffff]/5" />
              <div className="absolute inset-0 backdrop-blur-sm" />
            </div>
            
            <div className="px-8 sm:px-12 pb-12 pt-2">
              <div className="text-center">
                <h2 className="text-[#00ffff] text-2xl md:text-3xl font-light tracking-[0.3em] uppercase mb-4">
                  Forgot Password
                </h2>
                <p className="text-white/50 text-sm md:text-base tracking-wider">
                  Enter your email to reset your password
                </p>
              </div>

              {!isSubmitted ? (
                <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-5">
                    <div className="group relative">
                      <label htmlFor="email" className="block text-sm text-[#00ffff]/80 mb-2 ml-1 
                        tracking-wider uppercase">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-xl border border-[#00ffff]/20 
                        bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                        focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                        backdrop-blur-sm transition-all duration-300
                        hover:border-[#00ffff]/30 hover:bg-white/[0.04]"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full rounded-xl border border-[#00ffff]/20
                    bg-[#00ffff]/10 px-6 py-4 text-[#00ffff] tracking-[0.2em] uppercase
                    hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 
                    focus:ring-[#00ffff]/50 transition-all duration-300
                    disabled:opacity-70 disabled:cursor-not-allowed
                    group overflow-hidden"
                  >
                    {isLoading && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-[2px] bg-[#00ffff]/30"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                      >
                        <motion.div
                          className="absolute top-0 left-0 h-full bg-[#00ffff]"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, ease: 'easeInOut' }}
                        />
                      </motion.div>
                    )}
                    <span className="relative flex items-center justify-center">
                      {isLoading ? 'Sending...' : 'Reset Password'}
                    </span>
                  </button>
                </form>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword; 