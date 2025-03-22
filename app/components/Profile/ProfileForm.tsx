'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiLock } from 'react-icons/fi';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import ChangePassword from '../Auth/ChangePassword';

type MotionDivProps = HTMLMotionProps<"div"> & {
  className?: string;
  children?: React.ReactNode;
};

const MotionDiv = MotionDiv as React.FC<MotionDivProps>;

interface ProfileField {
  label: string;
  value: string;
  type: string;
  editable?: boolean;
}

interface ProfileData {
  username: string;
  email: string;
  full_name: string;
  dob: string | null;
  mobile_number: string | null;
  state: string | null;
  address: string | null;
  profile_pic: string | null;
  balance: string;
  cashable_balance: string;
  bonus_balance: string;
}

const ProfileForm = () => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // This will send the token cookie
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        console.error('Error fetching profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[#00ffff] animate-pulse">Loading profile data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  const fields: ProfileField[] = [
    { label: 'Username', value: profileData?.username || '', type: 'text' },
    { label: 'Full Name', value: profileData?.full_name || '', type: 'text' },
    { label: 'Email', value: profileData?.email || '', type: 'email' },
    { label: 'Phone Number', value: profileData?.mobile_number || '', type: 'tel' },
    { label: 'Birthday', value: profileData?.dob || '', type: 'date' },
    { label: 'State', value: profileData?.state || '', type: 'text' },
    { label: 'Address', value: profileData?.address || '', type: 'text' },
  ];

  return (
    <>
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={index} className="relative">
            <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wide">
              {field.label}
            </label>
            <div className="relative group">
              <input
                type={field.type}
                value={field.value}
                disabled={editingField !== field.label}
                className="w-full bg-[#00ffff]/5 border border-[#00ffff]/20 rounded-xl px-4 py-3
                  text-white placeholder-white/30 disabled:opacity-80
                  focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                  transition-all duration-300"
              />
              <button
                onClick={() => setEditingField(editingField === field.label ? null : field.label)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2
                  text-[#00ffff]/60 hover:text-[#00ffff] 
                  rounded-lg hover:bg-[#00ffff]/10 transition-all duration-200"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Password Field */}
        <div className="relative">
          <label className="block text-sm text-[#00ffff]/80 mb-2 tracking-wide">
            Password
          </label>
          <div className="relative group">
            <input
              type="password"
              value="••••••••"
              disabled
              className="w-full bg-[#00ffff]/5 border border-[#00ffff]/20 rounded-xl px-4 py-3
                text-white placeholder-white/30 disabled:opacity-80
                focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]/50
                transition-all duration-300"
            />
            <button
              onClick={() => setShowChangePassword(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2
                text-[#00ffff]/60 hover:text-[#00ffff] 
                rounded-lg hover:bg-[#00ffff]/10 transition-all duration-200
                flex items-center gap-2"
            >
              <FiLock className="w-4 h-4" />
              <span className="text-sm">Change</span>
            </button>
          </div>
        </div>

        <button
          className="w-full py-4 mt-8 rounded-xl bg-red-500/10 text-red-500
            border border-red-500/20 hover:bg-red-500/20
            transition-all duration-300 font-medium"
        >
          Delete Account
        </button>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePassword && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <MotionDiv
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg"
            >
              {/* Close button */}
              <button
                onClick={() => setShowChangePassword(false)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white
                  transition-colors duration-200"
              >
                Close
              </button>
              
              <ChangePassword />
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileForm; 