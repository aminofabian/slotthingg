// components/Layout/Navigation/Sidebar.tsx
import { FC } from 'react';
import { SidebarProps } from '../../../types/navigation';
import Navbar from '../../Dashboard/Navbar';

export const Sidebar: FC<SidebarProps> = ({ isOpen }) => (
  <div
    className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 
      border-r border-gray-800 transform transition-transform 
      duration-300 ease-in-out hidden lg:block lg:relative
      ${!isOpen ? '-translate-x-full lg:translate-x-0' : ''}
    `}
  >
    <Navbar />
  </div>
);
