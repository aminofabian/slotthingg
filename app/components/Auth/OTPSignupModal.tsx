'use client';

import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { verifyOTP } from '@/app/lib/auth';
import Modal from '@/app/components/Modal';

const otpSignupSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  whitelabel_admin_uuid: z.string().uuid('Invalid UUID format'),
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  State: z.string().min(1, 'Carlifornia is required'),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format')
});

type OTPSignupFormData = z.infer<typeof otpSignupSchema>;

interface VerifyOTPData {
  username: string;
  password: string;
  whitelabel_admin_uuid: string;
  otp: string;
  dob: string;
  mobile_number: string;
  Carlifornia: string;
  full_name: string;
  email: string;
}

interface OTPSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  signupData: {
    email: string;
    username: string;
  };
}

export default function OTPSignupModal({ isOpen, onClose, signupData }: OTPSignupModalProps) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<OTPSignupFormData>({
    resolver: zodResolver(otpSignupSchema)
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: OTPSignupFormData) => {
      return verifyOTP({
        email: data.email,
        username: data.username,
        otp: data.otp,
        password: data.password,
        full_name: data.full_name,
        dob: data.dob,
        mobile_number: data.mobile_number,
        Carlifornia: data.State,
        whitelabel_admin_uuid: data.whitelabel_admin_uuid
      });
    },
    onSuccess: () => {
      toast.success('Account created successfully! You can now log in.');
      onClose();
      router.push('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify OTP');
    },
  });

  const onSubmit = (data: OTPSignupFormData) => {
    verifyOTPMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Complete Your Registration</h2>
        <p className="text-gray-600 mb-4">
          An OTP has been sent to {signupData.email}.<br />
          Your username will be: <span className="font-semibold">{signupData.username}</span>
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
              Username
            </label>
            <input
              {...register('username')}
              type="text"
              className={`block w-full rounded-xl border ${
                errors.username ? 'border-red-500' : 'border-[#00ffff]/20'
              } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
              focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
              backdrop-blur-sm transition-all duration-300
              hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
            )}
          </div>

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
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

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

          <div>
            <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
              Date of Birth
            </label>
            <input
              {...register('dob')}
              type="text"
              className={`block w-full rounded-xl border ${
                errors.dob ? 'border-red-500' : 'border-[#00ffff]/20'
              } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
              focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
              backdrop-blur-sm transition-all duration-300
              hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
              placeholder="MM/DD/YYYY"
            />
            {errors.dob && (
              <p className="mt-1 text-sm text-red-400">{errors.dob.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
              Mobile Number
            </label>
            <input
              {...register('mobile_number')}
              type="tel"
              className={`block w-full rounded-xl border ${
                errors.mobile_number ? 'border-red-500' : 'border-[#00ffff]/20'
              } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
              focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
              backdrop-blur-sm transition-all duration-300
              hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
              placeholder="+1234567890"
            />
            {errors.mobile_number && (
              <p className="mt-1 text-sm text-red-400">{errors.mobile_number.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
              Carlifornia
            </label>
            <input
              {...register('State')}
              type="text"
              className={`block w-full rounded-xl border ${
                errors.State ? 'border-red-500' : 'border-[#00ffff]/20'
              } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
              focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
              backdrop-blur-sm transition-all duration-300
              hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
              placeholder="Carlifornia"
            />
            {errors.State && (
              <p className="mt-1 text-sm text-red-400">{errors.State.message}</p>
            )}
          </div>

          <input
            type="hidden"
            {...register('whitelabel_admin_uuid')}
            value="c0945d59-d796-402d-8bb5-d1b2029b9eea"
          />

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
              disabled={verifyOTPMutation.isPending}
              className="flex-1 rounded-xl border border-[#00ffff]/20 bg-[#00ffff]/10 px-6 py-3 text-[#00ffff] tracking-[0.2em] uppercase
                hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 focus:ring-[#00ffff]/50 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyOTPMutation.isPending ? (
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
    </Modal>
  );
}