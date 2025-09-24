import { create } from 'zustand';
import { Project, projects } from '@/src/tests/test-data/projects';
import { User } from '@/src/tests/test-data/users';

interface ProjectsDataState {
   // Data
   projects: Project[];

   // Actions
   getAllProjects: () => Project[];
   getProjectById: (id: string) => Project | undefined;
   getProjectsByTeam: (teamId: string) => Project[];
   getProjectsByLead: (leadId: string) => Project[];
   getActiveProjects: () => Project[];
   getCompletedProjects: () => Project[];

   // Project management
   addProject: (project: Omit<Project, 'id'>) => Project;
   updateProject: (id: string, updates: Partial<Project>) => void;
   deleteProject: (id: string) => void;

   // Project lead management
   setProjectLead: (projectId: string, leadId: string) => void;
   removeProjectLead: (projectId: string) => void;

   // Project status management
   updateProjectStatus: (id: string, status: Project['status']) => void;
   updateProjectProgress: (id: string, progress: number) => void;

   // Project team management
   addProjectToTeam: (projectId: string, teamId: string) => void;
   removeProjectFromTeam: (projectId: string, teamId: string) => void;
}

export const useProjectsDataStore = create<ProjectsDataState>((set, get) => ({
   // Initial state
   projects: projects,

   // Actions
   getAllProjects: () => {
      return get().projects;
   },

   getProjectById: (id) => {
      return get().projects.find((project) => project.id === id);
   },

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   getProjectsByTeam: (_teamId) => {
      // Note: This would need to be implemented by looking up teams and their projects
      // For now, return all projects since the relationship is teams -> projects
      return get().projects;
   },

   getProjectsByLead: (leadId) => {
      return get().projects.filter((project) => project.lead?.id === leadId);
   },

   getActiveProjects: () => {
      return get().projects.filter((project) => project.status.id !== 'completed');
   },

   getCompletedProjects: () => {
      return get().projects.filter((project) => project.status.id === 'completed');
   },

   // Project management
   addProject: (projectData) => {
      const newProject: Project = {
         ...projectData,
         id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };

      set((state) => ({
         projects: [...state.projects, newProject],
      }));

      return newProject;
   },

   updateProject: (id, updates) => {
      set((state) => ({
         projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
         ),
      }));
   },

   deleteProject: (id) => {
      set((state) => ({
         projects: state.projects.filter((project) => project.id !== id),
      }));
   },

   // Project lead management
   setProjectLead: (projectId, leadId) => {
      set((state) => ({
         projects: state.projects.map((project) =>
            project.id === projectId
               ? { ...project, lead: { id: leadId, name: '', avatarUrl: '' } as User }
               : project
         ),
      }));
   },

   removeProjectLead: (projectId) => {
      // Note: Since lead is required in the Project interface, we can't set it to null
      // This would need to be handled differently, perhaps by setting a default user
      console.log(`Cannot remove lead from project ${projectId} - lead is required`);
   },

   // Project status management
   updateProjectStatus: (id, status) => {
      set((state) => ({
         projects: state.projects.map((project) =>
            project.id === id ? { ...project, status } : project
         ),
      }));
   },

   updateProjectProgress: (id, progress) => {
      set((state) => ({
         projects: state.projects.map((project) =>
            project.id === id ? { ...project, progress } : project
         ),
      }));
   },

   // Project team management
   // Note: These methods would need to be implemented by updating the teams store
   // since the relationship is teams -> projects, not projects -> teams
   addProjectToTeam: (projectId, teamId) => {
      // This would need to be implemented by updating the teams store
      console.log(`Adding project ${projectId} to team ${teamId}`);
   },

   removeProjectFromTeam: (projectId) => {
      // This would need to be implemented by updating the teams store
      console.log(`Removing project ${projectId} from team`);
   },
}));
