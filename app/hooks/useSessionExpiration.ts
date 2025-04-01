'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { isAuthRoute, isProtectedRoute } from '@/lib/routes';

// Static flag to prevent multiple initializations
let isInitialized = false;

export function useSessionExpiration() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip for auth routes and non-protected routes
    if (isAuthRoute(pathname) || !isProtectedRoute(pathname)) {
      return;
    }

    // Check token immediately on protected routes
    const checkToken = async () => {
      try {
        // First try to get a new token
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        // Only clear auth and redirect if refresh explicitly fails
        if (!response.ok) {
          // Don't clear auth data immediately, store the current path first
          const currentPath = window.location.pathname;
          
          // Clear auth data
          localStorage.clear();
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          
          // Show message and redirect
          toast.error('Your session has expired. Please log in again.');
          
          // Use router.push instead of window.location for smoother navigation
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          return;
        }
      } catch (error) {
        // Only redirect on actual auth errors, not network errors
        if (error instanceof Error && error.message.includes('auth')) {
          const currentPath = window.location.pathname;
          localStorage.clear();
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          toast.error('Your session has expired. Please log in again.');
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        return;
      }
    };

    // Only run token check once when component mounts
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
          
          // Try to refresh the token first
          try {
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include'
            });
            
            if (refreshResponse.ok) {
              // If refresh successful, retry the original request
              return await originalFetch(...args);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
          
          // Only if refresh fails, clear auth and redirect
          const currentPath = window.location.pathname;
          localStorage.clear();
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          toast.error('Your session has expired. Please log in again.');
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
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