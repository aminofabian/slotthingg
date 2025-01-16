'use client';
import React, { useState } from 'react';
import Logo from '../Logo/Logo';
import { motion } from 'framer-motion';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: {
      day: '',
      month: '',
      year: ''
    },
    phone: '',
    address: '',
    referralEmail: '',
    games: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    console.log('Form Data:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('dob.')) {
      const dobField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dateOfBirth: {
          ...prev.dateOfBirth,
          [dobField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Generate years for date of birth
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#002222]">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#00ffff05_1px,transparent_1px),linear-gradient(135deg,#00ffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div 
          className="w-full max-w-2xl relative my-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Logo section with glow */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-24 z-10">
            <div className="relative">
              <motion.div 
                className="relative z-10 scale-150"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2, ease: 'easeOut' }}
              >
                <Logo />
              </motion.div>
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00ffff]/5 rounded-full blur-[100px]" />
            </div>
          </div>

          {/* Main card */}
          <motion.div 
            className="backdrop-blur-xl bg-white/[0.02] rounded-2xl 
              border border-[#00ffff]/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]
              overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative h-28 overflow-hidden rounded-t-2xl">
              <div className="absolute inset-0 bg-[#00ffff]/5" />
              <div className="absolute inset-0 backdrop-blur-sm" />
            </div>
            
            <div className="px-8 sm:px-12 pb-12 pt-2">
              <div className="text-center">
                <h2 className="text-[#00ffff] text-2xl md:text-3xl font-light tracking-[0.3em] uppercase mb-4">
                  Join Us
                </h2>
                <p className="text-white/50 text-sm md:text-base tracking-wider">
                  Create your gaming account
                </p>
              </div>

              <form className="mt-10" onSubmit={handleSubmit}>
                {/* Grid layout for form sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Essential Information */}
                  <div className="space-y-6">
                    <div className="space-y-5">
                      <h3 className="text-[#00ffff]/90 text-lg font-light tracking-wider uppercase border-b border-[#00ffff]/10 pb-2">
                        Account Details
                      </h3>
                      
                      <InputField
                        label="Username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />

                      <InputField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />

                      <InputField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      
                      <InputField
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      
                      <p className="text-white/40 text-sm tracking-wide bg-[#00ffff]/5 p-3 rounded-lg">
                        At least 5 characters, but 10 or more is better. Use a combination of upper and lower case letters, numbers and symbols.
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Personal Information */}
                  <div className="space-y-6">
                    <div className="space-y-5">
                      <h3 className="text-[#00ffff]/90 text-lg font-light tracking-wider uppercase border-b border-[#00ffff]/10 pb-2">
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="First Name"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                        <InputField
                          label="Last Name"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Date of Birth with enhanced styling */}
                      <div className="space-y-2">
                        <label className="block text-sm text-[#00ffff]/80 tracking-wider uppercase">
                          Date of Birth
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {/* Month Selection */}
                          <div className="relative group">
                            <select
                              name="dob.month"
                              value={formData.dateOfBirth.month}
                              onChange={handleChange}
                              className="appearance-none w-full bg-white/[0.02] border border-[#00ffff]/20 rounded-xl 
                                text-white px-4 py-3.5 focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                                hover:border-[#00ffff]/30 transition-all duration-300
                                cursor-pointer pr-10"
                              required
                            >
                              <option value="" className="bg-[#002222]">Month</option>
                              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                                'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                                <option key={month} value={index + 1} className="bg-[#002222]">
                                  {month}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="h-5 w-5 text-[#00ffff]/50" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 
                              group-hover:opacity-100 pointer-events-none border border-[#00ffff]/20" />
                          </div>

                          {/* Day Selection */}
                          <div className="relative group">
                            <select
                              name="dob.day"
                              value={formData.dateOfBirth.day}
                              onChange={handleChange}
                              className="appearance-none w-full bg-white/[0.02] border border-[#00ffff]/20 rounded-xl 
                                text-white px-4 py-3.5 focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                                hover:border-[#00ffff]/30 transition-all duration-300
                                cursor-pointer pr-10"
                              required
                            >
                              <option value="" className="bg-[#002222]">Day</option>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                <option key={day} value={day} className="bg-[#002222]">
                                  {day.toString().padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="h-5 w-5 text-[#00ffff]/50" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 
                              group-hover:opacity-100 pointer-events-none border border-[#00ffff]/20" />
                          </div>

                          {/* Year Selection */}
                          <div className="relative group">
                            <select
                              name="dob.year"
                              value={formData.dateOfBirth.year}
                              onChange={handleChange}
                              className="appearance-none w-full bg-white/[0.02] border border-[#00ffff]/20 rounded-xl 
                                text-white px-4 py-3.5 focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                                hover:border-[#00ffff]/30 transition-all duration-300
                                cursor-pointer pr-10"
                              required
                            >
                              <option value="" className="bg-[#002222]">Year</option>
                              {years.map(year => (
                                <option key={year} value={year} className="bg-[#002222]">
                                  {year}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="h-5 w-5 text-[#00ffff]/50" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 
                              group-hover:opacity-100 pointer-events-none border border-[#00ffff]/20" />
                          </div>
                        </div>
                        <p className="text-white/40 text-sm tracking-wide flex items-center gap-2 mt-1">
                          <div className="h-1 w-1 rounded-full bg-[#00ffff]/40" />
                          You must be at least 16 years old
                        </p>
                      </div>

                      <InputField
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 8900"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Information - Full Width */}
                <div className="mt-8 space-y-6">
                  <h3 className="text-[#00ffff]/90 text-lg font-light tracking-wider uppercase border-b border-[#00ffff]/10 pb-2">
                    Additional Information
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField
                      label="Address (Optional)"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                    />

                    <InputField
                      label="Referral Email (Optional)"
                      name="referralEmail"
                      type="email"
                      value={formData.referralEmail}
                      onChange={handleChange}
                      placeholder="example@example.com"
                    />
                  </div>

                  {/* Games Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm text-[#00ffff]/80 tracking-wider uppercase">
                      Games (Optional)
                    </label>
                    <div className="relative">
                      <select
                        name="games"
                        multiple
                        size={5}
                        className="w-full bg-white/[0.02] border border-[#00ffff]/20 rounded-xl 
                          text-white px-4 py-3 focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                          hover:border-[#00ffff]/30 transition-all duration-300
                          [&>option]:p-3 [&>option]:cursor-pointer [&>option]:mb-1
                          [&>option]:rounded-lg [&>option]:transition-colors [&>option]:duration-200
                          [&>option:hover]:bg-[#00ffff]/10 [&>option:checked]:bg-[#00ffff]/20
                          [&>option]:flex [&>option]:items-center [&>option]:gap-2
                          scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-[#00ffff]/20
                          hover:scrollbar-thumb-[#00ffff]/30"
                      >
                        <option value="panda-master" className="game-option">
                          🐼 Panda Master
                        </option>
                        <option value="juwa" className="game-option">
                          🎮 Juwa
                        </option>
                        <option value="orion-star" className="game-option">
                          ⭐ Orion Star
                        </option>
                        <option value="fire-kirin" className="game-option">
                          🔥 Fire Kirin
                        </option>
                        <option value="golden-treasure" className="game-option">
                          💎 Golden Treasure
                        </option>
                        <option value="egame" className="game-option">
                          🎲 Egame
                        </option>
                        <option value="milky-way" className="game-option">
                          🌌 Milky Way
                        </option>
                        <option value="golden-dragon" className="game-option">
                          🐉 Golden Dragon
                        </option>
                        <option value="vblink" className="game-option">
                          🔗 Vblink
                        </option>
                      </select>
                      <div className="absolute inset-0 pointer-events-none rounded-xl 
                        transition-opacity duration-300 opacity-0 
                        group-hover:opacity-100 border border-[#00ffff]/20" 
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1 w-1 rounded-full bg-[#00ffff]/40" />
                      <p className="text-white/40 text-sm tracking-wide">
                        Hold Ctrl (Windows) or Command (Mac) to select multiple games
                      </p>
                    </div>
                    <p className="text-white/40 text-sm tracking-wide flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-[#00ffff]/40" />
                      If you already have a game account just select any of them
                    </p>
                  </div>
                </div>

                {/* Terms and Submit Section */}
                <div className="mt-8 space-y-6">
                  {/* Terms and conditions */}
                  <div className="flex items-start p-4 bg-white/[0.02] rounded-xl border border-[#00ffff]/10">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        className="h-4 w-4 rounded-md border-[#00ffff]/20 bg-white/[0.02] text-[#00ffff]
                        focus:ring-1 focus:ring-[#00ffff]/50 transition-colors duration-200"
                      />
                    </div>
                    <label htmlFor="terms" className="ml-3 block text-sm text-white/50 tracking-wide">
                      By checking this box you agree to our{' '}
                      <a href="/rules" className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200">
                        rules
                      </a>
                      ,{' '}
                      <a href="/policies" className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200">
                        policies and disclaimer
                      </a>
                      , and{' '}
                      <a href="/terms" className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200">
                        terms and conditions
                      </a>
                    </label>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full rounded-xl border border-[#00ffff]/20
                    bg-[#00ffff]/10 px-6 py-4 text-[#00ffff] tracking-[0.2em] uppercase
                    hover:bg-[#00ffff]/20 focus:outline-none focus:ring-2 
                    focus:ring-[#00ffff]/50 transition-all duration-300
                    disabled:opacity-70 disabled:cursor-not-allowed
                    group overflow-hidden"
                  >
                    {isLoading && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-[2px] bg-[#00ffff]/30"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                      >
                        <motion.div
                          className="absolute top-0 left-0 h-full bg-[#00ffff]"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, ease: 'easeInOut' }}
                        />
                      </motion.div>
                    )}
                    <span className="relative flex items-center justify-center">
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </span>
                  </button>

                  {/* Sign in link */}
                  <div className="text-center">
                    <span className="text-white/50 tracking-wider">Already have an account? </span>
                    <a href="/login" 
                      className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200 
                      tracking-wider">
                      Sign in
                    </a>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Reusable Input Field Component
const InputField = ({ 
  label, 
  name, 
  type, 
  value, 
  onChange, 
  required = false,
  placeholder = ''
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}) => (
  <div className="group relative">
    <label htmlFor={name} className="block text-sm text-[#00ffff]/80 mb-2 ml-1 
      tracking-wider uppercase">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="block w-full rounded-xl border border-[#00ffff]/20 
      bg-white/[0.02] px-5 py-3.5 text-white placeholder-white/30
      focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
      backdrop-blur-sm transition-all duration-300
      hover:border-[#00ffff]/30 hover:bg-white/[0.04]"
    />
  </div>
);

export default SignUp; 