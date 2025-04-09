import { create } from 'zustand';

// Constants for token expiration windows - match with useSessionExpiration.ts
const TOKEN_EXPIRATION_WINDOW = 30 * 24 * 60 * 60 * 1000; // 30 days (extended from 7 days)

function getToken() {
  // Try to get token from localStorage first
  let token = localStorage.getItem('accessToken');
  
  // If not in localStorage, try to get from cookies
  if (!token) {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1].trim();
    }
  }

  // If still no token, try other common token names in localStorage
  if (!token) {
    const possibleTokenNames = ['token', 'auth_token', 'jwt_token', 'authToken'];
    for (const name of possibleTokenNames) {
      token = localStorage.getItem(name);
      if (token) break;
    }
  }

  return token;
}

export interface Game {
  id: number;
  title: string;
  code: string;
  game_status: boolean;
  coming_soon: boolean;
  url: string | null;
  download_url: string | null;
  dashboard_url: string | null;
  game_user: string | null;
  use_game_bonus: boolean;
  allocated_at: string;
  owner: string;
}

interface GameStoreState {
  games: Game[];
  userGames: Game[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface GameStoreActions {
  fetchGames: () => Promise<void>;
}

type GameStore = GameStoreState & GameStoreActions;

const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  userGames: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  fetchGames: async () => {
    try {
      console.log('Starting to fetch games...'); // Debug log
      set({ isLoading: true, error: null });

      const token = getToken();
      console.log('Token check:', {
        localStorage: localStorage.getItem('accessToken') ? 'exists' : 'not found',
        cookies: document.cookie.includes('token=') ? 'exists' : 'not found',
        finalToken: token ? 'found' : 'not found'
      });

      if (!token) {
        console.log('No token found in any storage location');
        set({ 
          isLoading: false, 
          error: 'Please log in to view games',
          games: [],
          userGames: []
        });
        return;
      }

      const response = await fetch('/api/auth/dashboard-games', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });

      console.log('API Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        set({ 
          isLoading: false,
          error: errorData.error || 'Failed to fetch games',
          games: [],
          userGames: []
        });
        
        // If token is invalid (401/403), try refreshing first instead of immediately logging out
        if (response.status === 401 || response.status === 403) {
          try {
            // Check if we're within token validity window - if yes, try refresh
            const loginTimestamp = localStorage.getItem('login_timestamp');
            if (loginTimestamp && Date.now() - parseInt(loginTimestamp) < TOKEN_EXPIRATION_WINDOW) {
              console.log('Attempting token refresh before logout');
              const refreshResponse = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                }
              });
              
              if (refreshResponse.ok) {
                console.log('Token refresh successful, updating timestamp');
                localStorage.setItem('login_timestamp', Date.now().toString());
                // Retry fetching games
                get().fetchGames();
                return;
              }
              
              // Check if it's a temporary error
              try {
                const refreshData = await refreshResponse.json();
                if (refreshData.temporary) {
                  console.warn('Temporary auth server issue, not logging out user');
                  return;
                }
              } catch (parseError) {
                console.error('Error parsing refresh response:', parseError);
              }
            }
            
            // If we get here, we need to log out - preserve user preferences
            const userData = {
              theme: localStorage.getItem('theme'),
              language: localStorage.getItem('language')
              // Add any other non-auth user preferences you want to keep
            };
            
            // Clear auth data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('login_timestamp');
            localStorage.removeItem('user_id');
            localStorage.removeItem('username');
            
            // Restore user preferences
            if (userData.theme) localStorage.setItem('theme', userData.theme);
            if (userData.language) localStorage.setItem('language', userData.language);
            
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/login'; // Redirect to login page
          } catch (refreshError) {
            console.error('Error during token refresh attempt:', refreshError);
            // Only logout on non-network errors
            if (!(refreshError instanceof TypeError && 
                 (refreshError.message.includes('network') || 
                  refreshError.message.includes('fetch') || 
                  refreshError.message.includes('timeout') ||
                  refreshError.message.includes('abort')))) {
              // Logout with preference saving
              const userData = {
                theme: localStorage.getItem('theme'),
                language: localStorage.getItem('language')
              };
              localStorage.clear();
              if (userData.theme) localStorage.setItem('theme', userData.theme);
              if (userData.language) localStorage.setItem('language', userData.language);
              document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              window.location.href = '/login';
            }
          }
        }
        return;
      }

      const data = await response.json();
      console.log('API Response data:', {
        status: data.status,
        message: data.message,
        gamesCount: data.data?.games?.length,
        userGamesCount: data.data?.user_games?.length
      }); // Detailed debug log

      if (!data.data || !Array.isArray(data.data.games) || !Array.isArray(data.data.user_games)) {
        console.error('Invalid response format:', data);
        set({ 
          isLoading: false,
          isRefreshing: false,
          error: 'Invalid response format',
          games: [],
          userGames: []
        });
        return;
      }

      // Log the first game object if it exists
      if (data.data.games.length > 0) {
        console.log('Sample game object:', data.data.games[0]);
      }

      set((state) => {
        console.log('Updating store state:', {
          currentGames: state.games.length,
          newGames: data.data.games.length,
          currentUserGames: state.userGames.length,
          newUserGames: data.data.user_games.length
        });
        
        return { 
          games: data.data.games,
          userGames: data.data.user_games,
          isLoading: false,
          isRefreshing: false,
          error: null
        };
      });

    } catch (error) {
      console.error('Error fetching games:', error);
      set({ 
        isLoading: false,
        isRefreshing: false,
        error: 'Failed to fetch games',
        games: [],
        userGames: []
      });
    }
  }
}));

export default useGameStore;