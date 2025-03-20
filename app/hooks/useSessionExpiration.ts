'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

// Session timeout in milliseconds (15 minutes)
const SESSION_TIMEOUT = 15 * 60 * 1000;
// Warning before timeout (2 minutes before)
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000;

export const useSessionExpiration = () => {
  useEffect(() => {
    const handleSessionExpiration = () => {
      console.log('Session expiration triggered');
      
      // First show the message to ensure user sees it
      toast.error('Your session has expired. Redirecting to login...', {
        duration: 3000,
      });

      try {
        // Clear all authentication data
        console.log('Clearing localStorage...');
        localStorage.clear();
        
        // Clear all auth-related cookies
        const cookies = [
          'token',
          'refresh_token',
          'session_id',
          'auth_token',
          'access_token'
        ];
        
        console.log('Clearing cookies...');
        cookies.forEach(cookie => {
          document.cookie = `${cookie}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax; Secure`;
        });
        
        // Get current path for redirect after login
        const currentPath = window.location.pathname;
        const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath);
        
        // Only add redirect if not already on an auth page
        const redirectPath = isAuthPage ? '/login' : `/login?redirect=${encodeURIComponent(currentPath)}`;
        
        console.log('Redirecting to:', redirectPath);
        
        // Force immediate logout and redirect
        window.location.replace(redirectPath);
      } catch (error) {
        console.error('Error during session expiration:', error);
        // Fallback redirect
        window.location.href = '/login';
      }
    };

    // Function to check token expiration
    const checkTokenExpiration = () => {
      console.log('Checking token expiration...');
      
      const token = document.cookie.split('; ').find(row => row.startsWith('token='));
      const lastActivityTime = localStorage.getItem('last_activity_time');
      const currentTime = Date.now();

      console.log('Token exists:', !!token);
      console.log('Last activity time:', lastActivityTime);

      // If no token, handle expiration immediately
      if (!token) {
        console.log('No token found, triggering session expiration');
        const currentPath = window.location.pathname;
        const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath);
        if (!isAuthPage) {
          handleSessionExpiration();
          return;
        }
      }

      // Check if session has exceeded timeout based on last activity
      if (lastActivityTime) {
        const inactivityTime = currentTime - parseInt(lastActivityTime);
        console.log('Inactivity time (minutes):', Math.floor(inactivityTime / 60000));
        
        // If session has exceeded timeout, handle expiration
        if (inactivityTime >= SESSION_TIMEOUT) {
          console.log('Session timeout exceeded, triggering expiration');
          handleSessionExpiration();
          return;
        }

        // Show warning if close to timeout
        if (inactivityTime >= (SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT)) {
          const timeLeft = Math.ceil((SESSION_TIMEOUT - inactivityTime) / 60000);
          console.log('Session expiring soon, showing warning. Minutes left:', timeLeft);
          toast.error(`Your session will expire in ${timeLeft} minutes. Please save your work.`, {
            duration: 10000,
            id: 'session-warning'
          });
        }
      } else {
        console.log('No last activity time found, initializing...');
        localStorage.setItem('last_activity_time', currentTime.toString());
      }
    };

    // Throttled update activity function to prevent too many localStorage writes
    let activityTimeout: NodeJS.Timeout | null = null;
    const updateActivity = () => {
      if (activityTimeout) {
        return;
      }
      activityTimeout = setTimeout(() => {
        const currentTime = Date.now().toString();
        localStorage.setItem('last_activity_time', currentTime);
        console.log('Activity updated:', new Date(parseInt(currentTime)).toISOString());
        activityTimeout = null;
      }, 1000);
    };

    // Track user activity
    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });
    window.addEventListener('touchstart', updateActivity, { passive: true });

    // Set up fetch interceptor
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      try {
        updateActivity(); // Update activity on API calls
        const response = await originalFetch.apply(this, args);
        
        // Check if response indicates session expiration
        if (response.status === 401 || response.status === 403) {
          console.log('Received unauthorized response:', response.status);
          const url = args[0]?.toString() || '';
          
          // Skip for auth-related endpoints to avoid loops
          if (!url.includes('/api/auth/')) {
            handleSessionExpiration();
          }
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        // If there's a network error, check if it's due to session expiration
        checkTokenExpiration();
        throw error;
      }
    };

    // Initialize last activity time
    const initialTime = Date.now().toString();
    localStorage.setItem('last_activity_time', initialTime);
    console.log('Session monitoring initialized at:', new Date(parseInt(initialTime)).toISOString());

    // Check token expiration more frequently (every 15 seconds)
    const intervalId = setInterval(checkTokenExpiration, 15000);

    // Initial check
    checkTokenExpiration();

    // Cleanup function
    return () => {
      console.log('Cleaning up session monitoring...');
      window.fetch = originalFetch;
      clearInterval(intervalId);
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);
}; 