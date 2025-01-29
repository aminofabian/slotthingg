'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchDashboardData } from '@/lib/auth';
import ClientLayout from './ClientLayout';

const queryClient = new QueryClient();

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const initDashboard = async () => {
      try {
        await fetchDashboardData();
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      }
    };

    initDashboard();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ClientLayout>{children}</ClientLayout>
    </QueryClientProvider>
  );
} 