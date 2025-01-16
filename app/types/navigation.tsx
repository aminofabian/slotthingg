// types/navigation.ts
import { ReactNode } from 'react';

export interface NavigationProps {
  children: ReactNode;
}

export interface SidebarProps {
  isOpen: boolean;
}

export interface NavigationContainerProps extends NavigationProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

export interface DesktopNavProps {
  onMenuClick: () => void;
}
