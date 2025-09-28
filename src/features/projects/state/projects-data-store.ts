import { create } from 'zustand';
import { Project, projects } from '../../../tests/test-data/projects';
import { User, users } from '../../../tests/test-data/users';

const cloneUser = (user: User): User => ({
   ...user,
   teamIds: [...user.teamIds],
});

const cloneProject = (project: Project): Project => ({
   ...project,
   status: { ...project.status },
   lead: cloneUser(project.lead),
   priority: { ...project.priority },
   health: { ...project.health },
});

const cloneProjectList = (list: Project[]) => list.map(cloneProject);

const createProject = (data: Omit<Project, 'id'>, id?: string): Project => {
   const project: Project = {
      ...data,
      id: id ?? `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
   };

   return cloneProject(project);
};

const findLeadById = (leadId: string) => {
   const match = users.find((user) => user.id === leadId);
   return match ? cloneUser(match) : undefined;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

interface ProjectsDataState {
   projects: Project[];

   getAllProjects: () => Project[];
   getProjectById: (id: string) => Project | undefined;
   getProjectsByTeam: (teamId: string) => Project[];
   getProjectsByLead: (leadId: string) => Project[];
   getActiveProjects: () => Project[];
   getCompletedProjects: () => Project[];

   addProject: (project: Omit<Project, 'id'>) => Project;
   updateProject: (id: string, updates: Partial<Project>) => void;
   deleteProject: (id: string) => void;

   setProjectLead: (projectId: string, leadId: string) => void;
   removeProjectLead: (projectId: string) => void;

   updateProjectStatus: (id: string, status: Project['status']) => void;
   updateProjectProgress: (id: string, progress: number) => void;

   addProjectToTeam: (projectId: string, teamId: string) => void;
   removeProjectFromTeam: (projectId: string, teamId: string) => void;

   resetStore: () => void;
}

export const useProjectsDataStore = create<ProjectsDataState>((set, get) => ({
   projects: cloneProjectList(projects),

   getAllProjects: () => {
      return [...get().projects]; // Return new array reference for immutability
   },

   getProjectById: (id) => {
      const project = get().projects.find((item) => item.id === id);
      return project ? cloneProject(project) : undefined;
   },

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   getProjectsByTeam: (_teamId) => cloneProjectList(get().projects),

   getProjectsByLead: (leadId) =>
      cloneProjectList(get().projects.filter((project) => project.lead?.id === leadId)),

   getActiveProjects: () =>
      cloneProjectList(get().projects.filter((project) => project.status.id !== 'completed')),

   getCompletedProjects: () =>
      cloneProjectList(get().projects.filter((project) => project.status.id === 'completed')),

   addProject: (projectData) => {
      const newProject = createProject(projectData);

      set((state) => ({
         projects: [...state.projects, newProject],
      }));

      return cloneProject(newProject);
   },

   updateProject: (id, updates) => {
      set((state) => ({
         projects: state.projects.map((project) => {
            if (project.id !== id) {
               return project;
            }

            const merged: Project = {
               ...project,
               ...updates,
               status: updates.status ? { ...updates.status } : { ...project.status },
               lead: updates.lead ? cloneUser(updates.lead) : cloneUser(project.lead),
               priority: updates.priority ? { ...updates.priority } : { ...project.priority },
               health: updates.health ? { ...updates.health } : { ...project.health },
            };

            if (updates.percentComplete !== undefined) {
               merged.percentComplete = clampPercent(updates.percentComplete);
            }

            return merged;
         }),
      }));
   },

   deleteProject: (id) => {
      set((state) => ({
         projects: state.projects.filter((project) => project.id !== id),
      }));
   },

   setProjectLead: (projectId, leadId) => {
      const nextLead = findLeadById(leadId);
      if (!nextLead) {
         return;
      }

      set((state) => ({
         projects: state.projects.map((project) =>
            project.id === projectId ? { ...project, lead: nextLead } : project
         ),
      }));
   },

   removeProjectLead: (projectId) => {
      console.log(`Cannot remove lead from project ${projectId} - lead is required`);
   },

   updateProjectStatus: (id, status) => {
      set((state) => ({
         projects: state.projects.map((project) =>
            project.id === id ? { ...project, status: { ...status } } : project
         ),
      }));
   },

   updateProjectProgress: (id, progress) => {
      const percent = clampPercent(progress);

      set((state) => ({
         projects: state.projects.map((project) =>
            project.id === id ? { ...project, percentComplete: percent } : project
         ),
      }));
   },

   addProjectToTeam: (projectId, teamId) => {
      console.log(`Adding project ${projectId} to team ${teamId}`);
   },

   removeProjectFromTeam: (projectId) => {
      console.log(`Removing project ${projectId} from team`);
   },

   resetStore: () => {
      set({ projects: cloneProjectList(projects) });
   },
}));

export const resetProjectsDataStore = () => {
   useProjectsDataStore.getState().resetStore();
};
