import { create } from 'zustand';
import { User, users } from '../../../tests/test-data/users';

interface MembersDataState {
   // Data
   members: User[];

   // Actions
   getAllMembers: () => User[];
   getMemberById: (id: string) => User | undefined;
   getMembersByTeam: (teamId: string) => User[];
   getMembersByRole: (role: User['role']) => User[];
   getOnlineMembers: () => User[];

   // Member management
   addMember: (member: Omit<User, 'id'>) => User;
   updateMember: (id: string, updates: Partial<User>) => void;
   removeMember: (id: string) => void;

   // Team management
   addMemberToTeam: (memberId: string, teamId: string) => void;
   removeMemberFromTeam: (memberId: string, teamId: string) => void;

   // Status management
   updateMemberStatus: (id: string, status: User['status']) => void;
   updateMemberRole: (id: string, role: User['role']) => void;
}

export const useMembersDataStore = create<MembersDataState>((set, get) => ({
   // Initial state
   members: users,

   // Actions
   getAllMembers: () => {
      return [...get().members]; // Return new array reference for immutability
   },

   getMemberById: (id) => {
      const state = get();
      return state.members.find((member) => member.id === id);
   },

   getMembersByTeam: (teamId) => {
      const state = get();
      return state.members.filter((member) => member.teamIds.includes(teamId));
   },

   getMembersByRole: (role) => {
      const state = get();
      return state.members.filter((member) => member.role === role);
   },

   getOnlineMembers: () => {
      const state = get();
      return state.members.filter((member) => member.status === 'online');
   },

   // Member management
   addMember: (memberData) => {
      const newMember: User = {
         ...memberData,
         id: `member_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };

      set((state) => ({
         members: [...state.members, newMember],
      }));

      return newMember;
   },

   updateMember: (id, updates) => {
      set((state) => ({
         members: state.members.map((member) =>
            member.id === id ? { ...member, ...updates } : member
         ),
      }));
   },

   removeMember: (id) => {
      set((state) => ({
         members: state.members.filter((member) => member.id !== id),
      }));
   },

   // Team management
   addMemberToTeam: (memberId, teamId) => {
      set((state) => ({
         members: state.members.map((member) =>
            member.id === memberId ? { ...member, teamIds: [...member.teamIds, teamId] } : member
         ),
      }));
   },

   removeMemberFromTeam: (memberId, teamId) => {
      set((state) => ({
         members: state.members.map((member) =>
            member.id === memberId
               ? { ...member, teamIds: member.teamIds.filter((id) => id !== teamId) }
               : member
         ),
      }));
   },

   // Status management
   updateMemberStatus: (id, status) => {
      set((state) => ({
         members: state.members.map((member) =>
            member.id === id ? { ...member, status } : member
         ),
      }));
   },

   updateMemberRole: (id, role) => {
      set((state) => ({
         members: state.members.map((member) => (member.id === id ? { ...member, role } : member)),
      }));
   },
}));
