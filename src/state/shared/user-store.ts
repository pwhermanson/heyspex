import { create } from 'zustand';
import { User } from '@/src/tests/test-data/users';

interface UserState {
   currentUser: User | null;
   setCurrentUser: (user: User) => void;
}

export const useUserStore = create<UserState>((set) => ({
   currentUser: null,
   setCurrentUser: (user) => set({ currentUser: user }),
}));
