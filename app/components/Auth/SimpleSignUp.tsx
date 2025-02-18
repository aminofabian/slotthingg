'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { signupUser } from '@/app/lib/auth';
import { useState, useEffect } from 'react';
import OTPSignupModal from './OTPSignupModal';
import Logo from '../Logo/Logo';
import { UserCircleIcon, ArrowRightIcon } from 'lucide-react';
import { HiLockClosed } from 'react-icons/hi';
import { BiEnvelope, BiEnvelopeOpen } from 'react-icons/bi';
import { IoLockClosed } from 'react-icons/io5';

const signupSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SimpleSignUp() {
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [signupData, setSignupData] = useState<{ email: string; username: string; whitelabel_admin_uuid: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeWhitelabelUUID = async () => {
      try {
        let existingUUID = localStorage.getItem('whitelabel_admin_uuid');
        console.log('Checking for existing UUID:', existingUUID);

        if (!existingUUID) {
          console.log('No existing UUID, setting default UUID');
          existingUUID = 'c0945d59-d796-402d-8bb5-d1b2029b9eea';
          localStorage.setItem('whitelabel_admin_uuid', existingUUID);
        }

        if (existingUUID) {
          console.log('UUID is available:', existingUUID);
          setIsInitialized(true);
        } else {
          console.error('Failed to initialize UUID');
          toast.error('Failed to initialize application. Please refresh the page.');
        }
      } catch (error) {
        console.error('Error during UUID initialization:', error);
        toast.error('Failed to initialize application. Please try again.');
      }
    };

    initializeWhitelabelUUID();
  }, []);

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
      if (!isInitialized) {
        throw new Error('Application not properly initialized. Please wait.');
      }

      const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
      console.log('Retrieved UUID for signup:', whitelabel_admin_uuid);
      
      if (!whitelabel_admin_uuid) {
        throw new Error('Application not properly initialized. Please refresh the page.');
      }

      const result = await signupUser(data.email, data.username, whitelabel_admin_uuid);
      return { ...result, whitelabel_admin_uuid };
    },
    onSuccess: (data) => {
      reset();
      console.log('Setting signup data:', data);
      setSignupData({
        email: data.email,
        username: data.username,
        whitelabel_admin_uuid: data.whitelabel_admin_uuid
      });
      toast.success('OTP has been sent to your email!', { duration: 5000 });
      setIsOTPModalOpen(true);
    },
    onError: (error: Error) => {
      console.error('Detailed signup error:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
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
            <Logo />
              Create Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase flex items-center gap-2">
                  <UserCircleIcon className="w-5 h-5" />
                  Choose Username
                </label>
                <div className="relative">
                  <input
                    {...register('username')}
                    type="text"
                    className={`block w-full rounded-xl border ${
                      errors.username ? 'border-red-500' : 'border-[#00ffff]/20'
                    } bg-white/[0.02] pl-12 pr-5 py-3.5 text-white placeholder-white/30
                    focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                    backdrop-blur-sm transition-all duration-300
                    hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                    placeholder="Pick a unique username"
                    autoComplete="username"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-[#00ffff]/30">@</span>
                  </div>
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.username.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-[#00ffff]/50 flex items-center gap-1">
                  <HiLockClosed className="w-3 h-3" />
                  This will be your public display name
                </p>
              </div>

              <div>
                <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase flex items-center gap-2">
                  <BiEnvelope className="w-5 h-5" />
                  Your Email Address
                </label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    className={`block w-full rounded-xl border ${
                      errors.email ? 'border-red-500' : 'border-[#00ffff]/20'
                    } bg-white/[0.02] pl-12 pr-5 py-3.5 text-white placeholder-white/30
                    focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                    backdrop-blur-sm transition-all duration-300
                    hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BiEnvelopeOpen className="h-6 w-6 text-[#00ffff]/30" />
                  </div>
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.email.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-[#00ffff]/50 flex items-center gap-1">
                  <IoLockClosed className="w-3 h-3" />
                  We'll send a verification code to this email
                </p>
              </div>

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className={`w-full rounded-xl border border-[#00ffff]/20
                  bg-[#00ffff]/10 px-6 py-4 text-[#00ffff] tracking-[0.2em] uppercase
                  hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 
                  focus:ring-[#00ffff]/50 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2`}
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
                  <>
                    Sign Up
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#00ffff]/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#002222] text-white/50">or</span>
                </div>
              </div>

              <div className="mt-6">
                <span className="text-white/50">Already have an account? </span>
                <a
                  href="/login"
                  className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200 flex items-center justify-center gap-2 mt-2"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  Login to your account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {signupData && (
        <OTPSignupModal
          isOpen={isOTPModalOpen}
          onClose={() => setIsOTPModalOpen(false)}
          signupData={signupData}
        />
      )}
    </>
  );
} 