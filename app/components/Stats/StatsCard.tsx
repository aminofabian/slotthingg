// components/Stats/StatsCard.tsx
import { FC } from 'react';
import { IconType } from 'react-icons';

interface StatsCardProps {
  icon: IconType;
  title: string;
  value: string;
}

export const StatsCard: FC<StatsCardProps> = ({ icon: Icon, title, value }) => (
  <div className="bg-black/40 backdrop-blur-lg border border-primary/20 rounded-lg p-4">
    <div className="flex items-center gap-2 text-primary">
      <Icon className="text-xl" />
      <span className="text-sm">{title}</span>
    </div>
    <span className="text-lg font-bold text-primary-light">{value}</span>
  </div>
);
