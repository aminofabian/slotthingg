import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

interface GameStoreState {
  games: Game[];
  isLoading: boolean;
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
    name: 'Vblink',
    image: '/games/vblink.png',
    gameId: 'vblink_001',
    entries: 0,
    active: true,
    balance: 0,
    fallbackImage: '/games/vblink.png'
  },
  {
    id: '2',
    name: 'Golden Treasure',
    image: '/games/golden-treasure.png',
    gameId: 'golden_001',
    entries: 0,
    active: true,
    balance: 0,
    fallbackImage: '/games/golden-treasure.png'
  },
  {
    id: '3',
    name: 'Egames',
    image: '/games/egames.png',
    gameId: 'egames_001',
    entries: 0,
    active: true,
    balance: 0,
    fallbackImage: '/games/egames.png'
  },
  {
    id: '4',
    name: 'Milky Way',
    image: '/games/milky-way.png',
    gameId: 'milky_001',
    entries: 0,
    active: true,
    balance: 0,
    fallbackImage: '/games/milky-way.png'
  },
  {
    id: '5',
    name: 'Juwa',
    image: '/games/juwa.png',
    gameId: 'juwa_001',
    entries: 0,
    active: true,
    balance: 0,
    fallbackImage: '/games/juwa.png'
  }
];

const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      games: initialGames, // Initialize with games immediately
      isLoading: false,
      error: null,
      currentBalance: 0,
      selectedGameId: undefined,
      errorModalOpen: false,

      fetchGames: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Client-side only cookie access
          const accessToken = typeof window !== 'undefined' ? document.cookie
            .split('; ')
            .find(row => row.startsWith('access_token='))
            ?.split('=')[1] : null;
          
          const token = typeof window !== 'undefined' ? document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1] : null;

          const authToken = decodeURIComponent(accessToken || token || '');
          console.log('Auth token:', authToken.length > 0 ? '***' : 'empty');

          if (!authToken) {
            console.log('No auth token, using initial games');
            set({ isLoading: false, error: null });
            return;
          }
          
          const response = await fetch('https://serverhub.biz/games/list', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to fetch games from server');
          }

          const result = await response.json();
          
          if (result.data?.games) {
            set({ 
              games: result.data.games,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          console.error('Error fetching games:', error);
          // Keep using initial games on error
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch games'
          });
        }
      },

      updateGameBalance: (gameName: string, balance: number) => {
        const { games } = get();
        const updatedGames = games.map(game => 
          game.name === gameName ? { ...game, balance } : game
        );
        set({ games: updatedGames });
      }
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        games: state.games,
        currentBalance: state.currentBalance,
        selectedGameId: state.selectedGameId
      })
    }
  )
);

export default useGameStore;