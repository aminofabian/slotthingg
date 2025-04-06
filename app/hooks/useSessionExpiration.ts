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

    let isTokenRefreshing = false;
    let tokenCheckInterval: NodeJS.Timeout;

    // Check token every 5 minutes instead of immediately
    const checkToken = async () => {
      // Prevent multiple simultaneous refresh attempts
      if (isTokenRefreshing) return;
      
      try {
        isTokenRefreshing = true;
        
        // First check if we have a recent login timestamp
        const loginTimestamp = localStorage.getItem('login_timestamp');
        if (loginTimestamp) {
          const lastLogin = parseInt(loginTimestamp);
          const now = Date.now();
          // If last login was less than 6 days ago, skip refresh
          if (now - lastLogin < 6 * 24 * 60 * 60 * 1000) {
            return;
          }
        }

        // Try to refresh the token
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (response.ok) {
          // Update login timestamp on successful refresh
          localStorage.setItem('login_timestamp', Date.now().toString());
        } else {
          // Only clear auth and redirect if refresh explicitly fails
          // AND we're past the token expiration window
          const loginTimestamp = localStorage.getItem('login_timestamp');
          if (!loginTimestamp || Date.now() - parseInt(loginTimestamp) > 7 * 24 * 60 * 60 * 1000) {
            const currentPath = window.location.pathname;
            localStorage.clear();
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            toast.error('Your session has expired. Please log in again.');
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        // Only redirect on actual auth errors after token expiration
        if (error instanceof Error && error.message.includes('auth')) {
          const loginTimestamp = localStorage.getItem('login_timestamp');
          if (!loginTimestamp || Date.now() - parseInt(loginTimestamp) > 7 * 24 * 60 * 60 * 1000) {
            const currentPath = window.location.pathname;
            localStorage.clear();
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            toast.error('Your session has expired. Please log in again.');
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      } finally {
        isTokenRefreshing = false;
      }
    };

    // Only initialize token check after component mounts
    if (!isInitialized) {
      isInitialized = true;
      // Initial check after 5 minutes
      const initialCheck = setTimeout(checkToken, 5 * 60 * 1000);
      // Then check every 30 minutes
      tokenCheckInterval = setInterval(checkToken, 30 * 60 * 1000);

      return () => {
        clearTimeout(initialCheck);
        clearInterval(tokenCheckInterval);
        isInitialized = false;
      };
    }
  }, [pathname]);
} 