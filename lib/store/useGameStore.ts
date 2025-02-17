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
    name: 'Vblink',
    image: '/games/vblink.png',
    gameId: 'vblink_001',
    entries: 0,
    active: true,
    balance: 0,
    username: 'user_vblink',
    password: '********',
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
    username: 'user_golden',
    password: '********',
    safe: 0,
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
    username: 'user_egames',
    password: '********',
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
    username: 'user_milky',
    password: '********',
    safe: 0,
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
    username: 'user_juwa',
    password: '********',
    fallbackImage: '/games/juwa.png'
  }
];

const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      games: initialGames,
      isLoading: false,
      isRefreshing: false,
      error: null,
      currentBalance: 0,
      selectedGameId: undefined,
      errorModalOpen: false,

      fetchGames: async () => {
        try {
          console.log('Fetching games...');
          const isFirstLoad = get().games === initialGames;
          set({ 
            isLoading: isFirstLoad,
            isRefreshing: !isFirstLoad,
            error: null 
          });
          
          // Simple cookie parsing
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

          console.log('Auth check:', {
            hasCookie: !!token,
            cookieString: document.cookie
          });
          
          if (!token) {
            console.error('No token found in cookies. Available cookies:', document.cookie);
            set({ 
              games: initialGames,  
              isLoading: false, 
              isRefreshing: false,
              error: 'Authentication token not found. Please log in again.'
            });
            return;
          }

          console.log('Using auth token:', token.substring(0, 10) + '...');

          const response = await fetch('https://serverhub.biz/games/list', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-store'
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          console.log('API Response:', JSON.stringify(result, null, 2));

          if (result.status !== 'success' || !result.data?.games) {
            throw new Error('Invalid API response format');
          }

          // Log the game balance data specifically
          console.log('Game balances from API:', {
            rawBalances: result.data.game_balance,
            gameNames: Object.keys(result.data.game_balance)
          });

          type GameName = 'Vblink' | 'Golden Treasure' | 'Egames' | 'Milky Way' | 'Juwa';
          const gameNameMapping: { [K in GameName]: string } = {
            'Vblink': 'Vblink',
            'Golden Treasure': 'Golden Dragon',
            'Egames': 'E-Game',
            'Milky Way': 'Milkyway',
            'Juwa': 'Juwa'
          };

          const transformedGames = initialGames.map(game => {
            const apiGameName = gameNameMapping[game.name as GameName];
            console.log(`Mapping game "${game.name}" to API name "${apiGameName}"`);

            if (!apiGameName) {
              console.warn(`No API mapping for game: ${game.name}`);
              return game;
            }

            const balance = result.data.game_balance[apiGameName];
            console.log(`Balance for ${apiGameName}:`, {
              rawBalance: balance,
              parsed: balance !== undefined ? parseFloat(balance) : 'undefined',
              availableBalances: Object.keys(result.data.game_balance).join(', ')
            });

            if (balance === undefined) {
              console.warn(`No balance found for game: ${apiGameName}. Available games: ${Object.keys(result.data.game_balance).join(', ')}`);
              return game;
            }

            const parsedBalance = parseFloat(balance);
            if (isNaN(parsedBalance)) {
              console.warn(`Invalid balance value for game ${apiGameName}: ${balance}`);
              return game;
            }

            return {
              ...game,
              balance: parsedBalance
            };
          });

          console.log('Final transformed games:', transformedGames.map(g => ({
            name: g.name,
            apiName: gameNameMapping[g.name as GameName],
            balance: g.balance,
            rawBalance: result.data.game_balance[gameNameMapping[g.name as GameName]]
          })));

          set({ 
            games: transformedGames,
            isLoading: false,
            isRefreshing: false,
            error: null
          });
        } catch (error) {
          console.error('Error fetching games:', error);
          set({ 
            games: initialGames,
            isLoading: false,
            isRefreshing: false,
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
        selectedGameId: state.selectedGameId
      }),
      onRehydrateStorage: () => (state) => {
        // Force fetch games on rehydration
        if (state) {
          console.log('Store rehydrated, fetching fresh games...');
          state.fetchGames();
        }
      }
    }
  )
);

export const getDefaultGames = () => initialGames;

export default useGameStore;