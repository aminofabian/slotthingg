import { create } from 'zustand';

export interface Game {
  id: string;
  name: string;
  image: string;
  gameId: string;
  entries: number;
  active: boolean;
  balance: number;
  safe?: number;
  fallbackImage: string;
  username: string;
  password: string;
}

interface GameStoreState {
  games: Game[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentBalance: number;
  selectedGameId?: string;
  errorModalOpen: boolean;
}

interface GameStoreActions {
  fetchGames: () => Promise<void>;
  updateGameBalance: (gameName: string, balance: number) => void;
}

type GameStore = GameStoreState & GameStoreActions;

const initialGames: Game[] = [
  {
    id: '1',
    name: 'Cash Frenzy',
    image: '/Game Logos/Cashfrenzy.png',
    gameId: 'cashfrenzy_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_cashfrenzy',
    password: '********',
    fallbackImage: '/Game Logos/Cashfrenzy.png'
  },
  {
    id: '2',
    name: 'Cash Machine',
    image: '/Game Logos/Cashmachine.webp',
    gameId: 'cashmachine_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_cashmachine',
    password: '********',
    fallbackImage: '/Game Logos/Cashmachine.webp'
  },
  {
    id: '3',
    name: 'Fire Kirin',
    image: '/Game Logos/Firekirin.png',
    gameId: 'firekirin_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_firekirin',
    password: '********',
    fallbackImage: '/Game Logos/Firekirin.png'
  },
  {
    id: '4',
    name: 'Game Room',
    image: '/Game Logos/Gameroom.png',
    gameId: 'gameroom_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_gameroom',
    password: '********',
    fallbackImage: '/Game Logos/Gameroom.png'
  },
  {
    id: '5',
    name: 'Game Vault',
    image: '/Game Logos/Gamevault.png',
    gameId: 'gamevault_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_gamevault',
    password: '********',
    fallbackImage: '/Game Logos/Gamevault.png'
  },
  {
    id: '6',
    name: 'Juwa',
    image: '/Game Logos/Juwa.png',
    gameId: 'juwa_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_juwa',
    password: '********',
    fallbackImage: '/Game Logos/Juwa.png'
  },
  {
    id: '7',
    name: 'Mafia',
    image: '/Game Logos/Mafia.png',
    gameId: 'mafia_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_mafia',
    password: '********',
    fallbackImage: '/Game Logos/Mafia.png'
  },
  {
    id: '8',
    name: 'Milky Way',
    image: '/Game Logos/Mikyway.png',
    gameId: 'milkyway_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_milkyway',
    password: '********',
    fallbackImage: '/Game Logos/Mikyway.png'
  },
  {
    id: '9',
    name: 'Mr All In One',
    image: '/Game Logos/Mrallinone.png',
    gameId: 'mrallinone_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_mrallinone',
    password: '********',
    fallbackImage: '/Game Logos/Mrallinone.png'
  },
  {
    id: '10',
    name: 'Orion Stars',
    image: '/Game Logos/Orionstars.png',
    gameId: 'orionstars_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_orionstars',
    password: '********',
    fallbackImage: '/Game Logos/Orionstars.png'
  },
  {
    id: '11',
    name: 'Panda Master',
    image: '/Game Logos/Pandamaster.png',
    gameId: 'pandamaster_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_pandamaster',
    password: '********',
    fallbackImage: '/Game Logos/Pandamaster.png'
  },
  {
    id: '12',
    name: 'River Sweeps',
    image: '/Game Logos/Riversweeps.png',
    gameId: 'riversweeps_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_riversweeps',
    password: '********',
    fallbackImage: '/Game Logos/Riversweeps.png'
  },
  {
    id: '13',
    name: 'Ultra Panda',
    image: '/Game Logos/Ultrapanda.webp',
    gameId: 'ultrapanda_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_ultrapanda',
    password: '********',
    fallbackImage: '/Game Logos/Ultrapanda.webp'
  },
  {
    id: '14',
    name: 'VB Link',
    image: '/Game Logos/Vblink.webp',
    gameId: 'vblink_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_vblink',
    password: '********',
    fallbackImage: '/Game Logos/Vblink.webp'
  },
  {
    id: '15',
    name: 'Vegas Sweeps',
    image: '/Game Logos/Vegassweeps.png',
    gameId: 'vegassweeps_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_vegassweeps',
    password: '********',
    fallbackImage: '/Game Logos/Vegassweeps.png'
  }
];

// Create a timestamp to track the last fetch
let lastFetchTimestamp = 0;
let isCurrentlyFetching = false;

const useGameStore = create<GameStore>((set, get) => ({
  games: initialGames,
  isLoading: false,
  isRefreshing: false,
  error: null,
  currentBalance: 0,
  selectedGameId: undefined,
  errorModalOpen: false,

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
      const isFirstLoad = get().games === initialGames;
      
      // Don't set loading state if we already have games
      if (isFirstLoad) {
        set({ isLoading: true, error: null });
      } else {
        set({ isRefreshing: true, error: null });
      }
      
      // Try to refresh token
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        // Only redirect on 401 (unauthorized)
        if (refreshResponse.status === 401) {
          console.log('Token refresh failed with 401, redirecting to login...');
          window.location.href = '/login';
          return;
        }

        // For other errors, continue with games fetch
        if (!refreshResponse.ok) {
          console.warn('Token refresh failed, continuing with existing token...');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Continue with games fetch on network errors
      }

      const response = await fetch('/api/auth/dashboard-games', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      // Handle different response statuses
      if (response.status === 401) {
        console.log('Games fetch failed with 401, redirecting to login...');
        window.location.href = '/login';
        return;
      }

      // For 403 or other errors, keep showing existing games
      if (!response.ok) {
        console.error('Failed to fetch games:', response.status);
        set({ 
          isLoading: false,
          isRefreshing: false,
          // Keep existing games, just update loading state
          error: response.status === 403 ? 'Access denied' : 'Failed to fetch games'
        });
        return;
      }

      const data = await response.json();
      
      if (!data.games) {
        console.error('Invalid response format:', data);
        set({ 
          isLoading: false,
          isRefreshing: false,
          // Keep existing games on invalid response
          error: 'Invalid response format'
        });
        return;
      }

      // Only update state if the data has actually changed
      const currentGames = get().games;
      const hasChanged = JSON.stringify(currentGames) !== JSON.stringify(data.games);
      
      if (hasChanged) {
        set({ 
          games: data.games,
          isLoading: false,
          isRefreshing: false,
          error: null
        });
      } else {
        set({ 
          isLoading: false,
          isRefreshing: false,
          error: null
        });
      }

      lastFetchTimestamp = now;
    } catch (error: any) {
      console.error('Error fetching games:', error);
      set({ 
        isLoading: false,
        isRefreshing: false,
        // Keep existing games on error
        error: error.message || 'Failed to fetch games'
      });
    } finally {
      isCurrentlyFetching = false;
    }
  },

  updateGameBalance: (gameName: string, balance: number) => {
    const { games } = get();
    const updatedGames = games.map(game => 
      game.name === gameName ? { ...game, balance } : game
    );
    set({ games: updatedGames });
  }
}));

export const getDefaultGames = () => initialGames;

export default useGameStore;