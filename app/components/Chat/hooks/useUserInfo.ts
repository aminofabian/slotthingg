import { useState, useEffect, useCallback } from 'react';

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
        const authToken = localStorage.getItem('auth_token');
        
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
          'current_username',    // Add this as highest priority
          'username',           // Then check username
          'user_name',         // Then user_name
          'display_name',      // Then display_name
          'name',             // Then just name
          'player_name'       // Finally player_name
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
          const userProfile = JSON.parse(userProfileStr);
          if (userProfile) {
            // Get the user's actual ID
            const id = String(userProfile.id || userProfile.user_id);
            console.log('Setting user info from profile:', { id, name: userProfile.username });
            
            setUserId(id);
            setPlayerId(id); // Use the same ID for both
            setUserName(userProfile.username || userProfile.name || '');
            return; // Exit if we found the info
          }
        }

        // Fallback to individual storage items if profile not found
        const storedUserId = localStorage.getItem('user_id');
        const storedPlayerId = localStorage.getItem('player_id');
        
        if (storedUserId) {
          console.log('Setting user ID from storage:', storedUserId);
          setUserId(storedUserId);
        }
        
        if (storedPlayerId) {
          console.log('Setting player ID from storage:', storedPlayerId);
          setPlayerId(storedPlayerId);
        } else if (storedUserId) {
          // If no player_id but we have user_id, use that
          console.log('Using user ID as player ID:', storedUserId);
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