import React, { useState, useEffect, useCallback } from 'react';

interface UseUserInfoReturn {
  userId: string;
  playerId: string;
  userName: string;
  loadUserInfo: () => void;
}

export const useUserInfo = (): UseUserInfoReturn => {
  const [userId, setUserId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  // Load user name from localStorage
  const loadUserInfo = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // First try to get the name from the auth token or user session
        const userSession = localStorage.getItem('user_session');
        
        if (userSession) {
          try {
            const session = JSON.parse(userSession);
            if (session.user?.name || session.user?.username) {
              setUserName(session.user.name || session.user.username);
              return; // Exit if we found the name
            }
          } catch (e) {
            console.warn('Failed to parse user session');
          }
        }

        // Then try the user profile
        const userProfile = localStorage.getItem('user_profile');
        if (userProfile) {
          try {
            const profile = JSON.parse(userProfile);
            if (profile.name || profile.username) {
              setUserName(profile.name || profile.username);
              return; // Exit if we found the name
            }
          } catch (e) {
            console.warn('Failed to parse user profile');
          }
        }

        // Finally, try individual keys in a specific order of priority
        const nameKeys = [
          'current_username',
          'username',
          'user_name',
          'display_name',
          'name',
          'player_name'
        ];

        for (const key of nameKeys) {
          const storedName = localStorage.getItem(key);
          if (storedName) {
            setUserName(storedName);
            return; // Exit once we find a valid name
          }
        }

        // If we still don't have a name, log a warning
        console.warn('No user name found in localStorage');
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }, []);

  // Load user and player IDs from localStorage
  useEffect(() => {
    // Check if localStorage is available (for SSR compatibility)
    const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
    
    if (isLocalStorageAvailable) {
      try {
        // Try to get user info from user_profile first
        const userProfileStr = localStorage.getItem('user_profile');
        if (userProfileStr) {
          try {
            const userProfile = JSON.parse(userProfileStr);
            if (userProfile) {
              // Get the user's actual ID
              const id = String(userProfile.id || userProfile.user_id);
              
              setUserId(id);
              setPlayerId(id); // Use the same ID for both
              setUserName(userProfile.username || userProfile.name || '');
              return; // Exit if we found the info
            }
          } catch (e) {
            console.warn('Failed to parse user profile');
          }
        }

        // Fallback to individual storage items if profile not found
        const storedUserId = localStorage.getItem('user_id');
        const storedPlayerId = localStorage.getItem('player_id');
        
        if (storedUserId) {
          setUserId(storedUserId);
        }
        
        if (storedPlayerId) {
          setPlayerId(storedPlayerId);
        } else if (storedUserId) {
          // If no player_id but we have user_id, use that
          setPlayerId(storedUserId);
        }
      } catch (error) {
        console.error('Error loading user/player IDs:', error);
      }
    }
  }, []);

  return {
    userId,
    playerId,
    userName,
    loadUserInfo
  };
}; 