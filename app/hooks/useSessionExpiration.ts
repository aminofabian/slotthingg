'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { isAuthRoute } from '@/lib/routes';

// Static flag to prevent multiple initializations
let isInitialized = false;

export function useSessionExpiration() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip for auth routes
    if (isAuthRoute(pathname)) {
      return;
    }

    // Check token immediately on protected routes
    const checkToken = async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (!response.ok) {
          // Clear auth data
          localStorage.clear();
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          
          // Show message and redirect
          toast.error('Your session has expired. Please log in again.');
          window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
          return;
        }
      } catch (error) {
        // Handle network errors same as auth errors
        localStorage.clear();
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        toast.error('Your session has expired. Please log in again.');
        window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
        return;
      }
    };

    // Only run token check once
    if (!isInitialized) {
      isInitialized = true;
      checkToken();
    }

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        const url = args[0]?.toString() || '';

        // Only handle auth errors for non-auth endpoints
        if ((response.status === 401 || response.status === 403) && 
            !url.includes('/api/auth/') && 
            !isAuthRoute(pathname)) {
          // Clear auth data
          localStorage.clear();
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          
          // Show message and redirect
          toast.error('Your session has expired. Please log in again.');
          window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
        }
        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
      isInitialized = false;
    };
  }, [pathname]);
} 