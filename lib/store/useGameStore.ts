import { create } from 'zustand';

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

// Remove or update initialGames as it's no longer needed in the same format
const initialGames: Game[] = [];

// Create a timestamp to track the last fetch
let lastFetchTimestamp = 0;
let isCurrentlyFetching = false;

const useGameStore = create<GameStore>((set, get) => ({
  games: initialGames,
  userGames: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  fetchGames: async () => {
    // Prevent concurrent fetches
    if (isCurrentlyFetching) {
      console.log('Already fetching games, skipping...');
      return;
    }

    try {
      // Prevent fetching more often than every 30 seconds
      const now = Date.now();
      if (now - lastFetchTimestamp < 30000) {
        console.log('Skipping fetch, too soon since last fetch');
        return;
      }

      isCurrentlyFetching = true;
      console.log('Fetching games...');
      const isFirstLoad = get().games.length === 0;
      
      if (isFirstLoad) {
        set({ isLoading: true, error: null });
      } else {
        set({ isRefreshing: true, error: null });
      }

      const response = await fetch('/api/auth/dashboard-games', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        }
      });

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      if (!data.data || !Array.isArray(data.data.games) || !Array.isArray(data.data.user_games)) {
        console.error('Invalid response format:', data);
        set({ 
          isLoading: false,
          isRefreshing: false,
          error: 'Invalid response format'
        });
        return;
      }

      console.log('Setting games:', {
        allGames: data.data.games.length,
        userGames: data.data.user_games.length
      }); // Debug log

      set({ 
        games: data.data.games,
        userGames: data.data.user_games,
        isLoading: false,
        isRefreshing: false,
        error: null
      });

      lastFetchTimestamp = now;
    } catch (error) {
      console.error('Error fetching games:', error);
      set({ 
        isLoading: false,
        isRefreshing: false,
        error: 'Failed to fetch games'
      });
    } finally {
      isCurrentlyFetching = false;
    }
  }
}));

export const getDefaultGames = () => initialGames;

export default useGameStore;