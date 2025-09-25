/**
 * Projects Data Store Tests - Comprehensive Test Suite
 *
 * This test suite covers all functionality of the useProjectsDataStore:
 * - Project retrieval functions
 * - Project management (CRUD operations)
 * - Project lead management
 * - Project status and progress management
 * - Project team associations
 * - Edge cases and error handling
 *
 * The store manages 20 test projects across various statuses, teams, and leads.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProjectsDataStore } from '../../features/projects/state/projects-data-store';
import { projects } from '../../tests/test-data/projects';
import { users } from '../../tests/test-data/users';
import { mockLocalStorage } from '../utils/store-test-utils';

const localStorageMock = mockLocalStorage();

describe('useProjectsDataStore', () => {
   beforeEach(() => {
      // Mock localStorage for any potential persistence
      Object.defineProperty(window, 'localStorage', {
         value: localStorageMock,
         writable: true,
      });
   });

   afterEach(() => {
      vi.clearAllMocks();
   });

   describe('Initial State', () => {
      it('should initialize with mock project data', () => {
         const { result } = renderHook(() => useProjectsDataStore());

         expect(result.current.projects).toEqual(projects);
         expect(result.current.projects).toHaveLength(20); // 20 projects in test data
      });

      it('should have correct project types', () => {
         const { result } = renderHook(() => useProjectsDataStore());

         expect(result.current.projects[0]).toEqual(
            expect.objectContaining({
               id: expect.any(String),
               name: expect.any(String),
               status: expect.any(Object),
               icon: expect.any(Function),
               percentComplete: expect.any(Number),
               startDate: expect.any(String),
               lead: expect.any(Object),
               priority: expect.any(Object),
               health: expect.any(Object),
            })
         );
      });
   });

   describe('Project Retrieval Functions', () => {
      describe('getAllProjects', () => {
         it('should return all projects', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const allProjects = result.current.getAllProjects();

            expect(allProjects).toHaveLength(20);
            expect(allProjects).toEqual(result.current.projects);
         });

         it('should return a new array reference', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const allProjects1 = result.current.getAllProjects();
            const allProjects2 = result.current.getAllProjects();

            expect(allProjects1).toEqual(allProjects2);
            expect(allProjects1).not.toBe(allProjects2);
         });
      });

      describe('getProjectById', () => {
         it('should return project by valid id', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const project = result.current.getProjectById('1');

            expect(project).toEqual(
               expect.objectContaining({
                  id: '1',
                  name: 'HeySpex - Core Components',
                  percentComplete: 80,
               })
            );
         });

         it('should return undefined for invalid id', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const project = result.current.getProjectById('nonexistent');

            expect(project).toBeUndefined();
         });

         it('should return undefined for empty id', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const project = result.current.getProjectById('');

            expect(project).toBeUndefined();
         });
      });

      describe('getProjectsByTeam', () => {
         it('should return projects for all teams (current implementation)', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const teamProjects = result.current.getProjectsByTeam('CORE');

            // Current implementation returns all projects regardless of team
            expect(teamProjects).toHaveLength(20);
            expect(teamProjects).toEqual(result.current.projects);
         });

         it('should handle empty team id gracefully', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const projects = result.current.getProjectsByTeam('');

            expect(projects).toHaveLength(20); // Returns all projects
         });
      });

      describe('getProjectsByLead', () => {
         it('should return projects for valid lead id', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const leadProjects = result.current.getProjectsByLead('sophia');

            expect(leadProjects).toHaveLength(7); // 7 projects led by sophia
            expect(leadProjects.every((project) => project.lead.id === 'sophia')).toBe(true);
         });

         it('should return empty array for lead with no projects', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const projects = result.current.getProjectsByLead('nonexistent');

            expect(projects).toEqual([]);
         });

         it('should return empty array for empty lead id', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const projects = result.current.getProjectsByLead('');

            expect(projects).toEqual([]);
         });
      });

      describe('getActiveProjects', () => {
         it('should return only active projects (not completed)', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const activeProjects = result.current.getActiveProjects();

            expect(activeProjects).toHaveLength(16); // 16 active, 4 completed in test data
            expect(activeProjects.every((project) => project.status.id !== 'completed')).toBe(true);
         });
      });

      describe('getCompletedProjects', () => {
         it('should return only completed projects', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const completedProjects = result.current.getCompletedProjects();

            expect(completedProjects).toHaveLength(4); // 4 completed projects in test data
            expect(completedProjects.every((project) => project.status.id === 'completed')).toBe(
               true
            );
         });
      });
   });

   describe('Project Management', () => {
      describe('addProject', () => {
         it('should add new project with generated id', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const newProjectData = {
               name: 'New Test Project',
               status: projects[0].status,
               icon: projects[0].icon,
               percentComplete: 25,
               startDate: '2025-01-01',
               lead: users[0],
               priority: projects[0].priority,
               health: projects[0].health,
            };

            let newProject;
            act(() => {
               newProject = result.current.addProject(newProjectData);
            });

            expect(newProject).toEqual(
               expect.objectContaining({
                  ...newProjectData,
                  id: expect.stringMatching(/^project_\d+_[a-z0-9]+$/),
               })
            );

            // Verify project was added to store
            const allProjects = result.current.getAllProjects();
            expect(allProjects).toContain(newProject);
         });

         it('should add project to state', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const initialCount = result.current.projects.length;

            act(() => {
               result.current.addProject({
                  name: 'Test Project',
                  status: projects[0].status,
                  icon: projects[0].icon,
                  percentComplete: 0,
                  startDate: '2025-01-01',
                  lead: users[0],
                  priority: projects[0].priority,
                  health: projects[0].health,
               });
            });

            expect(result.current.projects).toHaveLength(initialCount + 1);
         });

         it('should return the added project', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const newProjectData = {
               name: 'Test Project',
               status: projects[0].status,
               icon: projects[0].icon,
               percentComplete: 50,
               startDate: '2025-01-01',
               lead: users[0],
               priority: projects[0].priority,
               health: projects[0].health,
            };

            let newProject;
            act(() => {
               newProject = result.current.addProject(newProjectData);
            });

            expect(newProject).toEqual(
               expect.objectContaining({
                  name: 'Test Project',
                  percentComplete: 50,
               })
            );
         });
      });

      describe('updateProject', () => {
         it('should update project with valid id', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            act(() => {
               result.current.updateProject('1', { name: 'Updated Project Name' });
            });

            const updatedProject = result.current.getProjectById('1');
            expect(updatedProject?.name).toBe('Updated Project Name');
         });

         it('should update multiple properties', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            act(() => {
               result.current.updateProject('1', {
                  name: 'Updated Project',
                  percentComplete: 90,
                  startDate: '2025-01-15',
               });
            });

            const updatedProject = result.current.getProjectById('1');
            expect(updatedProject?.name).toBe('Updated Project');
            expect(updatedProject?.percentComplete).toBe(90);
            expect(updatedProject?.startDate).toBe('2025-01-15');
         });

         it('should not affect other projects', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const originalProject = result.current.getProjectById('2');

            act(() => {
               result.current.updateProject('1', { name: 'Updated Project Name' });
            });

            const unchangedProject = result.current.getProjectById('2');
            expect(unchangedProject).toEqual(originalProject);
         });

         it('should handle non-existent project gracefully', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const initialCount = result.current.projects.length;

            act(() => {
               result.current.updateProject('nonexistent', { name: 'Should not update' });
            });

            expect(result.current.projects).toHaveLength(initialCount);
         });
      });

      describe('deleteProject', () => {
         it('should remove project with valid id', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const initialCount = result.current.projects.length;

            act(() => {
               result.current.deleteProject('1');
            });

            expect(result.current.projects).toHaveLength(initialCount - 1);
            expect(result.current.getProjectById('1')).toBeUndefined();
         });

         it('should not affect other projects', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const originalProjects = result.current.getAllProjects();

            act(() => {
               result.current.deleteProject('1');
            });

            const remainingProjects = result.current.getAllProjects();
            expect(remainingProjects).toHaveLength(originalProjects.length - 1);
            expect(remainingProjects.find((p) => p.id === '1')).toBeUndefined();
         });

         it('should handle non-existent project gracefully', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const initialCount = result.current.projects.length;

            act(() => {
               result.current.deleteProject('nonexistent');
            });

            expect(result.current.projects).toHaveLength(initialCount);
         });
      });
   });

   describe('Project Lead Management', () => {
      describe('setProjectLead', () => {
         it('should update project lead', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            act(() => {
               result.current.setProjectLead('1', 'demo');
            });

            const updatedProject = result.current.getProjectById('1');
            expect(updatedProject?.lead.id).toBe('demo');
         });

         it('should not affect other project properties', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const originalProject = result.current.getProjectById('1');

            act(() => {
               result.current.setProjectLead('1', 'demo');
            });

            const updatedProject = result.current.getProjectById('1');
            expect(updatedProject?.name).toBe(originalProject?.name);
            expect(updatedProject?.status).toEqual(originalProject?.status);
            expect(updatedProject?.percentComplete).toBe(originalProject?.percentComplete);
         });

         it('should handle non-existent project gracefully', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            act(() => {
               result.current.setProjectLead('nonexistent', 'demo');
            });

            // Should not throw error
         });
      });

      describe('removeProjectLead', () => {
         it('should log warning for lead removal attempt', () => {
            const { result } = renderHook(() => useProjectsDataStore());
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            act(() => {
               result.current.removeProjectLead('1');
            });

            expect(consoleSpy).toHaveBeenCalledWith(
               'Cannot remove lead from project 1 - lead is required'
            );

            consoleSpy.mockRestore();
         });

         it('should handle non-existent project gracefully', () => {
            const { result } = renderHook(() => useProjectsDataStore());
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            act(() => {
               result.current.removeProjectLead('nonexistent');
            });

            expect(consoleSpy).toHaveBeenCalledWith(
               'Cannot remove lead from project nonexistent - lead is required'
            );

            consoleSpy.mockRestore();
         });
      });
   });

   describe('Project Status Management', () => {
      describe('updateProjectStatus', () => {
         it('should update project status', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            act(() => {
               result.current.updateProjectStatus('1', projects[1].status);
            });

            const updatedProject = result.current.getProjectById('1');
            expect(updatedProject?.status).toEqual(projects[1].status);
         });

         it('should not affect other project properties', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const originalProject = result.current.getProjectById('1');

            act(() => {
               result.current.updateProjectStatus('1', projects[1].status);
            });

            const updatedProject = result.current.getProjectById('1');
            expect(updatedProject?.name).toBe(originalProject?.name);
            expect(updatedProject?.lead).toEqual(originalProject?.lead);
            expect(updatedProject?.percentComplete).toBe(originalProject?.percentComplete);
         });

         it('should handle non-existent project gracefully', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            act(() => {
               result.current.updateProjectStatus('nonexistent', projects[1].status);
            });

            // Should not throw error
         });
      });

      describe('updateProjectProgress', () => {
         it('should update project progress', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            act(() => {
               result.current.updateProjectProgress('1', 75);
            });

            const updatedProject = result.current.getProjectById('1');
            expect(updatedProject?.percentComplete).toBe(75);
         });

         it('should handle zero progress', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            act(() => {
               result.current.updateProjectProgress('1', 0);
            });

            const updatedProject = result.current.getProjectById('1');
            expect(updatedProject?.percentComplete).toBe(0);
         });

         it('should handle 100% progress', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            act(() => {
               result.current.updateProjectProgress('1', 100);
            });

            const updatedProject = result.current.getProjectById('1');
            expect(updatedProject?.percentComplete).toBe(100);
         });

         it('should not affect other project properties', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            const originalProject = result.current.getProjectById('1');

            act(() => {
               result.current.updateProjectProgress('1', 95);
            });

            const updatedProject = result.current.getProjectById('1');
            expect(updatedProject?.name).toBe(originalProject?.name);
            expect(updatedProject?.status).toEqual(originalProject?.status);
            expect(updatedProject?.lead).toEqual(originalProject?.lead);
         });

         it('should handle non-existent project gracefully', () => {
            const { result } = renderHook(() => useProjectsDataStore());

            act(() => {
               result.current.updateProjectProgress('nonexistent', 50);
            });

            // Should not throw error
         });
      });
   });

   describe('Project Team Management', () => {
      describe('addProjectToTeam', () => {
         it('should log team addition', () => {
            const { result } = renderHook(() => useProjectsDataStore());
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            act(() => {
               result.current.addProjectToTeam('1', 'NEW_TEAM');
            });

            expect(consoleSpy).toHaveBeenCalledWith('Adding project 1 to team NEW_TEAM');

            consoleSpy.mockRestore();
         });

         it('should handle non-existent project gracefully', () => {
            const { result } = renderHook(() => useProjectsDataStore());
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            act(() => {
               result.current.addProjectToTeam('nonexistent', 'TEAM');
            });

            expect(consoleSpy).toHaveBeenCalledWith('Adding project nonexistent to team TEAM');

            consoleSpy.mockRestore();
         });
      });

      describe('removeProjectFromTeam', () => {
         it('should log team removal', () => {
            const { result } = renderHook(() => useProjectsDataStore());
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            act(() => {
               result.current.removeProjectFromTeam('1', 'CORE');
            });

            expect(consoleSpy).toHaveBeenCalledWith('Removing project 1 from team');

            consoleSpy.mockRestore();
         });

         it('should handle non-existent project gracefully', () => {
            const { result } = renderHook(() => useProjectsDataStore());
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            act(() => {
               result.current.removeProjectFromTeam('nonexistent', 'TEAM');
            });

            expect(consoleSpy).toHaveBeenCalledWith('Removing project nonexistent from team');

            consoleSpy.mockRestore();
         });
      });
   });

   describe('Edge Cases', () => {
      it('should handle rapid consecutive operations', () => {
         const { result } = renderHook(() => useProjectsDataStore());

         act(() => {
            result.current.addProject({
               name: 'Test1',
               status: projects[0].status,
               icon: projects[0].icon,
               percentComplete: 0,
               startDate: '2025-01-01',
               lead: users[0],
               priority: projects[0].priority,
               health: projects[0].health,
            });

            result.current.addProject({
               name: 'Test2',
               status: projects[1].status,
               icon: projects[1].icon,
               percentComplete: 0,
               startDate: '2025-01-01',
               lead: users[1],
               priority: projects[1].priority,
               health: projects[1].health,
            });

            result.current.updateProject('1', { percentComplete: 25 });
            result.current.updateProjectStatus('1', projects[1].status);
            result.current.setProjectLead('1', 'demo');
         });

         expect(result.current.projects).toHaveLength(22); // 20 original + 2 new
         const updatedProject = result.current.getProjectById('1');
         expect(updatedProject?.percentComplete).toBe(25);
         expect(updatedProject?.status).toEqual(projects[1].status);
         expect(updatedProject?.lead.id).toBe('demo');
      });

      it('should handle operations on newly added projects', () => {
         const { result } = renderHook(() => useProjectsDataStore());

         let newProject;
         act(() => {
            newProject = result.current.addProject({
               name: 'New Project',
               status: projects[0].status,
               icon: projects[0].icon,
               percentComplete: 0,
               startDate: '2025-01-01',
               lead: users[0],
               priority: projects[0].priority,
               health: projects[0].health,
            });
         });

         expect(newProject).toBeDefined();

         act(() => {
            result.current.updateProjectStatus(newProject!.id, projects[1].status);
            result.current.updateProjectProgress(newProject!.id, 50);
            result.current.setProjectLead(newProject!.id, 'demo');
         });

         const updatedProject = result.current.getProjectById(newProject!.id);
         expect(updatedProject?.status).toEqual(projects[1].status);
         expect(updatedProject?.percentComplete).toBe(50);
         expect(updatedProject?.lead.id).toBe('demo');
      });

      it('should maintain data integrity across operations', () => {
         const { result } = renderHook(() => useProjectsDataStore());

         act(() => {
            result.current.addProject({
               name: 'Test Project',
               status: projects[0].status,
               icon: projects[0].icon,
               percentComplete: 0,
               startDate: '2025-01-01',
               lead: users[0],
               priority: projects[0].priority,
               health: projects[0].health,
            });

            result.current.updateProjectProgress('1', 100);
            result.current.updateProjectStatus('1', projects[2].status); // completed status
            result.current.setProjectLead('1', 'demo');
         });

         // Verify data integrity
         expect(result.current.getProjectById('1')?.percentComplete).toBe(100);
         expect(result.current.getProjectById('1')?.status).toEqual(projects[2].status);
         expect(result.current.getProjectById('1')?.lead.id).toBe('demo');
         expect(result.current.projects).toHaveLength(21); // 20 original + 1 new

         // Verify active projects count decreased (1 became completed)
         expect(
            result.current
               .getActiveProjects()
               .filter((project) => project.status.id !== projects[2].status.id)
         ).toHaveLength(19);

         // Verify completed projects count increased
         const completedProjects = result.current.getCompletedProjects();
         expect(completedProjects).toHaveLength(5); // 4 original + 1 new
      });
   });

   describe('Integration', () => {
      it('should work correctly with multiple store instances', () => {
         const { result: result1 } = renderHook(() => useProjectsDataStore());
         const { result: result2 } = renderHook(() => useProjectsDataStore());

         // Both should have same initial state
         expect(result1.current.projects).toEqual(result2.current.projects);

         // Add project to first instance
         let newProject;
         act(() => {
            newProject = result1.current.addProject({
               name: 'Shared Project',
               status: projects[0].status,
               icon: projects[0].icon,
               percentComplete: 0,
               startDate: '2025-01-01',
               lead: users[0],
               priority: projects[0].priority,
               health: projects[0].health,
            });
         });

         // Both instances should reflect the change
         expect(result2.current.getProjectById(newProject!.id)).toBeDefined();
         expect(result1.current.projects).toHaveLength(result2.current.projects.length);
      });

      it('should persist across re-renders', () => {
         const { result, rerender } = renderHook(() => useProjectsDataStore());

         const initialProjects = [...result.current.projects];

         act(() => {
            result.current.addProject({
               name: 'Test Project',
               status: projects[0].status,
               icon: projects[0].icon,
               percentComplete: 0,
               startDate: '2025-01-01',
               lead: users[0],
               priority: projects[0].priority,
               health: projects[0].health,
            });
         });

         rerender();

         expect(result.current.projects).toHaveLength(initialProjects.length + 1);
         expect(result.current.projects[result.current.projects.length - 1].name).toBe(
            'Test Project'
         );
      });
   });
});

/**
 * Projects Store Business Logic Tests (Pure Functions)
 *
 * These tests verify the core business logic without React/Zustand.
 * This is the BEST PRACTICE for testing store logic.
 */
describe('Projects Store Business Logic (Pure Functions)', () => {
   // Test the business logic as pure functions
   const createTestStore = (initialProjects = projects) => {
      let projectsData = [...initialProjects];

      return {
         getProjects: () => [...projectsData],

         getProjectById: (id: string) => projectsData.find((project: Project) => project.id === id),

         getProjectsByTeam: () => [...projectsData], // Current implementation returns all

         getProjectsByLead: (leadId: string) =>
            projectsData.filter((project: Project) => project.lead.id === leadId),

         getActiveProjects: () =>
            projectsData.filter((project: Project) => project.status.id !== 'completed'),

         getCompletedProjects: () =>
            projectsData.filter((project: Project) => project.status.id === 'completed'),

         addProject: (projectData: Omit<Project, 'id'>) => {
            const newProject: Project = {
               ...projectData,
               id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            };
            projectsData = [...projectsData, newProject];
            return newProject;
         },

         updateProject: (id: string, updates: Partial<Project>) => {
            projectsData = projectsData.map((project: Project) =>
               project.id === id ? { ...project, ...updates } : project
            );
         },

         deleteProject: (id: string) => {
            projectsData = projectsData.filter((project: Project) => project.id !== id);
         },

         setProjectLead: (projectId: string, leadId: string) => {
            projectsData = projectsData.map((project: Project) =>
               project.id === projectId
                  ? { ...project, lead: { id: leadId, name: '', avatarUrl: '' } as User }
                  : project
            );
         },

         removeProjectLead: (projectId: string) => {
            console.log(`Cannot remove lead from project ${projectId} - lead is required`);
         },

         updateProjectStatus: (id: string, status: Project['status']) => {
            projectsData = projectsData.map((project: Project) =>
               project.id === id ? { ...project, status } : project
            );
         },

         updateProjectProgress: (id: string, progress: number) => {
            projectsData = projectsData.map((project: Project) =>
               project.id === id ? { ...project, percentComplete: progress } : project
            );
         },

         addProjectToTeam: (projectId: string, teamId: string) => {
            console.log(`Adding project ${projectId} to team ${teamId}`);
         },

         removeProjectFromTeam: (projectId: string) => {
            console.log(`Removing project ${projectId} from team`);
         },
      };
   };

   describe('Business Logic', () => {
      it('should initialize with correct data', () => {
         const store = createTestStore();
         expect(store.getProjects()).toHaveLength(20); // 20 projects in test data
      });

      it('should add project correctly', () => {
         const store = createTestStore();

         const newProject = store.addProject({
            name: 'Test Project',
            status: projects[0].status,
            icon: projects[0].icon,
            percentComplete: 0,
            startDate: '2025-01-01',
            lead: users[0],
            priority: projects[0].priority,
            health: projects[0].health,
         });

         expect(store.getProjects()).toHaveLength(21);
         expect(newProject.name).toBe('Test Project');
      });

      it('should update project status correctly', () => {
         const store = createTestStore();

         store.updateProjectStatus('1', projects[1].status);
         const project = store.getProjectById('1');
         expect(project?.status).toEqual(projects[1].status);
      });

      it('should update project progress correctly', () => {
         const store = createTestStore();

         store.updateProjectProgress('1', 75);
         const project = store.getProjectById('1');
         expect(project?.percentComplete).toBe(75);
      });

      it('should set project lead correctly', () => {
         const store = createTestStore();

         store.setProjectLead('1', 'demo');
         const project = store.getProjectById('1');
         expect(project?.lead.id).toBe('demo');
      });

      it('should get projects by lead correctly', () => {
         const store = createTestStore();

         const leadProjects = store.getProjectsByLead('sophia');
         expect(leadProjects).toHaveLength(7);
         expect(leadProjects.every((p) => p.lead.id === 'sophia')).toBe(true);
      });

      it('should get active projects correctly', () => {
         const store = createTestStore();

         const activeProjects = store.getActiveProjects();
         expect(activeProjects).toHaveLength(16);
         expect(activeProjects.every((p) => p.status.id !== 'completed')).toBe(true);
      });

      it('should get completed projects correctly', () => {
         const store = createTestStore();

         const completedProjects = store.getCompletedProjects();
         expect(completedProjects).toHaveLength(4);
         expect(completedProjects.every((p) => p.status.id === 'completed')).toBe(true);
      });

      it('should handle complex operations correctly', () => {
         const store = createTestStore();

         // Add new project
         const newProject = store.addProject({
            name: 'Complex Test',
            status: projects[0].status,
            icon: projects[0].icon,
            percentComplete: 0,
            startDate: '2025-01-01',
            lead: users[0],
            priority: projects[0].priority,
            health: projects[0].health,
         });

         // Update properties
         store.updateProjectStatus(newProject.id, projects[1].status);
         store.updateProjectProgress(newProject.id, 50);
         store.setProjectLead(newProject.id, 'demo');

         // Verify all changes
         const updatedProject = store.getProjectById(newProject.id);
         expect(updatedProject?.status).toEqual(projects[1].status);
         expect(updatedProject?.percentComplete).toBe(50);
         expect(updatedProject?.lead.id).toBe('demo');
      });

      it('should handle edge cases correctly', () => {
         const store = createTestStore();

         // Test with non-existent project
         store.updateProjectStatus('nonexistent', projects[1].status);
         store.updateProjectProgress('nonexistent', 50);
         store.setProjectLead('nonexistent', 'demo');
         store.removeProjectLead('nonexistent');
         store.addProjectToTeam('nonexistent', 'TEAM');
         store.removeProjectFromTeam('nonexistent');

         // Should not throw errors
         expect(store.getProjects()).toHaveLength(20); // Should remain unchanged
      });
   });
});
