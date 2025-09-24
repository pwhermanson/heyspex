'use client';

import React from 'react';
import BaseSelector from './base-selector';
import { users, User } from '@/src/tests/test-data/users';
import { useIssuesStore } from '@/src/state/store/issues-store';
import { UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import type { BaseSelectorProps } from '@/src/components/standards/prop-interface-patterns';

interface AssigneeSelectorProps
   extends Omit<
      BaseSelectorProps<User | null>,
      'items' | 'getItemKey' | 'getItemLabel' | 'getItemIcon'
   > {
   /** Whether to show counts for each assignee */
   showCounts?: boolean;
   /** Whether to show search functionality */
   searchable?: boolean;
   /** Trigger variant for the selector */
   triggerVariant?: 'button' | 'icon' | 'ghost';
   /** Size of the trigger button */
   triggerSize?: 'default' | 'xxs' | 'xs' | 'sm' | 'lg' | 'icon';
   /** Whether to filter users by team (default: CORE team) */
   filterByTeam?: string;
}

/**
 * AssigneeSelector - A standardized component for selecting issue assignees
 *
 * This component uses the BaseSelector to provide consistent behavior across
 * all assignee selection use cases in the application.
 *
 * @example
 * <AssigneeSelector
 *   selectedItem={assignee}
 *   onSelectionChange={handleAssigneeChange}
 *   showCounts={true}
 *   triggerVariant="button"
 * />
 */
export function AssigneeSelector({
   selectedItem,
   onSelectionChange,
   showCounts = false,
   searchable = true,
   triggerVariant = 'button',
   triggerSize = 'sm',
   filterByTeam = 'CORE',
   ...props
}: AssigneeSelectorProps) {
   const { filterByAssignee } = useIssuesStore();

   // Filter users by team if specified
   const filteredUsers = React.useMemo(() => {
      if (!filterByTeam) return users;
      return users.filter((user) => user.teamIds.includes(filterByTeam));
   }, [filterByTeam]);

   // Create items array with null for unassigned option
   const items = React.useMemo(() => [null, ...filteredUsers], [filteredUsers]);

   return (
      <BaseSelector
         selectedItem={selectedItem}
         onSelectionChange={onSelectionChange}
         items={items}
         getItemKey={(user) => user?.id || 'unassigned'}
         getItemLabel={(user) => user?.name || 'Unassigned'}
         getItemIcon={(user) => {
            if (user) {
               return (
                  <Avatar className="size-5">
                     <AvatarImage src={user.avatarUrl} alt={user.name} />
                     <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
               );
            }
            return <UserCircle className="size-5" />;
         }}
         getItemCount={showCounts ? (user) => filterByAssignee(user?.id || null).length : undefined}
         showCounts={showCounts}
         searchable={searchable}
         searchPlaceholder="Assign to..."
         emptyMessage="No users found."
         triggerVariant={triggerVariant}
         triggerSize={triggerSize}
         placeholder="Unassigned"
         {...props}
      />
   );
}

export default AssigneeSelector;
