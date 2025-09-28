'use client';

import React from 'react';
import BaseSelector from './base-selector';
import { projects, Project } from '@/tests/test-data/projects';
import { useIssuesStore } from '@/state/store/issues-store';
import { FolderIcon } from 'lucide-react';
import type { BaseSelectorProps } from '@/components/standards/prop-interface-patterns';

interface ProjectSelectorProps
   extends Omit<
      BaseSelectorProps<Project | undefined>,
      'items' | 'getItemKey' | 'getItemLabel' | 'getItemIcon'
   > {
   /** Whether to show counts for each project */
   showCounts?: boolean;
   /** Whether to show search functionality */
   searchable?: boolean;
   /** Trigger variant for the selector */
   triggerVariant?: 'button' | 'icon' | 'ghost';
   /** Size of the trigger button */
   triggerSize?: 'default' | 'xxs' | 'xs' | 'sm' | 'lg' | 'icon';
}

/**
 * ProjectSelector - A standardized component for selecting issue projects
 *
 * This component uses the BaseSelector to provide consistent behavior across
 * all project selection use cases in the application.
 *
 * @example
 * <ProjectSelector
 *   selectedItem={project}
 *   onSelectionChange={handleProjectChange}
 *   showCounts={true}
 *   triggerVariant="button"
 * />
 */
export function ProjectSelector({
   selectedItem,
   onSelectionChange,
   showCounts = false,
   searchable = true,
   triggerVariant = 'button',
   triggerSize = 'sm',
   ...props
}: ProjectSelectorProps) {
   const { filterByProject } = useIssuesStore();

   // Create items array with undefined for no project option
   const items = React.useMemo(() => [undefined, ...projects], []);

   return (
      <BaseSelector
         selectedItem={selectedItem}
         onSelectionChange={onSelectionChange}
         items={items}
         getItemKey={(project) => project?.id || 'no-project'}
         getItemLabel={(project) => project?.name || 'No Project'}
         getItemIcon={(project) => {
            if (project) {
               const Icon = project.icon;
               return <Icon className="size-4" />;
            }
            return <FolderIcon className="size-4" />;
         }}
         getItemCount={
            showCounts
               ? (project) => filterByProject(project?.id || 'no-project').length
               : undefined
         }
         showCounts={showCounts}
         searchable={searchable}
         searchPlaceholder="Set project..."
         emptyMessage="No projects found."
         triggerVariant={triggerVariant}
         triggerSize={triggerSize}
         placeholder="No Project"
         {...props}
      />
   );
}

export default ProjectSelector;
