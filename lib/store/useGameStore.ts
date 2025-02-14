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

const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      games: [],
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
            set({ games: [], error: null }); // Clear games on logout
            return; // Exit quietly without error
          }
          
          const response = await fetch('https://serverhub.biz/games/list', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          console.log('API Status:', response.status);

          if (response.status === 401 || response.status === 403) {
            throw new Error('Authentication failed. Please login again.');
          }

          // Check content type before trying to parse JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid response from server');
          }

          const result = await response.json();

          console.groupCollapsed('[DEBUG] API Response Analysis');
          console.log('Full response:', JSON.stringify(result, null, 2));
          console.log('Response data type:', typeof result.data);
          console.log('Games array:', result.data?.games);
          console.log('Game balances:', result.data?.game_balance);
          console.log('User games:', result.data?.user_games);
          console.groupEnd();

          if (!result.data?.games) {
            console.error('Critical Error: API response missing games array');
            set({ games: [], error: 'Server response format invalid' });
            return;
          }

          if (!response.ok) {
            throw new Error(result.message || result.error || 'Failed to fetch games');
          }

          const apiGames = result.data.games.map((name: string, index: number) => {
            console.log(`Processing game ${index}: ${name}`);
            const balance = result.data.game_balance[name] ?? 0;
            if (!result.data.game_balance[name]) {
              console.warn('Missing balance for game:', name);
            }
            return {
              id: index + 1,
              name: name.trim(),
              image: `/gameimages/${name.toLowerCase().replace(/\s+/g, '-')}.png`,
              gameId: btoa(name).replace(/=/g, ''),
              entries: result.data.entries?.[name] || 0,
              active: result.data.user_games.includes(name),
              balance,
              fallbackImage: '/gameimages/default.png'
            };
          });

          set({ games: apiGames });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch games' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateGameBalance: (gameName: string, balance: number) => {
        const normalizedName = gameName.trim().toLowerCase();
        const updatedGames = get().games.map(game => 
          game.name.trim().toLowerCase() === normalizedName
            ? { ...game, balance }
            : game
        );
        set({ games: updatedGames });
      }
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        games: state.games,
        isLoading: state.isLoading,
        error: state.error
      })
    }
  )
);

export default useGameStore;