'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import toast from 'react-hot-toast';

const otpSignupSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
});

type OTPSignupFormData = z.infer<typeof otpSignupSchema>;

interface OTPSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  username: string;
}

export default function OTPSignupModal({ isOpen, onClose, email, username }: OTPSignupModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<OTPSignupFormData>({
    resolver: zodResolver(otpSignupSchema)
  });

  const signupMutation = useMutation({
    mutationFn: async (data: OTPSignupFormData) => {
      const response = await fetch('https://serverhub.biz/users/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password: data.password,
          whitelabel_admin_uuid: localStorage.getItem('whitelabel_admin_uuid') || '',
          otp: data.otp,
          full_name: data.full_name,
          email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      return response.json();
    },
    onSuccess: () => {
      reset();
      onClose();
      toast.success('Account created successfully!');
      // You might want to redirect to login or dashboard here
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create account');
    },
  });

  const onSubmit = (data: OTPSignupFormData) => {
    signupMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-[#002222] rounded-2xl border border-[#00ffff]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8">
        <h2 className="text-[#00ffff] text-xl font-light tracking-[0.2em] uppercase text-center mb-6">
          Complete Your Registration
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
              OTP Code
            </label>
            <input
              {...register('otp')}
              type="text"
              maxLength={6}
              className={`block w-full rounded-xl border ${
                errors.otp ? 'border-red-500' : 'border-[#00ffff]/20'
              } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
              focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
              backdrop-blur-sm transition-all duration-300
              hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
              placeholder="Enter 6-digit OTP"
            />
            {errors.otp && (
              <p className="mt-1 text-sm text-red-400">{errors.otp.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
              Full Name
            </label>
            <input
              {...register('full_name')}
              type="text"
              className={`block w-full rounded-xl border ${
                errors.full_name ? 'border-red-500' : 'border-[#00ffff]/20'
              } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
              focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
              backdrop-blur-sm transition-all duration-300
              hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              className={`block w-full rounded-xl border ${
                errors.password ? 'border-red-500' : 'border-[#00ffff]/20'
              } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
              focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
              backdrop-blur-sm transition-all duration-300
              hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
              placeholder="Create a password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#00ffff]/20 bg-transparent px-6 py-3 text-[#00ffff] tracking-[0.2em] uppercase
                hover:bg-[#00ffff]/10 focus:outline-none focus:ring-2 focus:ring-[#00ffff]/50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="flex-1 rounded-xl border border-[#00ffff]/20 bg-[#00ffff]/10 px-6 py-3 text-[#00ffff] tracking-[0.2em] uppercase
                hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 focus:ring-[#00ffff]/50 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signupMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#00ffff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                'Complete'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 