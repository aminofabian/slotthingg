'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { isAuthRoute, isProtectedRoute } from '@/lib/routes';

// Constants for token expiration windows
const TOKEN_REFRESH_WINDOW = 28 * 24 * 60 * 60 * 1000; // 28 days (extended from 6 days)
const TOKEN_EXPIRATION_WINDOW = 30 * 24 * 60 * 60 * 1000; // 30 days (extended from 7 days)

export function useSessionExpiration() {
  const pathname = usePathname();
  // Use a ref instead of a static variable to track initialization
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Skip for auth routes and non-protected routes
    if (isAuthRoute(pathname) || !isProtectedRoute(pathname)) {
      return;
    }

    let isTokenRefreshing = false;
    let tokenCheckInterval: NodeJS.Timeout;
    let initialCheck: NodeJS.Timeout;

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
          if (now - lastLogin < TOKEN_REFRESH_WINDOW) {
            isTokenRefreshing = false;
            return;
          }
        }

        // Try to refresh the token
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          // Add headers to prevent caching
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          }
        });
        
        if (response.ok) {
          // Update login timestamp on successful refresh
          localStorage.setItem('login_timestamp', Date.now().toString());
        } else {
          // Check if the server is explicitly returning an auth error (not just a network issue)
          const responseData = await response.json().catch(() => ({ error: 'Unknown error' }));
          
          // Only clear auth and redirect if refresh explicitly fails with auth error
          // AND we're past the token expiration window
          const loginTimestamp = localStorage.getItem('login_timestamp');
          if (
            responseData.error?.includes('Token') && 
            (!loginTimestamp || Date.now() - parseInt(loginTimestamp) > TOKEN_EXPIRATION_WINDOW)
          ) {
            const currentPath = window.location.pathname;
            // Preserve user data except auth tokens
            const userData = { 
              theme: localStorage.getItem('theme'),
              language: localStorage.getItem('language')
              // Add any other non-auth user preferences you want to keep
            };
            localStorage.clear();
            // Restore user preferences
            if (userData.theme) localStorage.setItem('theme', userData.theme);
            if (userData.language) localStorage.setItem('language', userData.language);
            
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            toast.error('Your session has expired. Please log in again.');
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        // Only redirect on actual auth errors after token expiration
        // Don't logout on network errors
        if (
          error instanceof Error && 
          error.message.includes('auth') && 
          !(error.message.includes('network') || error.message.includes('timeout') || error.message.includes('connection'))
        ) {
          const loginTimestamp = localStorage.getItem('login_timestamp');
          if (!loginTimestamp || Date.now() - parseInt(loginTimestamp) > TOKEN_EXPIRATION_WINDOW) {
            const currentPath = window.location.pathname;
            // Preserve user data except auth tokens
            const userData = {
              theme: localStorage.getItem('theme'),
              language: localStorage.getItem('language')
              // Add any other non-auth user preferences you want to keep
            };
            localStorage.clear();
            // Restore user preferences
            if (userData.theme) localStorage.setItem('theme', userData.theme);
            if (userData.language) localStorage.setItem('language', userData.language);
            
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            toast.error('Your session has expired. Please log in again.');
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
      } finally {
        isTokenRefreshing = false;
      }
    };

    // Only initialize token check after component mounts and if not already initialized
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      
      // Initial check after 5 minutes
      initialCheck = setTimeout(checkToken, 5 * 60 * 1000);
      
      // Then check every 30 minutes
      tokenCheckInterval = setInterval(checkToken, 30 * 60 * 1000);
    }

    // Cleanup function to prevent memory leaks
    return () => {
      clearTimeout(initialCheck);
      clearInterval(tokenCheckInterval);
      // Don't reset isInitializedRef here - we want to keep track across remounts
    };
  }, [pathname]);
} 