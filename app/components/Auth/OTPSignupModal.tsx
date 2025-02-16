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
import { useState, useEffect } from 'react';
import { format, isValid } from 'date-fns';
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
    whitelabel_admin_uuid: string;
  };
}

type StateOption = {
  label: string;
  value: string;
};

type DateParts = {
  day: string;
  month: string;
  year: string;
};

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export default function OTPSignupModal({ isOpen, onClose, signupData }: OTPSignupModalProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<OTPSignupFormData>({
    resolver: zodResolver(otpSignupSchema),
    defaultValues: {
      email: signupData.email,
      username: signupData.username,
      whitelabel_admin_uuid: signupData.whitelabel_admin_uuid
    }
  });

  const selectedDate = watch('dob');

  const [dateParts, setDateParts] = useState<DateParts>({ day: '', month: '', year: '' });
  
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear - 18; year++) {
      years.push({ value: year.toString(), label: year.toString() });
    }
    return years;
  };

  const generateDayOptions = () => {
    const days = [];
    for (let day = 1; day <= 31; day++) {
      const value = day.toString().padStart(2, '0');
      days.push({ value, label: value });
    }
    return days;
  };

  const handleDatePartChange = (part: keyof DateParts, value: string) => {
    const newDateParts = { ...dateParts, [part]: value };
    setDateParts(newDateParts);
    
    if (newDateParts.day && newDateParts.month && newDateParts.year) {
      const dateString = `${newDateParts.year}-${newDateParts.month}-${newDateParts.day}`;
      const date = new Date(dateString);
      if (isValid(date)) {
        setValue('dob', dateString);
      }
    }
  };

  const [whitelabelAdminUUID, setWhitelabelAdminUUID] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the UUID from local storage when the component mounts
    const uuid = localStorage.getItem('whitelabel_admin_uuid');
    if (uuid) {
      setWhitelabelAdminUUID(uuid);
    } else {
      console.error('Whitelabel Admin UUID not found in local storage');
    }
  }, []);

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: OTPSignupFormData) => {
      // Ensure the UUID is fetched from local storage
      const payload = {
        email: data.email,
        username: data.username,
        otp: data.otp,
        password: data.password,
        full_name: data.full_name,
        dob: data.dob,
        mobile_number: data.mobile_number,
        state: data.state,
        whitelabel_admin_uuid: whitelabelAdminUUID || ''
      };
      console.log('Payload being sent to verifyOTP:', payload);

      return verifyOTP(payload);
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
      whitelabel_admin_uuid: data.whitelabel_admin_uuid,
      otp: data.otp,
      password: data.password,
      full_name: data.full_name,
      dob: data.dob,
      mobile_number: data.mobile_number,
      state: data.state,
    });
    verifyOTPMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-[#002222]/95 backdrop-blur-xl">
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <div className="w-[800px] max-w-[95vw] bg-[#001111]/80 rounded-2xl border border-[#00ffff]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="max-h-[90vh] overflow-y-auto px-8 py-10 md:p-10">
              {/* Header */}
              <div className="text-center mb-8 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-light text-[#00ffff] tracking-[0.2em] uppercase mb-4">Complete Your Profile</h2>
                <div className="bg-gradient-to-r from-[#00ffff]/5 via-[#00ffff]/10 to-[#00ffff]/5 rounded-xl p-4 md:p-6 border border-[#00ffff]/20">
                  <p className="text-base md:text-lg text-[#00ffff]">
                    An OTP has been sent to <span className="font-medium text-white bg-[#00ffff]/10 px-2 py-1 md:px-3 md:py-1 rounded-lg break-all">{signupData.email}</span>
                  </p>
                  <p className="text-sm md:text-base text-[#00ffff]/80 mt-2">
                    Your username: <span className="font-mono bg-[#00ffff]/20 px-2 py-1 md:px-3 md:py-1 rounded-lg text-white">@{signupData.username}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
                {/* Account Information Section */}
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-lg md:text-xl font-light text-[#00ffff] tracking-[0.2em] uppercase border-b border-[#00ffff]/20 pb-3">
                    Account Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="relative">
                      <label className="block text-sm text-[#00ffff] mb-2 tracking-wider uppercase flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-[#00ffff]" />
                        Username
                      </label>
                      <div className="relative group">
                        <input
                          {...register('username')}
                          type="text"
                          disabled
                          className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] pl-12 pr-4 py-4 text-white
                          backdrop-blur-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                          <span className="text-[#00ffff]">@</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm text-[#00ffff] mb-2 tracking-wider uppercase flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-[#00ffff]" />
                        Email
                      </label>
                      <div className="relative group">
                        <input
                          {...register('email')}
                          type="email"
                          disabled
                          className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] pl-12 pr-4 py-4 text-white
                          backdrop-blur-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                          <FiMail className="w-4 h-4 text-[#00ffff]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="relative">
                      <label className="block text-sm text-[#00ffff] mb-2 tracking-wider uppercase flex items-center gap-2">
                        <FiKey className="w-4 h-4 text-[#00ffff]" />
                        OTP Code
                      </label>
                      <div className="relative group">
                        <input
                          {...register('otp')}
                          type="text"
                          maxLength={6}
                          className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] pl-12 pr-4 py-4 text-white placeholder-white/40
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50 transition-all duration-300
                          hover:border-[#00ffff]/40 group-hover:bg-white/[0.04]"
                          placeholder="Enter 6-digit OTP"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                          <FiKey className="w-4 h-4 text-[#00ffff]" />
                        </div>
                      </div>
                      {errors.otp && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                          <span>⚠️</span>
                          {errors.otp.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm text-[#00ffff] mb-2 tracking-wider uppercase flex items-center gap-2">
                        <FiLock className="w-4 h-4 text-[#00ffff]" />
                        Password
                      </label>
                      <div className="relative group">
                        <input
                          {...register('password')}
                          type="password"
                          className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] pl-12 pr-4 py-4 text-white placeholder-white/40
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50 transition-all duration-300
                          hover:border-[#00ffff]/40 group-hover:bg-white/[0.04]"
                          placeholder="Create a secure password"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                          <FiLock className="w-4 h-4 text-[#00ffff]" />
                        </div>
                      </div>
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                          <span>⚠️</span>
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-lg md:text-xl font-light text-[#00ffff] tracking-[0.2em] uppercase border-b border-[#00ffff]/20 pb-3">
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div className="relative">
                      <label className="block text-sm text-[#00ffff] mb-2 tracking-wider uppercase flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-[#00ffff]" />
                        Full Name
                      </label>
                      <div className="relative group">
                        <input
                          {...register('full_name')}
                          type="text"
                          className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] pl-12 pr-4 py-4 text-white placeholder-white/40
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50 transition-all duration-300
                          hover:border-[#00ffff]/40 group-hover:bg-white/[0.04]"
                          placeholder="Enter your full name"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                          <FiUser className="w-4 h-4 text-[#00ffff]" />
                        </div>
                      </div>
                      {errors.full_name && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                          <span>⚠️</span>
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="relative">
                        <label className="block text-sm text-[#00ffff] mb-2 tracking-wider uppercase flex items-center gap-2">
                          <FiCalendar className="w-4 h-4 text-[#00ffff]" />
                          Date of Birth
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="relative">
                            <label className="block text-xs text-[#00ffff]/60 mb-1">Month</label>
                            <Select
                              options={months}
                              value={months.find(m => m.value === dateParts.month)}
                              onChange={(option) => handleDatePartChange('month', option?.value || '')}
                              classNames={{
                                control: (state) => 
                                  `!rounded-xl !border !border-[#00ffff]/20 !bg-white/[0.02] !min-h-[56px]
                                  ${state.isFocused ? '!border-[#00ffff] !ring-1 !ring-[#00ffff]/50' : ''}
                                  hover:!border-[#00ffff]/40 hover:!bg-white/[0.04]`,
                                input: () => '!text-white',
                                singleValue: () => '!text-white',
                                menu: () => '!bg-[#001a1a] !border !border-[#00ffff]/20 !rounded-xl !mt-2',
                                option: (state) => 
                                  `!text-white !py-3 ${
                                    state.isFocused ? '!bg-[#00ffff]/10' : ''
                                  } ${
                                    state.isSelected ? '!bg-[#00ffff]/20' : ''
                                  }`,
                                placeholder: () => '!text-white/40',
                              }}
                              placeholder="Month"
                            />
                          </div>

                          <div className="relative">
                            <label className="block text-xs text-[#00ffff]/60 mb-1">Day</label>
                            <Select
                              options={generateDayOptions()}
                              value={generateDayOptions().find(d => d.value === dateParts.day)}
                              onChange={(option) => handleDatePartChange('day', option?.value || '')}
                              classNames={{
                                control: (state) => 
                                  `!rounded-xl !border !border-[#00ffff]/20 !bg-white/[0.02] !min-h-[56px]
                                  ${state.isFocused ? '!border-[#00ffff] !ring-1 !ring-[#00ffff]/50' : ''}
                                  hover:!border-[#00ffff]/40 hover:!bg-white/[0.04]`,
                                input: () => '!text-white',
                                singleValue: () => '!text-white',
                                menu: () => '!bg-[#001a1a] !border !border-[#00ffff]/20 !rounded-xl !mt-2 !max-h-[200px] !overflow-y-auto',
                                option: (state) => 
                                  `!text-white !py-3 ${
                                    state.isFocused ? '!bg-[#00ffff]/10' : ''
                                  } ${
                                    state.isSelected ? '!bg-[#00ffff]/20' : ''
                                  }`,
                                placeholder: () => '!text-white/40',
                              }}
                              placeholder="Day"
                            />
                          </div>

                          <div className="relative">
                            <label className="block text-xs text-[#00ffff]/60 mb-1">Year</label>
                            <Select
                              options={generateYearOptions()}
                              value={generateYearOptions().find(y => y.value === dateParts.year)}
                              onChange={(option) => handleDatePartChange('year', option?.value || '')}
                              classNames={{
                                control: (state) => 
                                  `!rounded-xl !border !border-[#00ffff]/20 !bg-white/[0.02] !min-h-[56px]
                                  ${state.isFocused ? '!border-[#00ffff] !ring-1 !ring-[#00ffff]/50' : ''}
                                  hover:!border-[#00ffff]/40 hover:!bg-white/[0.04]`,
                                input: () => '!text-white',
                                singleValue: () => '!text-white',
                                menu: () => '!bg-[#001a1a] !border !border-[#00ffff]/20 !rounded-xl !mt-2 !max-h-[200px] !overflow-y-auto',
                                option: (state) => 
                                  `!text-white !py-3 ${
                                    state.isFocused ? '!bg-[#00ffff]/10' : ''
                                  } ${
                                    state.isSelected ? '!bg-[#00ffff]/20' : ''
                                  }`,
                                placeholder: () => '!text-white/40',
                              }}
                              placeholder="Year"
                            />
                          </div>
                        </div>
                        {errors.dob && (
                          <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                            <span>⚠️</span>
                            {errors.dob.message}
                          </p>
                        )}
                        {dateParts.day && dateParts.month && dateParts.year && (
                          <p className="mt-2 text-sm text-[#00ffff]/60">
                            {format(new Date(`${dateParts.year}-${dateParts.month}-${dateParts.day}`), 'MMMM d, yyyy')}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <label className="block text-sm text-[#00ffff] mb-2 tracking-wider uppercase flex items-center gap-2">
                          <FiPhone className="w-4 h-4 text-[#00ffff]" />
                          Mobile Number
                        </label>
                        <div className="relative group">
                          <input
                            {...register('mobile_number')}
                            type="tel"
                            className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] pl-12 pr-4 py-4 text-white placeholder-white/40
                            focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50 transition-all duration-300
                            hover:border-[#00ffff]/40 group-hover:bg-white/[0.04]"
                            placeholder="+1 (212) 456-7890"
                          />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                            <FiPhone className="w-4 h-4 text-[#00ffff]" />
                          </div>
                        </div>
                        {errors.mobile_number && (
                          <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                            <span>⚠️</span>
                            {errors.mobile_number.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm text-[#00ffff] mb-2 tracking-wider uppercase flex items-center gap-2">
                        <FiMapPin className="w-4 h-4 text-[#00ffff]" />
                        State
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ffff] z-10" />
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
                                  } !bg-white/[0.02] !pl-10 !min-h-[56px]
                                  ${state.isFocused ? '!border-[#00ffff] !ring-1 !ring-[#00ffff]/50' : ''}
                                  hover:!border-[#00ffff]/40 hover:!bg-white/[0.04]`,
                                input: () => '!text-white',
                                singleValue: () => '!text-white',
                                menu: () => '!bg-[#001a1a] !border !border-[#00ffff]/20 !rounded-xl !mt-2',
                                option: (state) => 
                                  `!text-white !py-3 ${
                                    state.isFocused ? '!bg-[#00ffff]/10' : ''
                                  } ${
                                    state.isSelected ? '!bg-[#00ffff]/20' : ''
                                  }`,
                                placeholder: () => '!text-white/40',
                              }}
                              placeholder="Select your state"
                            />
                          )}
                        />
                      </div>
                      {errors.state && (
                        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                          <span>⚠️</span>
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <input
                  type="hidden"
                  {...register('whitelabel_admin_uuid')}
                  value={whitelabelAdminUUID || ''}
                />

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-8 md:mt-10 pt-4 md:pt-6 border-t border-[#00ffff]/20">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:flex-1 rounded-xl border border-[#00ffff]/20 bg-transparent px-6 md:px-8 py-3 md:py-4 text-[#00ffff] tracking-[0.2em] uppercase
                      hover:bg-[#00ffff]/10 focus:outline-none focus:ring-2 focus:ring-[#00ffff]/50 transition-all duration-300
                      flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifyOTPMutation.isPending}
                    className="w-full sm:flex-1 rounded-xl border border-[#00ffff]/20 bg-[#00ffff]/10 px-6 md:px-8 py-3 md:py-4 text-[#00ffff] tracking-[0.2em] uppercase
                      hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 focus:ring-[#00ffff]/50 transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed group
                      flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    {verifyOTPMutation.isPending ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 text-[#00ffff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="whitespace-nowrap">Creating Account...</span>
                      </div>
                    ) : (
                      <span className="whitespace-nowrap">Complete Registration</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}