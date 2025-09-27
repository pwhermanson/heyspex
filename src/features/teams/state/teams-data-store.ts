import { create } from 'zustand';
import { Team, teams } from '../../../tests/test-data/teams';
import { User } from '../../../tests/test-data/users';
import { Project } from '../../../tests/test-data/projects';

interface TeamsDataState {
   // Data
   teams: Team[];

   // Actions
   getAllTeams: () => Team[];
   getTeamById: (id: string) => Team | undefined;
   getJoinedTeams: () => Team[];
   getAvailableTeams: () => Team[];

   // Team management
   addTeam: (team: Omit<Team, 'id'>) => Team;
   updateTeam: (id: string, updates: Partial<Team>) => void;
   deleteTeam: (id: string) => void;

   // Team membership
   joinTeam: (teamId: string) => void;
   leaveTeam: (teamId: string) => void;

   // Team member management
   addMemberToTeam: (teamId: string, member: User) => void;
   removeMemberFromTeam: (teamId: string, memberId: string) => void;

   // Team project management
   addProjectToTeam: (teamId: string, project: Project) => void;
   removeProjectFromTeam: (teamId: string, projectId: string) => void;

   // Team settings
   updateTeamColor: (teamId: string, color: string) => void;
   updateTeamIcon: (teamId: string, icon: string) => void;
}

export const useTeamsDataStore = create<TeamsDataState>((set, get) => ({
   // Initial state
   teams: teams,

   // Actions
   getAllTeams: () => {
      return get().teams;
   },

   getTeamById: (id) => {
      return get().teams.find((team) => team.id === id);
   },

   getJoinedTeams: () => {
      return get().teams.filter((team) => team.joined);
   },

   getAvailableTeams: () => {
      return get().teams.filter((team) => !team.joined);
   },

   // Team management
   addTeam: (teamData) => {
      const newTeam: Team = {
         ...teamData,
         id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };

      set((state) => ({
         teams: [...state.teams, newTeam],
      }));

      return newTeam;
   },

   updateTeam: (id, updates) => {
      set((state) => ({
         teams: state.teams.map((team) => (team.id === id ? { ...team, ...updates } : team)),
      }));
   },

   deleteTeam: (id) => {
      set((state) => ({
         teams: state.teams.filter((team) => team.id !== id),
      }));
   },

   // Team membership
   joinTeam: (teamId) => {
      set((state) => ({
         teams: state.teams.map((team) => (team.id === teamId ? { ...team, joined: true } : team)),
      }));
   },

   leaveTeam: (teamId) => {
      set((state) => ({
         teams: state.teams.map((team) => (team.id === teamId ? { ...team, joined: false } : team)),
      }));
   },

   // Team member management
   addMemberToTeam: (teamId, member) => {
      set((state) => ({
         teams: state.teams.map((team) =>
            team.id === teamId ? { ...team, members: [...team.members, member] } : team
         ),
      }));
   },

   removeMemberFromTeam: (teamId, memberId) => {
      set((state) => ({
         teams: state.teams.map((team) =>
            team.id === teamId
               ? { ...team, members: team.members.filter((member) => member.id !== memberId) }
               : team
         ),
      }));
   },

   // Team project management
   addProjectToTeam: (teamId, project) => {
      set((state) => ({
         teams: state.teams.map((team) =>
            team.id === teamId ? { ...team, projects: [...team.projects, project] } : team
         ),
      }));
   },

   removeProjectFromTeam: (teamId, projectId) => {
      set((state) => ({
         teams: state.teams.map((team) =>
            team.id === teamId
               ? { ...team, projects: team.projects.filter((project) => project.id !== projectId) }
               : team
         ),
      }));
   },

   // Team settings
   updateTeamColor: (teamId, color) => {
      set((state) => ({
         teams: state.teams.map((team) => (team.id === teamId ? { ...team, color } : team)),
      }));
   },

   updateTeamIcon: (teamId, icon) => {
      set((state) => ({
         teams: state.teams.map((team) => (team.id === teamId ? { ...team, icon } : team)),
      }));
   },
}));
