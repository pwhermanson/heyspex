'use client';

import React, { useState, useId, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/lib/utils';
import type { BaseSelectorProps } from '@/components/standards/prop-interface-patterns';

// Combined props for the base selector
interface BaseSelectorComponentProps<T> extends BaseSelectorProps<T> {
   // Additional props specific to the base selector
   triggerVariant?: 'button' | 'icon' | 'ghost';
   triggerSize?: 'default' | 'xxs' | 'xs' | 'sm' | 'lg' | 'icon';
   showSearch?: boolean;
   searchPlaceholder?: string;
   emptyMessage?: string;
   className?: string;
   /** Whether to show the selected item's label in the trigger */
   showLabel?: boolean;
   /** Function to get count for an item */
   getItemCount?: (item: T) => number;
   /** Whether to show counts */
   showCounts?: boolean;
   /** Function to get icon for an item */
   getItemIcon?: (item: T) => React.ReactNode;
   /** Custom trigger content renderer */
   renderTrigger?: (props: {
      selectedItem: T | null;
      selectedLabel: string;
      selectedIcon: React.ReactNode | null;
      isOpen: boolean;
      disabled: boolean;
   }) => React.ReactNode;
}

/**
 * BaseSelector - A reusable selector component that consolidates common selector patterns
 *
 * This component provides a consistent interface for all selector components (priority, status, assignee, etc.)
 * and eliminates code duplication across the codebase.
 *
 * @example
 * <BaseSelector
 *   selectedItem={priority}
 *   onSelectionChange={handlePriorityChange}
 *   items={priorities}
 *   getItemKey={(item) => item.id}
 *   getItemLabel={(item) => item.name}
 *   getItemIcon={(item) => <item.icon className="size-4" />}
 *   getItemCount={(item) => filterByPriority(item.id).length}
 *   showCounts={true}
 *   triggerVariant="button"
 * />
 */
export function BaseSelector<T>({
   selectedItem,
   onSelectionChange,
   items,
   getItemKey,
   getItemLabel,
   getItemIcon,
   getItemDisabled,
   getItemCount,
   placeholder = 'Select an option...',
   searchable = true,
   searchPlaceholder = 'Search...',
   emptyMessage = 'No options found.',
   showCounts = false,
   triggerVariant = 'button',
   triggerSize = 'sm',
   disabled = false,
   className,
   showLabel = true,
   renderTrigger,
   ...props
}: BaseSelectorComponentProps<T>) {
   const id = useId();
   const [isOpen, setIsOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');

   // Filter items based on search query
   const filteredItems = useMemo(() => {
      if (!searchable || !searchQuery) return items;

      return items.filter((item) =>
         getItemLabel(item).toLowerCase().includes(searchQuery.toLowerCase())
      );
   }, [items, searchQuery, searchable, getItemLabel]);

   // Handle item selection
   const handleItemSelect = useCallback(
      (item: T) => {
         onSelectionChange(item);
         setIsOpen(false);
         setSearchQuery('');
      },
      [onSelectionChange]
   );

   // Handle search input change
   const handleSearchChange = useCallback((value: string) => {
      setSearchQuery(value);
   }, []);

   // Get selected item details
   const selectedLabel = selectedItem ? getItemLabel(selectedItem) : placeholder;
   const selectedIcon = selectedItem && getItemIcon ? getItemIcon(selectedItem) : null;

   // Render trigger button
   const defaultRenderTrigger = () => {
      if (triggerVariant === 'icon') {
         return (
            <Button
               id={id}
               className={cn('size-7 flex items-center justify-center', className)}
               size="icon"
               variant="ghost"
               role="combobox"
               aria-expanded={isOpen}
               disabled={disabled}
               {...props}
            >
               {selectedIcon}
            </Button>
         );
      }

      if (triggerVariant === 'ghost') {
         return (
            <Button
               id={id}
               className={cn('flex items-center justify-center', className)}
               size={triggerSize}
               variant="ghost"
               role="combobox"
               aria-expanded={isOpen}
               disabled={disabled}
               {...props}
            >
               {selectedIcon}
               {showLabel && <span>{selectedLabel}</span>}
            </Button>
         );
      }

      // Default button variant
      return (
         <Button
            id={id}
            className={cn('flex items-center justify-center', className)}
            size={triggerSize}
            variant="secondary"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled}
            {...props}
         >
            {selectedIcon}
            {showLabel && <span>{selectedLabel}</span>}
         </Button>
      );
   };

   const triggerContent = renderTrigger
      ? renderTrigger({
           selectedItem,
           selectedLabel,
           selectedIcon,
           isOpen,
           disabled,
        })
      : defaultRenderTrigger();

   return (
      <div className="*:not-first:mt-2">
         <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>{triggerContent}</PopoverTrigger>
            <PopoverContent
               className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
               align="start"
            >
               <Command>
                  {searchable && (
                     <CommandInput
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onValueChange={handleSearchChange}
                     />
                  )}
                  <CommandList>
                     <CommandEmpty>{emptyMessage}</CommandEmpty>
                     <CommandGroup>
                        {filteredItems.map((item) => {
                           const itemKey = getItemKey(item);
                           const itemLabel = getItemLabel(item);
                           const itemIcon = getItemIcon ? getItemIcon(item) : null;
                           const itemCount = getItemCount ? getItemCount(item) : undefined;
                           const isDisabled = getItemDisabled ? getItemDisabled(item) : false;
                           const isSelected = selectedItem && getItemKey(selectedItem) === itemKey;

                           return (
                              <CommandItem
                                 key={itemKey}
                                 value={itemKey}
                                 onSelect={() => handleItemSelect(item)}
                                 className="flex items-center justify-between"
                                 disabled={isDisabled}
                              >
                                 <div className="flex items-center gap-2">
                                    {itemIcon}
                                    <span>{itemLabel}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    {isSelected && <CheckIcon size={16} className="ml-auto" />}
                                    {showCounts && itemCount !== undefined && (
                                       <span className="text-muted-foreground text-xs">
                                          {itemCount}
                                       </span>
                                    )}
                                 </div>
                              </CommandItem>
                           );
                        })}
                     </CommandGroup>
                  </CommandList>
               </Command>
            </PopoverContent>
         </Popover>
      </div>
   );
}

export default BaseSelector;
