'use client';
import { FC, useState } from 'react';
import MobileNavbar from '../../Dashboard/MobileNavbar';
import { NavigationProps } from '@/app/types/navigation';
import { NavigationContainer } from './NavigationContainer';
import { Sidebar } from './Sidebar';

export const NavigationLayout: FC<NavigationProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        
        <div className="flex-1 flex flex-col w-full">
          <NavigationContainer 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen}
          >
            <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-[#0f172a] pb-16 lg:pb-0 lg:ml-6">
              {children}
            </main>
          </NavigationContainer>
          
          <MobileNavbar />
        </div>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};