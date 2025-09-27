/**
 * Teams Data Store Tests - Comprehensive Test Suite
 *
 * This test suite covers all functionality of the useTeamsDataStore:
 * - Team retrieval functions
 * - Team management (CRUD operations)
 * - Team membership management
 * - Team member management
 * - Team project management
 * - Team settings management
 * - Edge cases and error handling
 *
 * The store manages test teams with various members, projects, and settings.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTeamsDataStore } from '../../features/teams/state/teams-data-store';
import { teams } from '../../tests/test-data/teams';
import { users } from '../../tests/test-data/users';
import { projects } from '../../tests/test-data/projects';
import { mockLocalStorage } from '../utils/store-test-utils';

const localStorageMock = mockLocalStorage();

describe('useTeamsDataStore', () => {
   beforeEach(() => {
      // Mock localStorage for any potential persistence
      Object.defineProperty(window, 'localStorage', {
         value: localStorageMock,
         writable: true,
      });

      // Reset store state before each test
      useTeamsDataStore.setState({ teams: teams });
   });

   afterEach(() => {
      vi.clearAllMocks();
   });

   describe('Initial State', () => {
      it('should initialize with mock team data', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         expect(result.current.teams).toEqual(teams);
         expect(result.current.teams).toHaveLength(teams.length);
      });

      it('should have correct team types', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         expect(result.current.teams[0]).toEqual(
            expect.objectContaining({
               id: expect.any(String),
               name: expect.any(String),
               icon: expect.any(String),
               joined: expect.any(Boolean),
               color: expect.any(String),
               members: expect.any(Array),
               projects: expect.any(Array),
            })
         );
      });
   });

   describe('Team Retrieval Functions', () => {
      it('should get all teams', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const allTeams = result.current.getAllTeams();
         expect(allTeams).toEqual(teams);
         expect(allTeams).toHaveLength(teams.length);
      });

      it('should get team by ID', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const team = result.current.getTeamById('CORE');
         expect(team).toBeDefined();
         expect(team?.name).toBe('HeySpex Core');
         expect(team?.joined).toBe(true);
      });

      it('should return undefined for non-existent team ID', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const team = result.current.getTeamById('NON_EXISTENT');
         expect(team).toBeUndefined();
      });

      it('should get joined teams', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const joinedTeams = result.current.getJoinedTeams();
         expect(joinedTeams).toHaveLength(teams.filter((team) => team.joined).length);
         expect(joinedTeams.every((team) => team.joined)).toBe(true);
      });

      it('should get available teams', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const availableTeams = result.current.getAvailableTeams();
         expect(availableTeams).toHaveLength(teams.filter((team) => !team.joined).length);
         expect(availableTeams.every((team) => !team.joined)).toBe(true);
      });
   });

   describe('Team Management (CRUD Operations)', () => {
      it('should add a new team', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const newTeamData = {
            name: 'Test Team',
            icon: '🧪',
            joined: false,
            color: '#FF00FF',
            members: [],
            projects: [],
         };

         let newTeam;
         act(() => {
            newTeam = result.current.addTeam(newTeamData);
         });

         expect(newTeam).toBeDefined();
         expect(newTeam?.name).toBe('Test Team');
         expect(newTeam?.id).toMatch(/^team_\d+_[a-z0-9]+$/);
         expect(result.current.teams).toHaveLength(teams.length + 1);
         expect(result.current.teams).toContain(newTeam);
      });

      it('should update an existing team', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         act(() => {
            result.current.updateTeam('CORE', { name: 'Updated Core Team' });
         });

         const updatedTeam = result.current.getTeamById('CORE');
         expect(updatedTeam?.name).toBe('Updated Core Team');
         expect(updatedTeam?.icon).toBe('🛠️'); // Other properties should remain unchanged
      });

      it('should update multiple team properties', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         act(() => {
            result.current.updateTeam('CORE', {
               name: 'New Core Team',
               color: '#00FFFF',
               icon: '⚡',
            });
         });

         const updatedTeam = result.current.getTeamById('CORE');
         expect(updatedTeam?.name).toBe('New Core Team');
         expect(updatedTeam?.color).toBe('#00FFFF');
         expect(updatedTeam?.icon).toBe('⚡');
      });

      it('should delete a team', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         act(() => {
            result.current.deleteTeam('CORE');
         });

         expect(result.current.teams).toHaveLength(teams.length - 1);
         expect(result.current.getTeamById('CORE')).toBeUndefined();
      });

      it('should not affect other teams when deleting', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         // First, add a test team to delete
         let testTeam;
         act(() => {
            testTeam = result.current.addTeam({
               name: 'Test Team for Deletion',
               icon: '🧪',
               joined: false,
               color: '#FF00FF',
               members: [],
               projects: [],
            });
         });

         const initialTeamCount = result.current.teams.length;
         const coreTeam = result.current.getTeamById('CORE');
         const designTeam = result.current.getTeamById('DESIGN');

         act(() => {
            result.current.deleteTeam(testTeam!.id);
         });

         const remainingTeams = result.current.getAllTeams();
         expect(remainingTeams).toHaveLength(initialTeamCount - 1);
         expect(remainingTeams).not.toContain(expect.objectContaining({ id: testTeam!.id }));
         expect(remainingTeams).toContain(coreTeam);
         expect(remainingTeams).toContain(designTeam);
      });
   });

   describe('Team Membership Management', () => {
      it('should join a team', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         // First, ensure the team is not joined
         act(() => {
            result.current.leaveTeam('CORE');
         });

         expect(result.current.getTeamById('CORE')?.joined).toBe(false);

         act(() => {
            result.current.joinTeam('CORE');
         });

         expect(result.current.getTeamById('CORE')?.joined).toBe(true);
      });

      it('should leave a team', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         // First, ensure the team is joined
         act(() => {
            result.current.joinTeam('CORE');
         });

         expect(result.current.getTeamById('CORE')?.joined).toBe(true);

         act(() => {
            result.current.leaveTeam('CORE');
         });

         expect(result.current.getTeamById('CORE')?.joined).toBe(false);
      });

      it('should not affect other teams when joining/leaving', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const initialDesignJoined = result.current.getTeamById('DESIGN')?.joined;

         act(() => {
            result.current.joinTeam('CORE');
         });

         expect(result.current.getTeamById('DESIGN')?.joined).toBe(initialDesignJoined);
      });
   });

   describe('Team Member Management', () => {
      it('should add a member to a team', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const newMember = users[0];
         const initialMemberCount = result.current.getTeamById('CORE')?.members.length || 0;

         act(() => {
            result.current.addMemberToTeam('CORE', newMember);
         });

         const team = result.current.getTeamById('CORE');
         expect(team?.members).toHaveLength(initialMemberCount + 1);
         expect(team?.members).toContain(newMember);
      });

      it('should remove a member from a team', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const team = result.current.getTeamById('CORE');
         const memberToRemove = team?.members[0];
         const initialMemberCount = team?.members.length || 0;

         if (memberToRemove) {
            act(() => {
               result.current.removeMemberFromTeam('CORE', memberToRemove.id);
            });

            const updatedTeam = result.current.getTeamById('CORE');
            expect(updatedTeam?.members).toHaveLength(initialMemberCount - 1);
            expect(updatedTeam?.members).not.toContain(memberToRemove);
         }
      });

      it('should not affect other teams when managing members', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const designTeamInitialMembers = result.current.getTeamById('DESIGN')?.members.length || 0;

         act(() => {
            result.current.addMemberToTeam('CORE', users[0]);
         });

         expect(result.current.getTeamById('DESIGN')?.members).toHaveLength(
            designTeamInitialMembers
         );
      });
   });

   describe('Team Project Management', () => {
      it('should add a project to a team', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const newProject = projects[0];
         const initialProjectCount = result.current.getTeamById('CORE')?.projects.length || 0;

         act(() => {
            result.current.addProjectToTeam('CORE', newProject);
         });

         const team = result.current.getTeamById('CORE');
         expect(team?.projects).toHaveLength(initialProjectCount + 1);
         expect(team?.projects).toContain(newProject);
      });

      it('should remove a project from a team', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const team = result.current.getTeamById('CORE');
         const projectToRemove = team?.projects[0];
         const initialProjectCount = team?.projects.length || 0;

         if (projectToRemove) {
            act(() => {
               result.current.removeProjectFromTeam('CORE', projectToRemove.id);
            });

            const updatedTeam = result.current.getTeamById('CORE');
            expect(updatedTeam?.projects).toHaveLength(initialProjectCount - 1);
            expect(updatedTeam?.projects).not.toContain(projectToRemove);
         }
      });

      it('should not affect other teams when managing projects', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const designTeamInitialProjects =
            result.current.getTeamById('DESIGN')?.projects.length || 0;

         act(() => {
            result.current.addProjectToTeam('CORE', projects[0]);
         });

         expect(result.current.getTeamById('DESIGN')?.projects).toHaveLength(
            designTeamInitialProjects
         );
      });
   });

   describe('Team Settings Management', () => {
      it('should update team color', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         act(() => {
            result.current.updateTeamColor('CORE', '#FF00FF');
         });

         const team = result.current.getTeamById('CORE');
         expect(team?.color).toBe('#FF00FF');
      });

      it('should update team icon', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         act(() => {
            result.current.updateTeamIcon('CORE', '🚀');
         });

         const team = result.current.getTeamById('CORE');
         expect(team?.icon).toBe('🚀');
      });

      it('should not affect other teams when updating settings', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const designTeamInitialColor = result.current.getTeamById('DESIGN')?.color;

         act(() => {
            result.current.updateTeamColor('CORE', '#FF00FF');
         });

         expect(result.current.getTeamById('DESIGN')?.color).toBe(designTeamInitialColor);
      });
   });

   describe('Edge Cases and Error Handling', () => {
      it('should handle operations on non-existent teams gracefully', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const initialTeamCount = result.current.teams.length;

         // These operations should not throw errors
         expect(() => {
            act(() => {
               result.current.updateTeam('NON_EXISTENT', { name: 'Test' });
               result.current.deleteTeam('NON_EXISTENT');
               result.current.joinTeam('NON_EXISTENT');
               result.current.leaveTeam('NON_EXISTENT');
               result.current.addMemberToTeam('NON_EXISTENT', users[0]);
               result.current.removeMemberFromTeam('NON_EXISTENT', 'member_id');
               result.current.addProjectToTeam('NON_EXISTENT', projects[0]);
               result.current.removeProjectFromTeam('NON_EXISTENT', 'project_id');
               result.current.updateTeamColor('NON_EXISTENT', '#FF0000');
               result.current.updateTeamIcon('NON_EXISTENT', '🎯');
            });
         }).not.toThrow();

         // Team count should remain unchanged
         expect(result.current.teams).toHaveLength(initialTeamCount);
      });

      it('should handle empty arrays in member and project operations', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         // Create a team with no members or projects
         let newTeam;
         act(() => {
            newTeam = result.current.addTeam({
               name: 'Empty Team',
               icon: '📦',
               joined: false,
               color: '#000000',
               members: [],
               projects: [],
            });
         });

         expect(newTeam).toBeDefined();
         expect(newTeam?.members).toHaveLength(0);
         expect(newTeam?.projects).toHaveLength(0);

         // Operations on empty arrays should work
         act(() => {
            result.current.addMemberToTeam(newTeam!.id, users[0]);
            result.current.addProjectToTeam(newTeam!.id, projects[0]);
         });

         const updatedTeam = result.current.getTeamById(newTeam!.id);
         expect(updatedTeam?.members).toHaveLength(1);
         expect(updatedTeam?.projects).toHaveLength(1);
      });

      it('should maintain data integrity across multiple operations', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const initialTeamCount = result.current.teams.length;

         // Perform multiple operations
         act(() => {
            // Add a team
            const newTeam = result.current.addTeam({
               name: 'Test Team',
               icon: '🧪',
               joined: false,
               color: '#FF00FF',
               members: [],
               projects: [],
            });

            // Update the team
            result.current.updateTeam(newTeam.id, { name: 'Updated Test Team' });

            // Join the team
            result.current.joinTeam(newTeam.id);

            // Add members and projects
            result.current.addMemberToTeam(newTeam.id, users[0]);
            result.current.addProjectToTeam(newTeam.id, projects[0]);

            // Update settings
            result.current.updateTeamColor(newTeam.id, '#00FFFF');
            result.current.updateTeamIcon(newTeam.id, '⚡');

            // Leave the team
            result.current.leaveTeam(newTeam.id);

            // Delete the team
            result.current.deleteTeam(newTeam.id);
         });

         // Team count should be back to initial
         expect(result.current.teams).toHaveLength(initialTeamCount);
      });
   });

   describe('State Immutability', () => {
      it('should create new state objects when updating', () => {
         const { result } = renderHook(() => useTeamsDataStore());

         const originalTeams = result.current.teams;

         act(() => {
            result.current.updateTeam('CORE', { name: 'Updated Core' });
         });

         // The teams array should be a new reference
         expect(result.current.teams).not.toBe(originalTeams);
         expect(result.current.teams).toHaveLength(originalTeams.length);
      });
   });
});
