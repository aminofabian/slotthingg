'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchDashboardData } from '@/lib/auth';
import ClientLayout from './ClientLayout';
import { usePathname } from 'next/navigation';

const queryClient = new QueryClient();

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password'];

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const initDashboard = async () => {
      try {
        // Skip dashboard fetch for public paths
        if (PUBLIC_PATHS.some(path => pathname?.startsWith(path))) {
          return;
        }

        // Check if we have an auth token
        const hasToken = document.cookie.includes('token=');
        if (!hasToken) {
          return;
        }

        await fetchDashboardData();
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      }
    };

    initDashboard();
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <ClientLayout>{children}</ClientLayout>
    </QueryClientProvider>
  );
} 