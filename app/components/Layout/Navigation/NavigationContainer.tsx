// components/Layout/Navigation/NavigationContainer.tsx
import { FC } from 'react';
import MobileTopNav from '../../Dashboard/MobileTopNav';
import { DesktopNav } from './DesktopNav';
import { NavigationContainerProps } from '@/app/types/navigation';

export const NavigationContainer: FC<NavigationContainerProps> = ({
  children,
  sidebarOpen,
  setSidebarOpen
}) => {
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="sticky top-0 z-40">
      <DesktopNav onMenuClick={toggleSidebar} />
      <MobileTopNav />
      {children}
    </div>
  );
};
