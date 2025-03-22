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
    name: 'Fire Kirin',
    image: '/Game Logos/games/FIRE-KIRIN.png',
    gameId: 'firekirin_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_firekirin',
    password: '********',
    fallbackImage: '/Game Logos/games/FIRE-KIRIN.png'
  },
  {
    id: '2',
    name: 'Game Vault',
    image: '/Game Logos/games/GAME-VAULT.jpg',
    gameId: 'gamevault_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_gamevault',
    password: '********',
    fallbackImage: '/Game Logos/games/GAME-VAULT.jpg'
  },
  {
    id: '3',
    name: 'Game Room',
    image: '/Game Logos/games/GAMEROOM.jpg',
    gameId: 'gameroom_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_gameroom',
    password: '********',
    fallbackImage: '/Game Logos/games/GAMEROOM.jpg'
  },
  {
    id: '4',
    name: 'Golden Dragon',
    image: '/Game Logos/games/GOLDEN-DRAGON.png',
    gameId: 'goldendragon_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_goldendragon',
    password: '********',
    fallbackImage: '/Game Logos/games/GOLDEN-DRAGON.png'
  },
  {
    id: '5',
    name: 'Juwa',
    image: '/Game Logos/games/JUWA.png',
    gameId: 'juwa_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_juwa',
    password: '********',
    fallbackImage: '/Game Logos/games/JUWA.png'
  },
  {
    id: '6',
    name: 'Machine',
    image: '/Game Logos/games/MACHINE.jpg',
    gameId: 'machine_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_machine',
    password: '********',
    fallbackImage: '/Game Logos/games/MACHINE.jpg'
  },
  {
    id: '7',
    name: 'Mafia',
    image: '/Game Logos/games/MAFIA.png',
    gameId: 'mafia_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_mafia',
    password: '********',
    fallbackImage: '/Game Logos/games/MAFIA.png'
  },
  {
    id: '8',
    name: 'Milky Way',
    image: '/Game Logos/games/MILKY-WAY.png',
    gameId: 'milkyway_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_milkyway',
    password: '********',
    fallbackImage: '/Game Logos/games/MILKY-WAY.png'
  },
  {
    id: '9',
    name: 'Orion Star',
    image: '/Game Logos/games/ORION-STAR.png',
    gameId: 'orionstar_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_orionstar',
    password: '********',
    fallbackImage: '/Game Logos/games/ORION-STAR.png'
  },
  {
    id: '10',
    name: 'Panda Master',
    image: '/Game Logos/games/PANDA-MASTER (1).png',
    gameId: 'pandamaster_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_pandamaster',
    password: '********',
    fallbackImage: '/Game Logos/games/PANDA-MASTER (1).png'
  },
  {
    id: '11',
    name: 'Ultra Panda',
    image: '/Game Logos/games/ULTRA-PANDA.png',
    gameId: 'ultrapanda_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_ultrapanda',
    password: '********',
    fallbackImage: '/Game Logos/games/ULTRA-PANDA.png'
  },
  {
    id: '12',
    name: 'V Blink',
    image: '/Game Logos/games/V-BLINK.png',
    gameId: 'vblink_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_vblink',
    password: '********',
    fallbackImage: '/Game Logos/games/V-BLINK.png'
  },
  {
    id: '13',
    name: 'Vega Sweeps',
    image: '/Game Logos/games/VEGA-SWEEPS.jpg',
    gameId: 'vegasweeps_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_vegasweeps',
    password: '********',
    fallbackImage: '/Game Logos/games/VEGA-SWEEPS.jpg'
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

      const response = await fetch('/api/auth/dashboard-games', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.games) {
        console.error('Invalid response format:', data);
        set({ 
          isLoading: false,
          isRefreshing: false,
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
        error: 'Failed to fetch games'
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