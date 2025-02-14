'use client';

import { useState } from 'react';
import { FiEdit2, FiLock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ChangePassword from '../Auth/ChangePassword';

interface ProfileField {
  label: string;
  value: string;
  type: string;
  editable?: boolean;
}

const ProfileForm = () => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const fields: ProfileField[] = [
    { label: 'Username', value: 'aminofabian', type: 'text' },
    { label: 'Name', value: 'Fabian', type: 'text' },
    { label: 'Last Name', value: 'Amino', type: 'text' },
    { label: 'Email', value: 'aminofabian@gmail.com', type: 'email' },
    { label: 'Phone Number', value: '0714282874', type: 'tel' },
    { label: 'Birthday', value: '06/27/1998', type: 'date' },
    { label: 'Address', value: '', type: 'text' },
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileForm; 