import ProfileHeader from '@/app/components/Profile/ProfileHeader';
import StatsGrid from '@/app/components/Profile/StatsGrid';
import ProfileForm from '@/app/components/Profile/ProfileForm';

export default function ProfilePage() {
  const profileStats = {
    balance: '$0',
    inGames: '$0',
    diamonds: 0,
    xp: 500
  };

  return (
    <div className="min-h-screen bg-[#002222] pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <ProfileHeader 
          username="aminofabian"
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