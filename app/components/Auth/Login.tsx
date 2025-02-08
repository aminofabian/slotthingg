'use client';
import React, { useState } from 'react';
import Logo from '../Logo/Logo';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchDashboardData } from '@/lib/auth';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const Login = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      let whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
      
      // If UUID is missing, fetch it from the dashboard endpoint
      if (!whitelabel_admin_uuid) {
        try {
          const dashboardData = await fetchDashboardData();
          whitelabel_admin_uuid = dashboardData.data.whitelabel_admin_uuid;
        } catch (error) {
          console.error('Failed to fetch whitelabel UUID:', error);
          throw new Error('Failed to initialize application. Please try again.');
        }
      }

      try {
        const requestData = {
          username: data.username,
          password: data.password,
          whitelabel_admin_uuid
        };

        // Log the request data
        console.log('Login Request:', {
          ...requestData,
          url: 'https://serverhub.biz/users/login'
        });

        const response = await fetch('https://serverhub.biz/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        // Log response details
        console.log('Response Status:', response.status);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

        // First get the raw text response
        const responseText = await response.text();
        console.log('Raw Response:', responseText);

        // Try to parse it as JSON
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', responseText.substring(0, 200));
          throw new Error('Server returned an invalid response. Please try again later.');
        }

        if (!response.ok) {
          throw new Error(responseData.message || responseData.detail || 'Login failed');
        }

        return responseData;
      } catch (error: any) {
        console.error('Login error details:', {
          message: error.message,
          stack: error.stack,
          error
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Login success data:', data);
      reset();
      
      // Store auth tokens
      if (data.auth_token) {
        localStorage.setItem('token', data.auth_token.access);
        localStorage.setItem('refresh_token', data.auth_token.refresh);
      }
      
      // Store user data
      localStorage.setItem('user_id', data.pk.toString());
      localStorage.setItem('user_role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('last_login', data.last_login);
      
      toast.success('Login successful!');
      window.location.href = '/dashboard';
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      const whitelabel_admin_uuid = localStorage.getItem('whitelabel_admin_uuid');
      
      try {
        const response = await fetch('https://serverhub.biz/users/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: data.email,
            whitelabel_admin_uuid
          })
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || responseData.detail || 'Failed to process request');
        }

        return responseData;
      } catch (error: any) {
        console.error('Forgot password error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Password reset instructions have been sent to your email');
      setShowForgotPassword(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process request');
    }
  });

  const {
    register: registerForgotPassword,
    handleSubmit: handleForgotPasswordSubmit,
    formState: { errors: forgotPasswordErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange'
  });

  const onSubmit = (data: LoginFormData) => {
    toast.promise(
      loginMutation.mutateAsync(data),
      {
        loading: 'Logging in...',
        success: 'Welcome back!',
        error: (err: Error) => err.message || 'Failed to login'
      }
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#002222] w-full">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#00ffff05_1px,transparent_1px),linear-gradient(135deg,#00ffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md relative"
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

          <div className="backdrop-blur-xl bg-white/[0.02] rounded-2xl border border-[#00ffff]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8">
            <h2 className="text-[#00ffff] text-2xl font-light tracking-[0.3em] uppercase text-center mb-8">
              Welcome Back
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.username.message}
                  </p>
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
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className={`w-full rounded-xl border border-[#00ffff]/20
                  bg-[#00ffff]/10 px-6 py-4 text-[#00ffff] tracking-[0.2em] uppercase
                  hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 
                  focus:ring-[#00ffff]/50 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#00ffff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-white/50">Don't have an account? </span>
              <a
                href="/signup"
                className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200"
              >
                Sign up
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Reset Password</h2>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleForgotPasswordSubmit((data) => forgotPasswordMutation.mutate(data))}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  {...registerForgotPassword('email')}
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter your email"
                />
                {forgotPasswordErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{forgotPasswordErrors.email.message}</p>
                )}
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {forgotPasswordMutation.isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;