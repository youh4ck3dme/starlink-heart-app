import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types
interface ShopState {
  // Player Resources
  gems: number;
  
  // Unlocked Items
  unlockedBackgrounds: string[];
  
  // Selected Items
  selectedBackgroundId: string;
  
  // Mascot Mode
  mascotMode: 'image' | 'spline3d';
  
  // Custom API Key (optional)
  customApiKey: string;
}

interface ShopActions {
  // Gem Management
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  
  // Shop Purchases
  purchaseBackground: (id: string, price: number) => boolean;
  isBackgroundUnlocked: (id: string) => boolean;
  
  // Settings
  setSelectedBackground: (id: string) => void;
  setMascotMode: (mode: 'image' | 'spline3d') => void;
  setCustomApiKey: (key: string) => void;
  
  // Reset (for account deletion)
  resetAll: () => void;
}

type GameStore = ShopState & ShopActions;

const INITIAL_STATE: ShopState = {
  gems: 0,
  unlockedBackgrounds: ['sky', 'space'], // Free by default
  selectedBackgroundId: 'space',
  mascotMode: 'image',
  customApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial State
      ...INITIAL_STATE,

      // --- Gem Actions ---
      addGems: (amount) => set((state) => ({ 
        gems: state.gems + amount 
      })),

      spendGems: (amount) => {
        const { gems } = get();
        if (gems >= amount) {
          set({ gems: gems - amount });
          return true;
        }
        return false;
      },

      // --- Shop Actions ---
      purchaseBackground: (id, price) => {
        const { gems, unlockedBackgrounds } = get();
        
        // Already unlocked?
        if (unlockedBackgrounds.includes(id)) {
          set({ selectedBackgroundId: id });
          return true;
        }
        
        // Can afford?
        if (gems < price) {
          return false;
        }
        
        // Purchase!
        set({
          gems: gems - price,
          unlockedBackgrounds: [...unlockedBackgrounds, id],
          selectedBackgroundId: id,
        });
        return true;
      },

      isBackgroundUnlocked: (id) => {
        return get().unlockedBackgrounds.includes(id);
      },

      // --- Settings ---
      setSelectedBackground: (id) => set({ selectedBackgroundId: id }),
      
      setMascotMode: (mode) => set({ mascotMode: mode }),
      
      setCustomApiKey: (key) => set({ customApiKey: key }),

      // --- Reset ---
      resetAll: () => set(INITIAL_STATE),
    }),
    {
      name: 'starlink-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        gems: state.gems,
        unlockedBackgrounds: state.unlockedBackgrounds,
        selectedBackgroundId: state.selectedBackgroundId,
        mascotMode: state.mascotMode,
        customApiKey: state.customApiKey,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useGems = () => useGameStore((state) => state.gems);
export const useMascotMode = () => useGameStore((state) => state.mascotMode);
export const useSelectedBackground = () => useGameStore((state) => state.selectedBackgroundId);
