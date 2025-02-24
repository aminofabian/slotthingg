'use client';

import { useState, useEffect } from 'react';
import ProfileHeader from '@/app/components/Profile/ProfileHeader';
import StatsGrid from '@/app/components/Profile/StatsGrid';
import ProfileForm from '@/app/components/Profile/ProfileForm';

interface ProfileData {
  username: string;
  email: string;
  full_name: string;
  balance: string;
  cashable_balance: string;
  bonus_balance: string;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const profileStats = {
    balance: profileData ? `$${profileData.balance}` : '$0',
    cashableBalance: profileData ? `$${profileData.cashable_balance}` : '$0',
    bonusBalance: profileData ? `$${profileData.bonus_balance}` : '$0',
    xp: 500
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#002222] pt-20 pb-24 flex items-center justify-center">
        <div className="text-[#00ffff] animate-pulse">Loading profile data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#002222] pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <ProfileHeader 
          username={profileData?.username || 'User'}
          xpLevel={500}
          nextLevel={1000}
        />
        
        <StatsGrid stats={profileStats} />
        
        <div className="bg-black/20 rounded-2xl border border-[#00ffff]/10 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Profile Settings</h3>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
} 