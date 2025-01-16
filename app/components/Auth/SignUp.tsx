'use client';
import React, { useState } from 'react';
import Logo from '../Logo/Logo';
import { motion } from 'framer-motion';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    console.log('Form Data:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
              {/* Glowing effect behind logo */}
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
            {/* Top decoration */}
            <div className="relative h-28 overflow-hidden rounded-t-2xl">
              <div className="absolute inset-0 bg-[#00ffff]/5" />
              <div className="absolute inset-0 backdrop-blur-sm" />
            </div>
            
            {/* Form content */}
            <div className="px-12 pb-12 pt-2">
              <div className="text-center">
                <h2 className="text-[#00ffff] text-2xl md:text-3xl font-light tracking-[0.3em] uppercase mb-4">
                  Join Us
                </h2>
                <p className="text-white/50 text-sm md:text-base tracking-wider">
                  Create your gaming account
                </p>
              </div>

              <form className="mt-10 space-y-7" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Username field */}
                  <div className="group relative">
                    <label htmlFor="username" className="block text-sm text-[#00ffff]/80 mb-2 ml-1 
                      tracking-wider uppercase">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-[#00ffff]/20 
                      bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                      focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                      backdrop-blur-sm transition-all duration-300
                      hover:border-[#00ffff]/30 hover:bg-white/[0.04]"
                      placeholder="Choose a username"
                    />
                  </div>

                  {/* Email field */}
                  <div className="group relative">
                    <label htmlFor="email" className="block text-sm text-[#00ffff]/80 mb-2 ml-1 
                      tracking-wider uppercase">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-[#00ffff]/20 
                      bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                      focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                      backdrop-blur-sm transition-all duration-300
                      hover:border-[#00ffff]/30 hover:bg-white/[0.04]"
                      placeholder="name@example.com"
                    />
                  </div>
                  
                  {/* Password field */}
                  <div className="group relative">
                    <label htmlFor="password" className="block text-sm text-[#00ffff]/80 mb-2 ml-1 
                      tracking-wider uppercase">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-[#00ffff]/20 
                      bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                      focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                      backdrop-blur-sm transition-all duration-300
                      hover:border-[#00ffff]/30 hover:bg-white/[0.04]"
                      placeholder="Create a password"
                    />
                  </div>

                  {/* Confirm Password field */}
                  <div className="group relative">
                    <label htmlFor="confirmPassword" className="block text-sm text-[#00ffff]/80 mb-2 ml-1 
                      tracking-wider uppercase">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-[#00ffff]/20 
                      bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                      focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                      backdrop-blur-sm transition-all duration-300
                      hover:border-[#00ffff]/30 hover:bg-white/[0.04]"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                {/* Terms and conditions */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 rounded-md border-[#00ffff]/20 bg-white/[0.02] text-[#00ffff]
                      focus:ring-1 focus:ring-[#00ffff]/50 transition-colors duration-200"
                    />
                  </div>
                  <label htmlFor="terms" className="ml-3 block text-sm text-white/50 tracking-wide">
                    I agree to the{' '}
                    <a href="/terms" className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit button */}
                <div>
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
                    {/* Loading bar animation */}
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
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Sign in link */}
              <div className="mt-8 text-center">
                <span className="text-white/50 tracking-wider">Already have an account? </span>
                <a href="/login" 
                  className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200 
                  tracking-wider">
                  Sign in
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp; 