'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

// Session timeout in milliseconds (15 minutes)
const SESSION_TIMEOUT = 15 * 60 * 1000;
// Warning before timeout (2 minutes before)
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000;

export const useSessionExpiration = () => {
  useEffect(() => {
    // Static flag to prevent multiple redirects across remounts
    if (typeof window !== 'undefined') {
      // @ts-ignore
      if (window._isHandlingExpiration) return;
    }

    const handleSessionExpiration = () => {
      // Prevent multiple redirects
      // @ts-ignore
      if (window._isHandlingExpiration) return;
      // @ts-ignore
      window._isHandlingExpiration = true;

      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath);

      // Don't do anything if we're already on an auth page
      if (isAuthPage) {
        // @ts-ignore
        window._isHandlingExpiration = false;
        return;
      }

      // Show message only once
      toast.error('Your session has expired. Redirecting to login...', {
        duration: 3000,
        id: 'session-expired'
      });

      // Clear cookies
      const cookies = ['token', 'refresh_token', 'session_id', 'auth_token', 'access_token'];
      cookies.forEach(cookie => {
        document.cookie = `${cookie}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure`;
      });

      // Clear localStorage
      localStorage.clear();

      // Redirect to login
      const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = redirectUrl;
    };

    const checkTokenExpiration = () => {
      // Skip if already handling expiration
      // @ts-ignore
      if (window._isHandlingExpiration) return;

      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath);

      // Skip checks if on auth page
      if (isAuthPage) return;

      const token = document.cookie.split('; ').find(row => row.startsWith('token='));
      
      // If no token and not on auth page, expire session
      if (!token) {
        handleSessionExpiration();
        return;
      }

      // Check inactivity timeout
      const lastActivityTime = localStorage.getItem('last_activity_time');
      if (lastActivityTime) {
        const currentTime = Date.now();
        const inactivityTime = currentTime - parseInt(lastActivityTime);
        
        if (inactivityTime >= SESSION_TIMEOUT) {
          handleSessionExpiration();
        } else if (inactivityTime >= (SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT)) {
          const timeLeft = Math.ceil((SESSION_TIMEOUT - inactivityTime) / 60000);
          toast.error(`Your session will expire in ${timeLeft} minutes. Please save your work.`, {
            duration: 10000,
            id: 'session-warning'
          });
        }
      } else {
        // Initialize last activity time if not set
        localStorage.setItem('last_activity_time', Date.now().toString());
      }
    };

    // Throttled update activity function
    let activityTimeout: NodeJS.Timeout | null = null;
    const updateActivity = () => {
      if (activityTimeout) return;
      activityTimeout = setTimeout(() => {
        localStorage.setItem('last_activity_time', Date.now().toString());
        activityTimeout = null;
      }, 1000);
    };

    // Attach event listeners
    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });
    window.addEventListener('touchstart', updateActivity, { passive: true });

    // Set up fetch interceptor
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        updateActivity();
        const response = await originalFetch.apply(this, args);
        
        // Only handle 401/403 for non-auth endpoints
        if ((response.status === 401 || response.status === 403)) {
          const url = args[0]?.toString() || '';
          if (!url.includes('/api/auth/')) {
            handleSessionExpiration();
          }
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    };

    // Initial check
    checkTokenExpiration();

    // Set up interval for periodic checks (every 2 minutes)
    const sessionCheckInterval = setInterval(checkTokenExpiration, 120000);

    // Cleanup function
    return () => {
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      clearInterval(sessionCheckInterval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.fetch = originalFetch;
      // @ts-ignore
      window._isHandlingExpiration = false;
    };
  }, []);
}; 