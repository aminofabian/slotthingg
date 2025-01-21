'use client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { SocketProvider } from '@/app/contexts/SocketContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          {children}
          <Toaster position="top-right" />
        </SocketProvider>
      </QueryClientProvider>
    </Provider>
  );
} 