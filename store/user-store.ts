import { create } from 'zustand';
import { User } from '@/mock-data/users';

interface UserState {
   currentUser: User | null;
   setCurrentUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
   currentUser: null,
   setCurrentUser: (user) => set({ currentUser: user }),
}));
