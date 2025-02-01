import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, SubscriptionStatus } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  updateSubscriptionStatus: (status: SubscriptionStatus) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addFavorite: (tokenId: string) => void;
  removeFavorite: (tokenId: string) => void;
  logout: () => void;
}

const defaultUser: UserProfile = {
  id: '',
  subscriptionStatus: {
    isActive: false
  },
  favorites: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user 
        }),

      updateSubscriptionStatus: (status) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              subscriptionStatus: status,
              updatedAt: new Date()
            }
          });
        }
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...updates,
              updatedAt: new Date()
            }
          });
        }
      },

      addFavorite: (tokenId) => {
        const currentUser = get().user;
        if (currentUser) {
          const favorites = new Set([...currentUser.favorites, tokenId]);
          set({
            user: {
              ...currentUser,
              favorites: Array.from(favorites),
              updatedAt: new Date()
            }
          });
        }
      },

      removeFavorite: (tokenId) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              favorites: currentUser.favorites.filter(id => id !== tokenId),
              updatedAt: new Date()
            }
          });
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);