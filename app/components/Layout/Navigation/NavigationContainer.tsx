// components/Layout/Navigation/NavigationContainer.tsx
import { FC } from 'react';
import { NavigationContainerProps } from '../../../types/navigation';
import { DesktopNav } from './DesktopNav';
import MobileTopNav from '../../Dashboard/MobileTopNav';

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
