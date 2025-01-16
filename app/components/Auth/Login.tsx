'use client';
import React, { useState } from 'react';
import Logo from '../Logo/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-primary-dark">
      {/* Refined background with subtle pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff05_1px,transparent_1px),linear-gradient(135deg,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,#ffffff20,transparent)]" />
        
        {/* Refined floating orbs */}
        <div className="absolute h-[600px] w-[600px] -left-96 -top-96 bg-primary/20 rounded-full blur-[160px] animate-float-slow" />
        <div className="absolute h-[500px] w-[500px] -right-48 top-1/4 bg-primary-light/10 rounded-full blur-[140px] animate-float-delayed" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg relative">
          {/* Refined floating logo */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-24 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-[40px] rounded-full animate-pulse-slow" />
              <div className="relative scale-150 transform hover:scale-155 transition-transform duration-300">
                <Logo />
              </div>
            </div>
          </div>

          {/* Main card with refined design */}
          <div className="backdrop-blur-xl bg-gradient-to-b from-white/10 to-black/20 rounded-2xl 
            border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] 
            transform transition-all duration-500 
            group">
            
            {/* Elegant top decoration */}
            <div className="relative h-28 overflow-hidden rounded-t-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute inset-0 backdrop-blur-sm" />
            </div>
            
            {/* Form content with refined spacing */}
            <div className="px-12 pb-12 pt-2">
              <div className="text-center">
                <h2 className="text-[2.5rem] font-bold tracking-tight font-playfair">
                  <span className="bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
                    Welcome Back
                  </span>
                </h2>
                <p className="mt-2 text-sm text-gray-200/90 font-montserrat tracking-wide">
                  Sign in to continue your gaming journey
                </p>
              </div>

              <form className="mt-10 space-y-7" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Refined input fields */}
                  <div className="group relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-100/90 mb-2 ml-1 
                      transition-all duration-300 group-hover:text-white font-montserrat tracking-wide">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full rounded-xl border border-white/10 
                        bg-white/5 px-5 py-3.5 text-white placeholder-gray-400
                        focus:border-primary focus:ring-1 focus:ring-primary focus:ring-opacity-50 
                        backdrop-blur-sm transition-all duration-300
                        group-hover:border-primary/30 group-hover:bg-white/10"
                        placeholder="name@example.com"
                      />
                      <div className="absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 
                        group-hover:opacity-100 pointer-events-none border border-primary/20" />
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-100/90 mb-2 ml-1 
                      transition-all duration-300 group-hover:text-white font-montserrat tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-xl border border-white/10 
                        bg-white/5 px-5 py-3.5 text-white placeholder-gray-400
                        focus:border-primary focus:ring-1 focus:ring-primary focus:ring-opacity-50 
                        backdrop-blur-sm transition-all duration-300
                        group-hover:border-primary/30 group-hover:bg-white/10"
                        placeholder="Enter your password"
                      />
                      <div className="absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 
                        group-hover:opacity-100 pointer-events-none border border-primary/20" />
                    </div>
                  </div>
                </div>

                {/* Refined checkbox and forgot password section */}
                <div className="flex items-center justify-between font-montserrat">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded-md border-white/20 bg-white/5 text-primary 
                      focus:ring-1 focus:ring-primary focus:ring-opacity-50 transition-colors duration-200"
                    />
                    <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-100/90">
                      Remember me
                    </label>
                  </div>

                  <a href="/forgot-password" 
                    className="text-sm font-medium text-primary hover:text-primary-light transition-colors duration-200
                    hover:underline decoration-2 underline-offset-4">
                    Forgot password?
                  </a>
                </div>

                {/* Refined submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full rounded-xl 
                  bg-gradient-to-r from-primary to-primary-light px-6 py-4 text-base font-semibold text-white 
                  hover:from-primary-light hover:to-primary focus:outline-none focus:ring-2 
                  focus:ring-primary focus:ring-opacity-30 transition-all duration-300
                  disabled:opacity-70 disabled:cursor-not-allowed
                  font-playfair tracking-wider"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-3 opacity-90" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                        Sign in
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Refined sign up section */}
              <div className="mt-8 text-center text-sm font-montserrat">
                <span className="text-gray-200/90">Don't have an account? </span>
                <a href="/register" 
                  className="font-medium text-primary hover:text-primary-light transition-colors duration-200 
                  hover:underline decoration-2 underline-offset-4 font-playfair">
                  Sign up now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;