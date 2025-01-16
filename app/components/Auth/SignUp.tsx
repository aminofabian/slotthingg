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

              <form className="mt-10 space-y-7" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Basic Information Section */}
                  <div className="space-y-5">
                    <h3 className="text-[#00ffff]/90 text-lg font-light tracking-wider uppercase">
                      Basic Information
                    </h3>
                    
                    {/* Username field */}
                    <InputField
                      label="Username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />

                    {/* Name fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                    {/* Email field */}
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Security Section */}
                  <div className="space-y-5 pt-4">
                    <h3 className="text-[#00ffff]/90 text-lg font-light tracking-wider uppercase">
                      Security
                    </h3>

                    {/* Password fields */}
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
                    <p className="text-white/40 text-sm tracking-wide">
                      At least 5 characters, but 10 or more is better. Use a combination of upper and lower case letters, numbers and symbols.
                    </p>
                  </div>

                  {/* Personal Information Section */}
                  <div className="space-y-5 pt-4">
                    <h3 className="text-[#00ffff]/90 text-lg font-light tracking-wider uppercase">
                      Personal Information
                    </h3>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <label className="block text-sm text-[#00ffff]/80 tracking-wider uppercase">
                        Date of Birth
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <select
                          name="dob.day"
                          value={formData.dateOfBirth.day}
                          onChange={handleChange}
                          className="form-select bg-white/[0.02] border border-[#00ffff]/20 rounded-xl 
                            text-white px-4 py-3 focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                            hover:border-[#00ffff]/30 transition-all duration-300"
                          required
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        <select
                          name="dob.month"
                          value={formData.dateOfBirth.month}
                          onChange={handleChange}
                          className="form-select bg-white/[0.02] border border-[#00ffff]/20 rounded-xl 
                            text-white px-4 py-3 focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                            hover:border-[#00ffff]/30 transition-all duration-300"
                          required
                        >
                          <option value="">Month</option>
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                            'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                            <option key={month} value={index + 1}>{month}</option>
                          ))}
                        </select>
                        <select
                          name="dob.year"
                          value={formData.dateOfBirth.year}
                          onChange={handleChange}
                          className="form-select bg-white/[0.02] border border-[#00ffff]/20 rounded-xl 
                            text-white px-4 py-3 focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                            hover:border-[#00ffff]/30 transition-all duration-300"
                          required
                        >
                          <option value="">Year</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <InputField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      required
                    />

                    {/* Optional Information */}
                    <div className="space-y-5 pt-4">
                      <h3 className="text-[#00ffff]/90 text-lg font-light tracking-wider uppercase">
                        Additional Information
                      </h3>

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

                      {/* Games Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm text-[#00ffff]/80 tracking-wider uppercase">
                          Games (Optional)
                        </label>
                        <select
                          name="games"
                          multiple
                          className="w-full bg-white/[0.02] border border-[#00ffff]/20 rounded-xl 
                            text-white px-4 py-3 focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                            hover:border-[#00ffff]/30 transition-all duration-300"
                        >
                          <option value="game1">Game 1</option>
                          <option value="game2">Game 2</option>
                          <option value="game3">Game 3</option>
                        </select>
                        <p className="text-white/40 text-sm tracking-wide">
                          If you already have a game account just select any of them
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and conditions */}
                <div className="flex items-start pt-4">
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
                <div>
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
                </div>
              </form>

              {/* Sign in link */}
              <div className="mt-8 text-center">
                <span className="text-white/50 tracking-wider">Already have an account? </span>
                <a href="/login" 
                  className="text-[#00ffff]/80 hover:text-[#00ffff] transition-colors duration-200 
                  tracking-wider">
                  Sign in
                </a>
              </div>
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