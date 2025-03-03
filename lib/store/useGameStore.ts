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

          const response = await fetch('/api/auth/dashboard-games', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'  // This will send cookies automatically
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

          type GameName = 'Cash Frenzy' | 'Cash Machine' | 'Fire Kirin' | 'Game Room' | 'Game Vault' | 'Juwa' | 'Mafia' | 'Milky Way' | 'Mr All In One' | 'Orion Stars' | 'Panda Master' | 'River Sweeps' | 'Ultra Panda' | 'VB Link' | 'Vegas Sweeps';
          const gameNameMapping: { [K in GameName]: string } = {
            'Cash Frenzy': 'Cash Frenzy',
            'Cash Machine': 'Cash Machine',
            'Fire Kirin': 'Fire Kirin',
            'Game Room': 'Game Room',
            'Game Vault': 'Game Vault',
            'Juwa': 'Juwa',
            'Mafia': 'Mafia',
            'Milky Way': 'Milky Way',
            'Mr All In One': 'Mr All In One',
            'Orion Stars': 'Orion Stars',
            'Panda Master': 'Panda Master',
            'River Sweeps': 'River Sweeps',
            'Ultra Panda': 'Ultra Panda',
            'VB Link': 'VB Link',
            'Vegas Sweeps': 'Vegas Sweeps'
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