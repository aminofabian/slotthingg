'use client';
import React, { useState } from 'react';
import Logo from '../Logo/Logo';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Always fetch fresh UUID from dashboard-games
      const dashboardResponse = await fetch('https://serverhub.biz/users/dashboard-games/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_domain: "https://serverhub.biz"
        })
      });

      const dashboardData = await dashboardResponse.json();
      const whitelabel_admin_uuid = dashboardData.data.whitelabel_admin_uuid;

      if (!whitelabel_admin_uuid) {
        throw new Error('Failed to get required authentication data');
      }

      // Log the forgot password request payload
      const forgotPasswordPayload = {
        email,
        whitelabel_admin_uuid
      };
      console.log('Forgot password request payload:', forgotPasswordPayload);

      const response = await fetch('https://serverhub.biz/users/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(forgotPasswordPayload)
      });

      // Log response status and headers
      console.log('Forgot password response status:', response.status);
      console.log('Forgot password response headers:', Object.fromEntries(response.headers.entries()));

      // Get the raw text response
      const responseText = await response.text();
      console.log('Raw forgot password response:', responseText);

      // Try to parse it as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse forgot password response as JSON:', responseText);
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      if (!response.ok) {
        // Check if the error is in a known format
        if (data.message) {
          throw new Error(data.message);
        } else if (data.detail) {
          throw new Error(data.detail);
        } else if (typeof data === 'string') {
          throw new Error(data);
        } else {
          throw new Error('Failed to process request. Please try again later.');
        }
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
              ) : (
                <motion.div 
                  className="mt-10 text-center space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-16 h-16 mx-auto bg-[#00ffff]/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#00ffff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white/90 tracking-wide">
                    Check your email for password reset instructions
                  </p>
                  <p className="text-white/50 text-sm tracking-wide">
                    If you don't see the email, check your spam folder
                  </p>
                </motion.div>
              )}

              <div className="mt-8 text-center">
                <a href="/login" 
                  className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200 
                  tracking-wider">
                  Back to Sign in
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword; 