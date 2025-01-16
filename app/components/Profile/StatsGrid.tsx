import { BiMoney } from 'react-icons/bi';
import { GiTakeMyMoney, GiDiamonds, GiStarsStack } from 'react-icons/gi';

interface ProfileStats {
  balance: string;
  inGames: string;
  diamonds: number;
  xp: number;
}

const StatsGrid = ({ stats }: { stats: ProfileStats }) => {
  const statItems = [
    { label: 'Balance', value: stats.balance, icon: BiMoney },
    { label: 'In games', value: stats.inGames, icon: GiTakeMyMoney },
    { label: 'Diamond', value: stats.diamonds, icon: GiDiamonds },
    { label: 'XP', value: stats.xp, icon: GiStarsStack },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div key={index} className="p-4 rounded-xl bg-[#00ffff]/5 border border-[#00ffff]/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00ffff]/10">
              <item.icon className="w-6 h-6 text-[#00ffff]" />
            </div>
            <div>
              <p className="text-sm text-white/60">{item.label}</p>
              <p className="text-lg font-bold text-white">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid; 