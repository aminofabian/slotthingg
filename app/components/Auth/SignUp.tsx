'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { signupSchema, type SignupFormData } from '@/lib/query';
import { setFormData, setErrors } from '@/app/store/formSlice';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Logo from '../Logo/Logo';
import { RootState } from '@/app/store/store';

const GAMES = [
  { id: 'panda', name: '🐼 Panda Master' },
  { id: 'juwa', name: '🎮 Juwa' },
  { id: 'orion', name: '⭐ Orion Star' },
  { id: 'fire', name: '🔥 Fire Kirin' },
  { id: 'golden', name: '💎 Golden Treasure' },
  { id: 'egame', name: '🎲 Egame' },
  { id: 'milky', name: '🌌 Milky Way' },
  { id: 'dragon', name: '🐉 Golden Dragon' },
  { id: 'vblink', name: '🔗 Vblink' },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i).toLocaleString('default', { month: 'long' })
}));

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

const Signup = () => {
  const dispatch = useDispatch();
  const { errors: reduxErrors } = useSelector((state: RootState) => state.form);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    watch
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      dateOfBirth: {
        month: '',
        day: '',
        year: ''
      },
      phoneNumber: '',
      address: '',
      referralEmail: '',
      games: [],
      termsAccepted: false
    }
  });

  const password = watch('password');
  const passwordRequirements = {
    length: password?.length >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    number: /[0-9]/.test(password || ''),
    special: /[^A-Za-z0-9]/.test(password || '')
  };

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }
      
      return response.json();
    },
    onSuccess: async (response: Response) => {
      const data = await response.json();
      dispatch(setFormData(data));
      dispatch(setErrors(null));
      reset();
      toast.success('Account created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create account');
    },
  });

  const onSubmit = (data: SignupFormData) => {
    toast.promise(
      signupMutation.mutateAsync(data),
      {
        loading: 'Creating account...',
        success: 'Account created successfully!',
        error: (err: Error) => err.message || 'Failed to create account'
      }
    );
  };

  const onError = (errors: any) => {
    // Show toast for each field error
    const errorMessages = [];

    // Account Details errors
    if (errors.username) errorMessages.push(`Username: ${errors.username.message}`);
    if (errors.email) errorMessages.push(`Email: ${errors.email.message}`);
    if (errors.password) errorMessages.push(`Password: ${errors.password.message}`);
    if (errors.confirmPassword) errorMessages.push(`Confirm Password: ${errors.confirmPassword.message}`);

    // Personal Information errors
    if (errors.firstName) errorMessages.push(`First Name: ${errors.firstName.message}`);
    if (errors.lastName) errorMessages.push(`Last Name: ${errors.lastName.message}`);
    
    // Date of Birth errors
    if (errors.dateOfBirth?.month) errorMessages.push('Date of Birth: Month is required');
    if (errors.dateOfBirth?.day) errorMessages.push('Date of Birth: Day is required');
    if (errors.dateOfBirth?.year) errorMessages.push('Date of Birth: Year is required');
    if (errors.dateOfBirth?.message) errorMessages.push(`Date of Birth: ${errors.dateOfBirth.message}`);

    // Phone Number error
    if (errors.phoneNumber) errorMessages.push(`Phone Number: ${errors.phoneNumber.message}`);

    // Games error
    if (errors.games) errorMessages.push(`Games: ${errors.games.message}`);

    // Terms error
    if (errors.termsAccepted) errorMessages.push(errors.termsAccepted.message);

    // Show all errors in a single toast
    if (errorMessages.length > 0) {
      toast.error(
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Please fix the following errors:</p>
          {errorMessages.map((message, index) => (
            <p key={index} className="text-xs">• {message}</p>
          ))}
        </div>,
        {
          duration: 5000,
          style: {
            maxWidth: '500px',
            background: '#002222',
            color: '#fff',
            border: '1px solid rgba(0, 255, 255, 0.1)',
            fontSize: '0.875rem',
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#002222] w-full py-32">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#00ffff05_1px,transparent_1px),linear-gradient(135deg,#00ffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
      </div>

      <div className="relative flex min-h-screen items-start justify-center px-4">
        <motion.div
          className="w-full max-w-4xl relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -top-16 z-10">
            <div className="relative">
              <motion.div className="relative z-10">
                <Logo />
              </motion.div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#00ffff]/5 rounded-full blur-[80px]" />
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-[#00ffff]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="px-6 md:px-8 pb-8 pt-6">
              <h2 className="text-[#00ffff] text-2xl font-light tracking-[0.3em] uppercase text-center mb-8">
                Create Account
              </h2>

              <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-[#00ffff] text-lg font-light tracking-wider border-b border-[#00ffff]/10 pb-2">
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        Username
                      </label>
                      <input
                        {...register('username')}
                        className={`block w-full rounded-xl border ${
                          errors.username ? 'border-red-500' : touchedFields.username ? 'border-green-500/50' : 'border-[#00ffff]/20'
                        } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                        focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                        backdrop-blur-sm transition-all duration-300
                        hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                        placeholder="Choose a username"
                      />
                      {errors.username && (
                        <p className="mt-0.5 text-xs text-red-400/90 flex items-center">
                          <span className="mr-1 text-xs">⚠️</span>
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          {...register('email')}
                          type="email"
                          className={`block w-full rounded-xl border ${
                            errors.email ? 'border-red-500' : touchedFields.email ? 'border-green-500/50' : 'border-[#00ffff]/20'
                          } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                          backdrop-blur-sm transition-all duration-300
                          hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                          placeholder="Enter your email"
                        />
                        {touchedFields.email && !errors.email && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                        )}
                      </div>
                      {errors.email && (
                        <p className="mt-0.5 text-xs text-red-400/90 flex items-center">
                          <span className="mr-1 text-xs">⚠️</span>
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        Password
                      </label>
                      <input
                        {...register('password')}
                        type="password"
                        className={`block w-full rounded-xl border ${
                          errors.password ? 'border-red-500' : touchedFields.password ? 'border-green-500/50' : 'border-[#00ffff]/20'
                        } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                        focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                        backdrop-blur-sm transition-all duration-300
                        hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                        placeholder="Create a password"
                      />
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
                        <p className={`flex items-center ${passwordRequirements.special ? 'text-green-400' : 'text-white/50'}`}>
                          <span className="mr-1">{passwordRequirements.special ? '✓' : '○'}</span>
                          One special character
                        </p>
                      </div>
                      {errors.password && (
                        <p className="mt-0.5 text-xs text-red-400/90 flex items-center">
                          <span className="mr-1 text-xs">⚠️</span>
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        Confirm Password
                      </label>
                      <input
                        {...register('confirmPassword')}
                        type="password"
                        className={`block w-full rounded-xl border ${
                          errors.confirmPassword ? 'border-red-500' : touchedFields.confirmPassword ? 'border-green-500/50' : 'border-[#00ffff]/20'
                        } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                        focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                        backdrop-blur-sm transition-all duration-300
                        hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                        placeholder="Confirm your password"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-0.5 text-xs text-red-400/90 flex items-center">
                          <span className="mr-1 text-xs">⚠️</span>
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[#00ffff] text-lg font-light tracking-wider border-b border-[#00ffff]/10 pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        First Name
                      </label>
                      <input
                        {...register('firstName')}
                        className={`block w-full rounded-xl border ${
                          errors.firstName ? 'border-red-500' : touchedFields.firstName ? 'border-green-500/50' : 'border-[#00ffff]/20'
                        } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                        focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                        backdrop-blur-sm transition-all duration-300
                        hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="mt-0.5 text-xs text-red-400/90 flex items-center">
                          <span className="mr-1 text-xs">⚠️</span>
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        Last Name
                      </label>
                      <input
                        {...register('lastName')}
                        className={`block w-full rounded-xl border ${
                          errors.lastName ? 'border-red-500' : touchedFields.lastName ? 'border-green-500/50' : 'border-[#00ffff]/20'
                        } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                        focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                        backdrop-blur-sm transition-all duration-300
                        hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="mt-0.5 text-xs text-red-400/90 flex items-center">
                          <span className="mr-1 text-xs">⚠️</span>
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        Date of Birth
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <select
                          {...register('dateOfBirth.month')}
                          className={`block w-full rounded-xl border ${
                            errors.dateOfBirth?.month ? 'border-red-500' : touchedFields.dateOfBirth?.month ? 'border-green-500/50' : 'border-[#00ffff]/20'
                          } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                          backdrop-blur-sm transition-all duration-300
                          hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                        >
                          <option value="" className="bg-[#002222]">Month</option>
                          {MONTHS.map(month => (
                            <option key={month.value} value={month.value} className="bg-[#002222]">
                              {month.label}
                            </option>
                          ))}
                        </select>
                        <select
                          {...register('dateOfBirth.day')}
                          className={`block w-full rounded-xl border ${
                            errors.dateOfBirth?.day ? 'border-red-500' : touchedFields.dateOfBirth?.day ? 'border-green-500/50' : 'border-[#00ffff]/20'
                          } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                          backdrop-blur-sm transition-all duration-300
                          hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                        >
                          <option value="" className="bg-[#002222]">Day</option>
                          {DAYS.map(day => (
                            <option key={day} value={day} className="bg-[#002222]">{day}</option>
                          ))}
                        </select>
                        <select
                          {...register('dateOfBirth.year')}
                          className={`block w-full rounded-xl border ${
                            errors.dateOfBirth?.year ? 'border-red-500' : touchedFields.dateOfBirth?.year ? 'border-green-500/50' : 'border-[#00ffff]/20'
                          } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                          backdrop-blur-sm transition-all duration-300
                          hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                        >
                          <option value="" className="bg-[#002222]">Year</option>
                          {YEARS.map(year => (
                            <option key={year} value={year} className="bg-[#002222]">{year}</option>
                          ))}
                        </select>
                      </div>
                      {(errors.dateOfBirth?.month || errors.dateOfBirth?.day || errors.dateOfBirth?.year) && (
                        <p className="mt-0.5 text-xs text-red-400/90 flex items-center">
                          <span className="mr-1 text-xs">⚠️</span>
                          {errors.dateOfBirth?.message || 'Please complete all date fields'}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-white/50">You must be at least 16 years old</p>
                    </div>

                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          {...register('phoneNumber')}
                          type="tel"
                          className={`block w-full rounded-xl border ${
                            errors.phoneNumber ? 'border-red-500' : touchedFields.phoneNumber ? 'border-green-500/50' : 'border-[#00ffff]/20'
                          } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                          focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                          backdrop-blur-sm transition-all duration-300
                          hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                          placeholder="+1 234 567 8900"
                        />
                        {touchedFields.phoneNumber && !errors.phoneNumber && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</span>
                        )}
                      </div>
                      {errors.phoneNumber && (
                        <p className="mt-0.5 text-xs text-red-400/90 flex items-center">
                          <span className="mr-1 text-xs">⚠️</span>
                          {errors.phoneNumber.message}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-white/50">Enter a valid phone number with country code</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[#00ffff] text-lg font-light tracking-wider border-b border-[#00ffff]/10 pb-2">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        Address (Optional)
                      </label>
                      <input
                        {...register('address')}
                        className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30"
                        placeholder="Enter your address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        Referral Email (Optional)
                      </label>
                      <input
                        {...register('referralEmail')}
                        type="email"
                        className="block w-full rounded-xl border border-[#00ffff]/20 bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30"
                        placeholder="example@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                        Games (Optional)
                      </label>
                      <select
                        multiple
                        {...register('games')}
                        className={`block w-full rounded-xl border ${
                          errors.games ? 'border-red-500' : touchedFields.games ? 'border-green-500/50' : 'border-[#00ffff]/20'
                        } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                        focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                        backdrop-blur-sm transition-all duration-300
                        hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                      >
                        {GAMES.map(game => (
                          <option key={game.id} value={game.id} className="bg-[#002222] py-2">
                            {game.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-sm text-white/50">
                        Hold Ctrl (Windows) or Command (Mac) to select multiple games (max 5)
                      </p>
                      {errors.games && (
                        <p className="mt-0.5 text-xs text-red-400/90 flex items-center">
                          <span className="mr-1 text-xs">⚠️</span>
                          {errors.games.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-3 pt-4">
                    <input
                      type="checkbox"
                      {...register('termsAccepted')}
                      className="h-5 w-5 rounded border-[#00ffff]/20 bg-white/[0.02] text-[#00ffff]"
                    />
                    <label className="text-white/70">
                      By checking this box you agree to our rules, policies and disclaimer, and terms and conditions
                    </label>
                  </div>
                  {errors.termsAccepted && (
                    <p className="mt-0.5 text-xs text-red-400/90 flex items-center">
                      <span className="mr-1 text-xs">⚠️</span>
                      {errors.termsAccepted.message}
                    </p>
                  )}
                </div>

                {reduxErrors?.submit && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm flex items-center">
                      <span className="mr-1">⚠️</span>
                      {reduxErrors.submit}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isValid || signupMutation.isPending}
                  className={`relative w-full rounded-xl border border-[#00ffff]/20
                    bg-[#00ffff]/10 px-6 py-4 text-[#00ffff] tracking-[0.2em] uppercase
                    hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 
                    focus:ring-[#00ffff]/50 transition-all duration-300
                    disabled:opacity-70 disabled:cursor-not-allowed
                    group overflow-hidden`}
                >
                  {signupMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#00ffff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : (
                    'Sign Up'
                  )}
                  
                  {/* Loading bar animation */}
                  {signupMutation.isPending && (
                    <div className="absolute bottom-0 left-0 h-1 bg-[#00ffff]/20 w-full">
                      <div className="h-full bg-[#00ffff] animate-progress-indeterminate" />
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <span className="text-white/50 tracking-wider">Already have an account? </span>
                <a
                  href="/login"
                  className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200 tracking-wider"
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup; 