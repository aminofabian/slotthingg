'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProfileHeader from '@/app/components/Profile/ProfileHeader';
import StatsGrid from '@/app/components/Profile/StatsGrid';
import ProfileForm from '@/app/components/Profile/ProfileForm';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface ProfileData {
  username: string;
  email: string;
  full_name: string;
  mobile_number: string;
  dob: string;
  state: string;
  balance: string;
  winning_balance: string;
  bonus_balance: string;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Try to refresh the token first
        await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // Clear storage and redirect to login
            localStorage.clear();
            document.cookie = 'token=; Path=/; Max-Age=0';
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  const profileStats = {
    balance: profileData ? `$${profileData.balance}` : '$0',
    winning_balance: profileData ? `$${profileData.winning_balance}` : '$0',
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
        <Link href="/dashboard" className="inline-block text-[#00ffff] hover:text-[#00ffff]/80 mb-4">
          ← Back to Dashboard
        </Link>
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