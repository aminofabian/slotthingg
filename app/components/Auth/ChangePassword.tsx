'use client';
import React, { useState } from 'react';
import { motion, type MotionProps } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiLock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const MotionDiv = MotionDiv as unknown as React.FC<
  React.HTMLAttributes<HTMLDivElement> & MotionProps
>;

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const ChangePassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange'
  });

  const newPassword = watch('newPassword');
  const passwordRequirements = {
    length: (newPassword?.length || 0) >= 8,
    uppercase: /[A-Z]/.test(newPassword || ''),
    number: /[0-9]/.test(newPassword || '')
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormData) => {
      try {
        const response = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            old_password: data.oldPassword,
            password: data.newPassword
          })
        });

        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', responseText);
          throw new Error('Server returned an invalid response');
        }

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            throw new Error('Please log in to change your password');
          }
          throw new Error(responseData.error || responseData.message || responseData.detail || 'Failed to change password');
        }

        return responseData;
      } catch (error: any) {
        console.error('Change password error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      setIsSuccess(true);
      reset();
      toast.success('Password changed successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to change password';
      toast.error(errorMessage);
    }
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    setIsLoading(true);
    toast.promise(
      changePasswordMutation.mutateAsync(data),
      {
        loading: 'Changing password...',
        success: 'Password changed successfully!',
        error: (err: Error) => err.message || 'Failed to change password'
      }
    ).finally(() => setIsLoading(false));
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
                  Change Password
                </h2>
                <p className="text-white/50 text-sm md:text-base tracking-wider">
                  Update your account password
                </p>
              </div>

              {!isSuccess ? (
                <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-5">
                    {/* Current Password */}
                    <div className="relative">
                      <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase flex items-center gap-2">
                        <FiLock className="w-4 h-4 text-[#00ffff]" />
                        Current Password
                      </label>
                      <div className="relative group">
                        <input
                          {...register('oldPassword')}
                          type="password"
                          className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] pl-12 pr-4 py-4 text-white placeholder-white/40
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50 transition-all duration-300
                          hover:border-[#00ffff]/40 group-hover:bg-white/[0.04]"
                          placeholder="Enter your current password"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                          <FiLock className="w-4 h-4 text-[#00ffff]" />
                        </div>
                      </div>
                      {errors.oldPassword && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                          <span>⚠️</span>
                          {errors.oldPassword.message}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="relative">
                      <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase flex items-center gap-2">
                        <FiLock className="w-4 h-4 text-[#00ffff]" />
                        New Password
                      </label>
                      <div className="relative group">
                        <input
                          {...register('newPassword')}
                          type="password"
                          className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] pl-12 pr-4 py-4 text-white placeholder-white/40
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50 transition-all duration-300
                          hover:border-[#00ffff]/40 group-hover:bg-white/[0.04]"
                          placeholder="Create a new password"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                          <FiLock className="w-4 h-4 text-[#00ffff]" />
                        </div>
                      </div>
                      {errors.newPassword && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                          <span>⚠️</span>
                          {errors.newPassword.message}
                        </p>
                      )}
                      
                      {/* Password requirements */}
                      <div className="mt-2 space-y-1 text-sm">
                        <p className={`flex items-center ${passwordRequirements.length ? 'text-green-400' : 'text-white/50'}`}>
                          <span className="mr-1">{passwordRequirements.length ? '✓' : '○'}</span>
                          At least 8 characters
                        </p>
                        <p className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-400' : 'text-white/50'}`}>
                          <span className="mr-1">{passwordRequirements.uppercase ? '✓' : '○'}</span>
                          One uppercase letter
                        </p>
                        <p className={`flex items-center ${passwordRequirements.number ? 'text-green-400' : 'text-white/50'}`}>
                          <span className="mr-1">{passwordRequirements.number ? '✓' : '○'}</span>
                          One number
                        </p>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="relative">
                      <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase flex items-center gap-2">
                        <FiLock className="w-4 h-4 text-[#00ffff]" />
                        Confirm New Password
                      </label>
                      <div className="relative group">
                        <input
                          {...register('confirmNewPassword')}
                          type="password"
                          className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] pl-12 pr-4 py-4 text-white placeholder-white/40
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50 transition-all duration-300
                          hover:border-[#00ffff]/40 group-hover:bg-white/[0.04]"
                          placeholder="Confirm your new password"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                          <FiLock className="w-4 h-4 text-[#00ffff]" />
                        </div>
                      </div>
                      {errors.confirmNewPassword && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                          <span>⚠️</span>
                          {errors.confirmNewPassword.message}
                        </p>
                      )}
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
            </div>
          </MotionDiv>
        </MotionDiv>
      </div>
    </div>
  );
};

export default ChangePassword; 