import { BiMedal } from 'react-icons/bi';
import { FaUserCircle } from 'react-icons/fa';

interface ProfileHeaderProps {
  username: string;
  xpLevel: number;
  nextLevel: number;
}

const ProfileHeader = ({ username, xpLevel, nextLevel }: ProfileHeaderProps) => {
  const progress = (xpLevel / nextLevel) * 100;

  return (
    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#002222] to-black border border-[#00ffff]/10">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#00ffff]/10 flex items-center justify-center">
            <FaUserCircle className="w-16 h-16 text-[#00ffff]/70" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#00ffff]/10 
            flex items-center justify-center border-2 border-black">
            <BiMedal className="w-6 h-6 text-[#00ffff]" />
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">{username}</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#00ffff]">Level {Math.floor(xpLevel/100)}</span>
              <span className="text-white/60">{xpLevel} / {nextLevel} XP</span>
            </div>
            <div className="h-2 rounded-full bg-[#00ffff]/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00ffff] to-[#00ffff]/70 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 