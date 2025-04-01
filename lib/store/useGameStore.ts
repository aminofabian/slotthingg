import { create } from 'zustand';

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
        // If token is invalid, remove it from both storage locations
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('authToken');
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          window.location.href = '/login'; // Redirect to login page
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