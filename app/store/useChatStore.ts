import { create } from 'zustand';

interface ChatStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useChatStore; 