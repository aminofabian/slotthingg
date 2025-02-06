'use client';

import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { verifyOTP } from '@/app/lib/auth';
import Modal from '@/app/components/Modal';
import { FiUser, FiMail, FiLock, FiCalendar, FiPhone, FiMapPin, FiKey } from 'react-icons/fi';
import { useState } from 'react';
import { format } from 'date-fns';
import Select, { SingleValue } from 'react-select';
import { states } from '@/app/lib/states';

const otpSignupSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  whitelabel_admin_uuid: z.string().uuid('Invalid UUID format'),
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
  dob: z.string()
    .min(1, 'Date of birth is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  mobile_number: z.string()
    .min(1, 'Mobile number is required')
    .regex(/^\+[1-9]\d{1,14}$/, 'Must be a valid international phone number starting with +'),
  state: z.string().min(1, 'State is required'),
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
  state: string;
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

type StateOption = {
  label: string;
  value: string;
};

export default function OTPSignupModal({ isOpen, onClose, signupData }: OTPSignupModalProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<OTPSignupFormData>({
    resolver: zodResolver(otpSignupSchema),
    defaultValues: {
      email: signupData.email,
      username: signupData.username,
      whitelabel_admin_uuid: 'c0945d59-d796-402d-8bb5-d1b2029b9eea'
    }
  });

  const selectedDate = watch('dob');

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
        state: data.state,
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
    console.log('Form data being submitted:', {
      username: data.username,
      email: data.email,
      password: data.password,
      otp: data.otp,
      full_name: data.full_name,
      dob: data.dob,
      mobile_number: data.mobile_number,
      state: data.state,
      whitelabel_admin_uuid: data.whitelabel_admin_uuid
    });
    verifyOTPMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">Complete Your Registration</h2>
          <div className="bg-[#00ffff]/5 rounded-lg p-4 border border-[#00ffff]/10">
            <p className="text-[#00ffff]/80">
              An OTP has been sent to <span className="font-medium text-white">{signupData.email}</span>
            </p>
            <p className="text-sm text-[#00ffff]/60 mt-1">
              Your username: <span className="font-mono bg-[#00ffff]/10 px-2 py-1 rounded text-white">{signupData.username}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#00ffff]/80 border-b border-[#00ffff]/10 pb-2 mb-4">
              Account Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
                  Username
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff]/40" />
                  <input
                    {...register('username')}
                    type="text"
                    disabled
                    className={`block w-full rounded-xl border pl-11 ${
                      errors.username ? 'border-red-500' : 'border-[#00ffff]/20'
                    } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                    focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                    backdrop-blur-sm transition-all duration-300
                    hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff]/40" />
                  <input
                    {...register('email')}
                    type="email"
                    disabled
                    className={`block w-full rounded-xl border pl-11 ${
                      errors.email ? 'border-red-500' : 'border-[#00ffff]/20'
                    } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                    focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                    backdrop-blur-sm transition-all duration-300
                    hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
                  OTP Code
                </label>
                <div className="relative">
                  <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff]/40" />
                  <input
                    {...register('otp')}
                    type="text"
                    maxLength={6}
                    className={`block w-full rounded-xl border pl-11 ${
                      errors.otp ? 'border-red-500' : 'border-[#00ffff]/20'
                    } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                    focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                    backdrop-blur-sm transition-all duration-300
                    hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-400">{errors.otp.message}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff]/40" />
                  <input
                    {...register('password')}
                    type="password"
                    className={`block w-full rounded-xl border pl-11 ${
                      errors.password ? 'border-red-500' : 'border-[#00ffff]/20'
                    } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                    focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                    backdrop-blur-sm transition-all duration-300
                    hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                    placeholder="Create a password"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#00ffff]/80 border-b border-[#00ffff]/10 pb-2 mb-4">
              Personal Information
            </h3>
            
            <div className="relative">
              <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff]/40" />
                <input
                  {...register('full_name')}
                  type="text"
                  className={`block w-full rounded-xl border pl-11 ${
                    errors.full_name ? 'border-red-500' : 'border-[#00ffff]/20'
                  } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                  focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                  backdrop-blur-sm transition-all duration-300
                  hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
                  Date of Birth
                </label>
                <div className="relative group">
                  <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff]/40 group-hover:text-[#00ffff]/60 transition-colors duration-200" />
                  <input
                    {...register('dob')}
                    type="date"
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className={`block w-full rounded-xl border pl-11 ${
                      errors.dob ? 'border-red-500' : 'border-[#00ffff]/20'
                    } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                    focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                    backdrop-blur-sm transition-all duration-300
                    hover:border-[#00ffff]/30 hover:bg-white/[0.04]
                    [&::-webkit-calendar-picker-indicator]:bg-[#00ffff]/20
                    [&::-webkit-calendar-picker-indicator]:hover:bg-[#00ffff]/40
                    [&::-webkit-calendar-picker-indicator]:rounded
                    [&::-webkit-calendar-picker-indicator]:p-1
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer
                    [&::-webkit-calendar-picker-indicator]:transition-all
                    [&::-webkit-calendar-picker-indicator]:duration-300
                    [&::-webkit-calendar-picker-indicator]:filter
                    [&::-webkit-calendar-picker-indicator]:invert`}
                    placeholder="YYYY-MM-DD"
                  />
                  {selectedDate && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[#00ffff]/60 text-sm">
                      {format(new Date(selectedDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
                {errors.dob && (
                  <p className="mt-1 text-sm text-red-400">{errors.dob.message}</p>
                )}
                <p className="mt-1 text-xs text-[#00ffff]/40">
                  Please enter your date of birth in YYYY-MM-DD format
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
                  Mobile Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff]/40" />
                  <input
                    {...register('mobile_number')}
                    type="tel"
                    className={`block w-full rounded-xl border pl-11 ${
                      errors.mobile_number ? 'border-red-500' : 'border-[#00ffff]/20'
                    } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                    focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                    backdrop-blur-sm transition-all duration-300
                    hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                    placeholder="+12124567890	"
                  />
                </div>
                {errors.mobile_number && (
                  <p className="mt-1 text-sm text-red-400">{errors.mobile_number.message}</p>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wider uppercase">
                State
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff]/40 z-10" />
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select<StateOption>
                      {...field}
                      options={states}
                      onChange={(newValue: SingleValue<StateOption>) => field.onChange(newValue?.value)}
                      value={field.value ? states.find((option) => option.value === field.value) || null : null}
                      classNames={{
                        control: (state) => 
                          `!rounded-xl !border ${
                            errors.state ? '!border-red-500' : '!border-[#00ffff]/20'
                          } !bg-white/[0.02] !pl-8 !min-h-[54px]
                          ${state.isFocused ? '!border-[#00ffff] !ring-1 !ring-[#00ffff]/50' : ''}
                          hover:!border-[#00ffff]/30 hover:!bg-white/[0.04]`,
                        input: () => '!text-white',
                        singleValue: () => '!text-white',
                        menu: () => '!bg-[#1a1a1a] !border !border-[#00ffff]/20',
                        option: (state) => 
                          `!text-white ${
                            state.isFocused ? '!bg-[#00ffff]/10' : ''
                          } ${
                            state.isSelected ? '!bg-[#00ffff]/20' : ''
                          }`,
                        placeholder: () => '!text-white/30',
                      }}
                      placeholder="Select your state"
                    />
                  )}
                />
              </div>
              {errors.state && (
                <p className="mt-1 text-sm text-red-400">{errors.state.message}</p>
              )}
            </div>
          </div>

          <input
            type="hidden"
            {...register('whitelabel_admin_uuid')}
            value="c0945d59-d796-402d-8bb5-d1b2029b9eea"
          />

          <div className="flex gap-4 mt-8 pt-4 border-t border-[#00ffff]/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#00ffff]/20 bg-transparent px-6 py-4 text-[#00ffff] tracking-[0.2em] uppercase
                hover:bg-[#00ffff]/10 focus:outline-none focus:ring-2 focus:ring-[#00ffff]/50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifyOTPMutation.isPending}
              className="flex-1 rounded-xl border border-[#00ffff]/20 bg-[#00ffff]/10 px-6 py-4 text-[#00ffff] tracking-[0.2em] uppercase
                hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 focus:ring-[#00ffff]/50 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed group"
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