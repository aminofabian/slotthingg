'use client';

import { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';

interface ProfileField {
  label: string;
  value: string;
  type: string;
  editable?: boolean;
}

const ProfileForm = () => {
  const [editingField, setEditingField] = useState<string | null>(null);

  const fields: ProfileField[] = [
    { label: 'Username', value: 'aminofabian', type: 'text' },
    { label: 'Name', value: 'Fabian', type: 'text' },
    { label: 'Last Name', value: 'Amino', type: 'text' },
    { label: 'Email', value: 'aminofabian@gmail.com', type: 'email' },
    { label: 'Password', value: '**************', type: 'password' },
    { label: 'Phone Number', value: '0714282874', type: 'tel' },
    { label: 'Birthday', value: '06/27/1998', type: 'date' },
    { label: 'Address', value: '', type: 'text' },
  ];

  return (
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

      <button
        className="w-full py-4 mt-8 rounded-xl bg-red-500/10 text-red-500
          border border-red-500/20 hover:bg-red-500/20
          transition-all duration-300 font-medium"
      >
        Delete Account
      </button>
    </div>
  );
};

export default ProfileForm; 