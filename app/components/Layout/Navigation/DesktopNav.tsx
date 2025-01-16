import { FC } from 'react';
import TopNav from '../../Dashboard/TopNav';
import { DesktopNavProps } from '../../../types/navigation';

export const DesktopNav: FC<DesktopNavProps> = ({ onMenuClick }) => (
  <div className="hidden lg:block bg-gray-900 border-b border-gray-800">
    <TopNav onMenuClick={onMenuClick} />
  </div>
);

