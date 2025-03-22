'use client';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import Logo from '../Logo/Logo';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/query';
import { MotionDiv } from '@/app/types/motion';
import toast from 'react-hot-toast';

interface ResetPasswordProps {
  userId: string;
  token: string;
}

const ResetPassword = ({ userId, token }: ResetPasswordProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  });

  const password = watch('password');
  const passwordRequirements = {
    length: (password?.length || 0) >= 5,
    uppercase: /[A-Z]/.test(password || ''),
    lowercase: /[a-z]/.test(password || ''),
    number: /[0-9]/.test(password || ''),
    symbol: /[^A-Za-z0-9]/.test(password || '')
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('https://serverhub.biz/users/reset-password/confirm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uidb64: userId,
          password: data.password,
          token: token
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || 'Failed to reset password');
      }

      setIsSubmitted(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password');
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
        <MotionDiv 
          className="w-full max-w-lg relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Logo section with glow */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-24 z-10">
            <div className="relative">
              <MotionDiv 
                className="relative z-10 scale-150"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2, ease: 'easeOut' }}
              >
                <Logo />
              </MotionDiv>
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00ffff]/5 rounded-full blur-[100px]" />
            </div>
          </div>

          {/* Main card */}
          <MotionDiv 
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
                  Reset Password
                </h2>
                <p className="text-white/50 text-sm md:text-base tracking-wider">
                  Enter your new password
                </p>
              </div>

              {!isSubmitted ? (
                <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-5">
                    <div className="group relative">
                      <label htmlFor="password" className="block text-sm text-[#00ffff]/80 mb-2 ml-1 
                        tracking-wider uppercase">
                        New Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        {...register('password')}
                        className={`block w-full rounded-xl border ${
                          errors.password ? 'border-red-500' : 'border-[#00ffff]/20'
                        } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                        focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                        backdrop-blur-sm transition-all duration-300
                        hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                        placeholder="Enter new password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-400 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="group relative">
                      <label htmlFor="confirmPassword" className="block text-sm text-[#00ffff]/80 mb-2 ml-1 
                        tracking-wider uppercase">
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        className={`block w-full rounded-xl border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-[#00ffff]/20'
                        } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                        focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                        backdrop-blur-sm transition-all duration-300
                        hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mt-4">
                      <p className={`flex items-center ${passwordRequirements.length ? 'text-green-400' : 'text-white/50'}`}>
                        <span className="mr-1">{passwordRequirements.length ? '✓' : '○'}</span>
                        At least 5 characters
                      </p>
                      <p className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-400' : 'text-white/50'}`}>
                        <span className="mr-1">{passwordRequirements.uppercase ? '✓' : '○'}</span>
                        One uppercase letter
                      </p>
                      <p className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-400' : 'text-white/50'}`}>
                        <span className="mr-1">{passwordRequirements.lowercase ? '✓' : '○'}</span>
                        One lowercase letter
                      </p>
                      <p className={`flex items-center ${passwordRequirements.number ? 'text-green-400' : 'text-white/50'}`}>
                        <span className="mr-1">{passwordRequirements.number ? '✓' : '○'}</span>
                        One number
                      </p>
                      <p className={`flex items-center ${passwordRequirements.symbol ? 'text-green-400' : 'text-white/50'}`}>
                        <span className="mr-1">{passwordRequirements.symbol ? '✓' : '○'}</span>
                        One symbol
                      </p>
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
                      <MotionDiv
                        className="absolute bottom-0 left-0 h-[2px] bg-[#00ffff]/30"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                      >
                        <MotionDiv
                          className="absolute top-0 left-0 h-full bg-[#00ffff]"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, ease: 'easeInOut' }}
                        />
                      </MotionDiv>
                    )}
                    <span className="relative flex items-center justify-center">
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </span>
                  </button>
                </form>
              ) : (
                <MotionDiv 
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
                    Your password has been successfully updated
                  </p>
                </MotionDiv>
              )}

              <div className="mt-8 text-center">
                <a href="/login" 
                  className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200 
                  tracking-wider">
                  Back to Sign in
                </a>
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>
      </div>
    </div>
  );
};

export default ResetPassword; 