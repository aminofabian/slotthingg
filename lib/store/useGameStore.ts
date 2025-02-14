import { create, StateCreator } from 'zustand';

export interface Game {
  id: number;
  name: string;
  image: string;
  gameId: string;
  entries: number;
  active: boolean;
  balance: number;
  safe?: number;
}

interface GameStore {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  fetchGames: () => Promise<void>;
  updateGameBalance: (name: string, balance: number) => void;
}

const useGameStore = create<GameStore>((set, get) => ({
  games: [],
  isLoading: false,
  error: null,

  fetchGames: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get token from cookies, checking both possible names
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
      
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      const authToken = decodeURIComponent(accessToken || token || '');

      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('https://serverhub.biz/games/list', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please login again.');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to fetch games');
      }

      // Get the initial games list with their images and IDs
      const initialGames: Game[] = [
        {
          id: 1,
          name: 'Golden Dragon',
          image: '/gameimages/4ed5620e-a0c5-4301-ab32-d585dd9c651e-GOLDEN DRAGON.png',
          gameId: 'M-436-343-056',
          entries: 0,
          active: true,
          balance: 0
        },
        {
          id: 2,
          name: 'Juwa',
          image: '/gameimages/0b94c78a-13f8-4819-90b7-5d34a0d1132f-JUWA.png',
          gameId: 'FK_aminof235',
          entries: 0,
          active: true,
          balance: 0
        },
        {
          id: 3,
          name: 'Ultra Panda',
          image: '/gameimages/ba5c4494-869d-4d69-acda-758cf1169c78-ULTRA PANDA.png',
          gameId: 'aminofabUP777',
          entries: 0,
          safe: 0,
          active: true,
          balance: 0
        },
        {
          id: 4,
          name: 'Panda Master',
          image: '/gameimages/14570bb3-0cc5-4bef-ba1b-1d1a4821e77b-PANDA MASTER.png',
          gameId: 'PM_aminofa235',
          entries: 0,
          safe: 0,
          active: true,
          balance: 0
        },
        {
          id: 5,
          name: 'Golden Treasure',
          image: '/gameimages/1f246c12-890f-40f9-b7c6-9b1a4e077169-GOLDEN TREASURE.png',
          gameId: 'GT_aminofa235',
          entries: 0,
          safe: 0,
          active: true,
          balance: 0
        },
        {
          id: 6,
          name: 'Orion Star',
          image: '/gameimages/2a8bd502-d191-48bd-831d-531a4751050a-ORION STAR.png',
          gameId: 'OS_aminofa235',
          entries: 0,
          safe: 0,
          active: true,
          balance: 0
        },
        {
          id: 7,
          name: 'V Blink',
          image: '/gameimages/9e9a9618-c490-44fa-943d-c2322c00f266-V BLINK.png',
          gameId: 'VB_aminofa235',
          entries: 0,
          safe: 0,
          active: true,
          balance: 0
        },
        {
          id: 8,
          name: 'Milky Way',
          image: '/gameimages/21ccf352-34a8-44a3-a94d-67b8cccc0959-MILKY WAY.png',
          gameId: 'MW_aminofa235',
          entries: 0,
          safe: 0,
          active: true,
          balance: 0
        }
      ];

      // Update games with balances from the API
      const updatedGames = initialGames.map(game => ({
        ...game,
        balance: result.data?.game_balance?.[game.name] || 0,
        active: result.data?.user_games?.includes(game.name) || false
      }));

      set({ games: updatedGames });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch games' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateGameBalance: (name: string, balance: number) => {
    const games = get().games;
    const updatedGames = games.map((game: Game) => 
      game.name === name ? { ...game, balance } : game
    );
    set({ games: updatedGames });
  }
}));

export default useGameStore; 