'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { signupUser } from '@/lib/auth';
import { useState } from 'react';
import OTPSignupModal from './OTPSignupModal';

const signupSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SimpleSignUp() {
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [signupData, setSignupData] = useState<{ email: string; username: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      return signupUser(data.email);
    },
    onSuccess: (data) => {
      reset();
      toast.success('OTP has been sent to your email!');
      setSignupData({ email: data.email, username: data.username });
      setIsOTPModalOpen(true);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send OTP');
    },
  });

  const onSubmit = (data: SignupFormData) => {
    toast.promise(
      signupMutation.mutateAsync(data),
      {
        loading: 'Sending OTP...',
        success: 'OTP sent successfully!',
        error: (err: Error) => err.message || 'Failed to send OTP'
      }
    );
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#002222] p-4">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-[#00ffff]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8">
            <h2 className="text-[#00ffff] text-2xl font-light tracking-[0.3em] uppercase text-center mb-8">
              Create Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={`block w-full rounded-xl border ${
                    errors.email ? 'border-red-500' : 'border-[#00ffff]/20'
                  } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                  focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                  backdrop-blur-sm transition-all duration-300
                  hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className={`w-full rounded-xl border border-[#00ffff]/20
                  bg-[#00ffff]/10 px-6 py-4 text-[#00ffff] tracking-[0.2em] uppercase
                  hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 
                  focus:ring-[#00ffff]/50 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {signupMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#00ffff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </div>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-white/50">Already have an account? </span>
              <a
                href="/login"
                className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>

      {signupData && (
        <OTPSignupModal
          isOpen={isOTPModalOpen}
          onClose={() => setIsOTPModalOpen(false)}
          email={signupData.email}
          username={signupData.username}
        />
      )}
    </>
  );
} 