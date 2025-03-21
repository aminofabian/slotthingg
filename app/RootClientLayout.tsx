'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchDashboardData } from '@/lib/auth';
import ClientLayout from './ClientLayout';
import { useSessionExpiration } from './hooks/useSessionExpiration';
import { isProtectedRoute } from '@/lib/routes';

const queryClient = new QueryClient();

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Only use session expiration on protected routes
  if (isProtectedRoute(pathname)) {
    useSessionExpiration();
  }

  useEffect(() => {
    const initDashboard = async () => {
      try {
        await fetchDashboardData();
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      }
    };

    // Only initialize dashboard on protected routes
    if (isProtectedRoute(pathname)) {
      initDashboard();
    }
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <ClientLayout>{children}</ClientLayout>
    </QueryClientProvider>
  );
} 