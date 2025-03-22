'use client';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { store } from './store/store';
import { queryClient } from '@/lib/query';

const inter = Inter({ subsets: ['latin'] });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <div className={inter.className}>
            {children}
            <Toaster position="top-center" />
          </div>
        </ChakraProvider>
      </QueryClientProvider>
    </Provider>
  );
}