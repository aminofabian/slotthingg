'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { formSchema, type FormData } from '../../lib/query';
import { setFormData, setErrors } from '../store/formSlice';
import { RootState } from '@/app/store/store';
import { motion, HTMLMotionProps } from 'framer-motion';
import Logo from './Logo/Logo';
import toast from 'react-hot-toast';

type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string;
  children?: React.ReactNode;
};

const MotionDiv = MotionDiv as React.FC<MotionDivProps>;

export default function Form() {
  const dispatch = useDispatch();
  const { errors: reduxErrors } = useSelector((state: RootState) => state.form);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');
  const passwordRequirements = {
    length: password?.length >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    number: /[0-9]/.test(password || '')
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data) => {
      dispatch(setFormData(data));
      dispatch(setErrors(null));
      reset();
      toast.success('Form submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit form');
      dispatch(setErrors({ submit: 'Failed to submit form' }));
    },
  });

  const onSubmit = (data: FormData) => {
    toast.promise(
      mutation.mutateAsync(data),
      {
        loading: 'Submitting...',
        success: 'Form submitted successfully!',
        error: (err: Error) => err.message || 'Failed to submit'
      }
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#002222] w-full">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#00ffff05_1px,transparent_1px),linear-gradient(135deg,#00ffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <MotionDiv
          className="w-full max-w-lg relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -top-24 z-10">
            <div className="relative">
              <MotionDiv className="relative z-10 scale-150">
                <Logo />
              </MotionDiv>
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00ffff]/5 rounded-full blur-[100px]" />
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-[#00ffff]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="px-8 pb-8 pt-6">
              <h2 className="text-[#00ffff] text-2xl font-light tracking-[0.3em] uppercase text-center mb-6">
                Submit Form
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                      Name
                    </label>
                    <input
                      {...register('name')}
                      className={`block w-full rounded-xl border ${
                        errors.name ? 'border-red-500' : touchedFields.name ? 'border-green-500/50' : 'border-[#00ffff]/20'
                      } bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
                      focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                      backdrop-blur-sm transition-all duration-300
                      hover:border-[#00ffff]/30 hover:bg-white/[0.04]`}
                      placeholder="Enter your name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-[#00ffff]/80 mb-2 ml-1 tracking-wider uppercase">
                      Email
                    </label>
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
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

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
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
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
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
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
                  disabled={!isValid || mutation.isPending}
                  className={`relative w-full rounded-xl border border-[#00ffff]/20
                    bg-[#00ffff]/10 px-6 py-4 text-[#00ffff] tracking-[0.2em] uppercase
                    hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 
                    focus:ring-[#00ffff]/50 transition-all duration-300
                    disabled:opacity-70 disabled:cursor-not-allowed
                    group overflow-hidden`}
                >
                  {mutation.isPending && (
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
                    {mutation.isPending ? 'Submitting...' : 'Submit'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
} 