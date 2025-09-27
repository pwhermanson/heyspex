'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import { PanelClosedIcon, PanelOpenIcon } from '@/components/ui/sidebar-icons';

import { useIsMobile } from '@/lib/hooks/use-mobile';
import { cn } from '@/lib/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
   Sheet,
   SheetContent,
   SheetDescription,
   SheetHeader,
   SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PANEL_COOKIE_NAME = 'panel_state';
const PANEL_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const PANEL_WIDTH = '244px'; // 16rem
const PANEL_WIDTH_MOBILE = '260px'; // 18rem
const PANEL_WIDTH_ICON = '3rem';
const PANEL_KEYBOARD_SHORTCUT = 'b';

type PanelContext = {
   state: 'expanded' | 'collapsed';
   open: boolean;
   setOpen: (open: boolean) => void;
   openMobile: boolean;
   setOpenMobile: (open: boolean) => void;
   isMobile: boolean;
   togglePanel: () => void;
};

const PanelContext = React.createContext<PanelContext | null>(null);

function usePanel() {
   const context = React.useContext(PanelContext);
   if (!context) {
      throw new Error('usePanel must be used within a PanelProvider.');
   }

   return context;
}

function PanelProvider({
   defaultOpen = true,
   open: openProp,
   onOpenChange: setOpenProp,
   className,
   style,
   children,
   ...props
}: React.ComponentProps<'div'> & {
   defaultOpen?: boolean;
   open?: boolean;
   onOpenChange?: (open: boolean) => void;
}) {
   const isMobile = useIsMobile();
   const [openMobile, setOpenMobile] = React.useState(false);

   // This is the internal state of the panel.
   // We use openProp and setOpenProp for control from outside the component.
   const [_open, _setOpen] = React.useState(defaultOpen);
   const open = openProp ?? _open;
   const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
         const openState = typeof value === 'function' ? value(open) : value;
         if (setOpenProp) {
            setOpenProp(openState);
         } else {
            _setOpen(openState);
         }

         // This sets the cookie to keep the panel state.
         document.cookie = `${PANEL_COOKIE_NAME}=${openState}; path=/; max-age=${PANEL_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open]
   );

   // Helper to toggle the panel.
   const togglePanel = React.useCallback(() => {
      return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
   }, [isMobile, setOpen, setOpenMobile]);

   // Adds a keyboard shortcut to toggle the panel.
   React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
         if (event.key === PANEL_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            togglePanel();
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [togglePanel]);

   // We add a state so that we can do data-state="expanded" or "collapsed".
   // This makes it easier to style the panel with Tailwind classes.
   const state = open ? 'expanded' : 'collapsed';

   const contextValue = React.useMemo<PanelContext>(
      () => ({
         state,
         open,
         setOpen,
         isMobile,
         openMobile,
         setOpenMobile,
         togglePanel,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, togglePanel]
   );

   return (
      <PanelContext.Provider value={contextValue}>
         <TooltipProvider delayDuration={0}>
            <div
               data-slot="panel-wrapper"
               style={
                  {
                     '--panel-width': PANEL_WIDTH,
                     '--panel-width-icon': PANEL_WIDTH_ICON,
                     ...style,
                  } as React.CSSProperties
               }
               className={cn(
                  'group/panel-wrapper has-data-[variant=inset]:bg-panel flex h-svh overflow-hidden w-full',
                  className
               )}
               {...props}
            >
               {children}
            </div>
         </TooltipProvider>
      </PanelContext.Provider>
   );
}

function Panel({
   side = 'left',
   variant = 'panel',
   collapsible = 'offcanvas',
   className,
   children,
   ...props
}: React.ComponentProps<'div'> & {
   side?: 'left' | 'right';
   variant?: 'panel' | 'floating' | 'inset';
   collapsible?: 'offcanvas' | 'icon' | 'none';
}) {
   const { isMobile, state, openMobile, setOpenMobile } = usePanel();

   if (collapsible === 'none') {
      return (
         <div
            data-slot="panel"
            className={cn(
               'bg-panel text-panel-foreground flex h-full w-(--panel-width) flex-col',
               className
            )}
            {...props}
         >
            {children}
         </div>
      );
   }

   if (isMobile) {
      return (
         <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
            <SheetContent
               data-panel="panel"
               data-slot="panel"
               data-mobile="true"
               className="bg-panel text-panel-foreground w-(--panel-width) p-0 [&>button]:hidden"
               style={
                  {
                     '--panel-width': PANEL_WIDTH_MOBILE,
                  } as React.CSSProperties
               }
               side={side}
            >
               <SheetHeader className="sr-only">
                  <SheetTitle>Panel</SheetTitle>
                  <SheetDescription>Displays the mobile panel.</SheetDescription>
               </SheetHeader>
               <div className="flex h-full w-full flex-col">{children}</div>
            </SheetContent>
         </Sheet>
      );
   }

   return (
      <div
         className="group peer text-panel-foreground hidden md:block"
         data-state={state}
         data-collapsible={state === 'collapsed' ? collapsible : ''}
         data-variant={variant}
         data-side={side}
         data-slot="panel"
      >
         <div
            className={cn(
               'relative w-(--panel-width) bg-transparent transition-[width] duration-200 ease-linear',
               'group-data-[collapsible=offcanvas]:w-0',
               'group-data-[side=right]:rotate-180',
               variant === 'floating' || variant === 'inset'
                  ? 'group-data-[collapsible=icon]:w-[calc(var(--panel-width-icon)+(--spacing(4)))]'
                  : 'group-data-[collapsible=icon]:w-(--panel-width-icon)'
            )}
         />
         <div
            className={cn(
               'fixed inset-y-0 z-10 hidden h-svh w-(--panel-width) transition-[left,right,width] duration-200 ease-linear md:flex',
               side === 'left'
                  ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--panel-width)*-1)]'
                  : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--panel-width)*-1)]',
               // Adjust the padding for floating and inset variants.
               variant === 'floating' || variant === 'inset'
                  ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--panel-width-icon)+(--spacing(4))+2px)]'
                  : 'group-data-[collapsible=icon]:w-(--panel-width-icon)',
               className
            )}
            {...props}
         >
            <div
               data-panel="panel"
               className="bg-background group-data-[variant=floating]:border-panel-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
            >
               {children}
            </div>
         </div>
      </div>
   );
}

function PanelTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
   const { togglePanel, state } = usePanel();

   return (
      <Button
         data-panel="trigger"
         data-slot="panel-trigger"
         variant="ghost"
         size="icon"
         className={cn('h-7 w-7', className)}
         onClick={(event) => {
            onClick?.(event);
            togglePanel();
         }}
         {...props}
      >
         {state === 'collapsed' ? (
            <PanelClosedIcon size={16} color="currentColor" />
         ) : (
            <PanelOpenIcon size={16} color="currentColor" />
         )}
         <span className="sr-only">Toggle Panel</span>
      </Button>
   );
}

function PanelRail({ className, ...props }: React.ComponentProps<'button'>) {
   const { togglePanel } = usePanel();

   return (
      <button
         data-panel="rail"
         data-slot="panel-rail"
         aria-label="Toggle Panel"
         tabIndex={-1}
         onClick={togglePanel}
         title="Toggle Panel"
         className={cn(
            'hover:after:bg-panel-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex',
            'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
            '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
            'hover:group-data-[collapsible=offcanvas]:bg-panel group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
            '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
            '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
            className
         )}
         {...props}
      />
   );
}

function PanelInset({ className, ...props }: React.ComponentProps<'main'>) {
   return (
      <main
         data-slot="panel-inset"
         className={cn(
            'bg-background relative flex w-full flex-1 flex-col',
            'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
            className
         )}
         {...props}
      />
   );
}

function PanelInput({ className, ...props }: React.ComponentProps<typeof Input>) {
   return (
      <Input
         data-slot="panel-input"
         data-panel="input"
         className={cn('bg-background h-8 w-full shadow-none', className)}
         {...props}
      />
   );
}

function PanelHeader({ className, ...props }: React.ComponentProps<'div'>) {
   return (
      <div
         data-slot="panel-header"
         data-panel="header"
         className={cn('flex flex-col gap-2 p-2', className)}
         {...props}
      />
   );
}

function PanelFooter({ className, ...props }: React.ComponentProps<'div'>) {
   return (
      <div
         data-slot="panel-footer"
         data-panel="footer"
         className={cn('flex flex-col gap-2 p-2', className)}
         {...props}
      />
   );
}

function PanelSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
   return (
      <Separator
         data-slot="panel-separator"
         data-panel="separator"
         className={cn('bg-panel-border mx-2 w-auto', className)}
         {...props}
      />
   );
}

function PanelContent({ className, ...props }: React.ComponentProps<'div'>) {
   return (
      <div
         data-slot="panel-content"
         data-panel="content"
         className={cn(
            'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
            className
         )}
         {...props}
      />
   );
}

function PanelGroup({ className, ...props }: React.ComponentProps<'div'>) {
   return (
      <div
         data-slot="panel-group"
         data-panel="group"
         className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
         {...props}
      />
   );
}

function PanelGroupLabel({
   className,
   asChild = false,
   ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
   const Comp = asChild ? Slot : 'div';

   return (
      <Comp
         data-slot="panel-group-label"
         data-panel="group-label"
         className={cn(
            'text-panel-foreground/70 ring-panel-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
            'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
            className
         )}
         {...props}
      />
   );
}

function PanelGroupAction({
   className,
   asChild = false,
   ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
   const Comp = asChild ? Slot : 'button';

   return (
      <Comp
         data-slot="panel-group-action"
         data-panel="group-action"
         className={cn(
            'text-panel-foreground ring-panel-ring hover:bg-panel-accent hover:text-panel-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
            // Increases the hit area of the button on mobile.
            'after:absolute after:-inset-2 md:after:hidden',
            'group-data-[collapsible=icon]:hidden',
            className
         )}
         {...props}
      />
   );
}

function PanelGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
   return (
      <div
         data-slot="panel-group-content"
         data-panel="group-content"
         className={cn('w-full text-sm', className)}
         {...props}
      />
   );
}

function PanelMenu({ className, ...props }: React.ComponentProps<'ul'>) {
   return (
      <ul
         data-slot="panel-menu"
         data-panel="menu"
         className={cn('flex w-full min-w-0 flex-col gap-1', className)}
         {...props}
      />
   );
}

function PanelMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
   return (
      <li
         data-slot="panel-menu-item"
         data-panel="menu-item"
         className={cn('group/menu-item relative', className)}
         {...props}
      />
   );
}

const panelMenuButtonVariants = cva(
   'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-panel-ring transition-[width,height,padding] hover:bg-panel-accent hover:text-panel-accent-foreground focus-visible:ring-2 active:bg-panel-accent active:text-panel-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[panel=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-panel-accent data-[active=true]:font-medium data-[active=true]:text-panel-accent-foreground data-[state=open]:hover:bg-panel-accent data-[state=open]:hover:text-panel-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
   {
      variants: {
         variant: {
            default: 'hover:bg-panel-accent hover:text-panel-accent-foreground',
            outline:
               'bg-background shadow-[0_0_0_1px_hsl(var(--panel-border))] hover:bg-panel-accent hover:text-panel-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--panel-accent))]',
         },
         size: {
            default: 'h-8 text-sm',
            sm: 'h-7 text-xs',
            lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
         },
      },
      defaultVariants: {
         variant: 'default',
         size: 'default',
      },
   }
);

function PanelMenuButton({
   asChild = false,
   isActive = false,
   variant = 'default',
   size = 'default',
   tooltip,
   className,
   ...props
}: React.ComponentProps<'button'> & {
   asChild?: boolean;
   isActive?: boolean;
   tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof panelMenuButtonVariants>) {
   const Comp = asChild ? Slot : 'button';
   const { isMobile, state } = usePanel();

   const button = (
      <Comp
         data-slot="panel-menu-button"
         data-panel="menu-button"
         data-size={size}
         data-active={isActive}
         className={cn(panelMenuButtonVariants({ variant, size }), className)}
         {...props}
      />
   );

   if (!tooltip) {
      return button;
   }

   if (typeof tooltip === 'string') {
      tooltip = {
         children: tooltip,
      };
   }

   return (
      <Tooltip>
         <TooltipTrigger asChild>{button}</TooltipTrigger>
         <TooltipContent
            side="right"
            align="center"
            hidden={state !== 'collapsed' || isMobile}
            {...tooltip}
         />
      </Tooltip>
   );
}

function PanelMenuAction({
   className,
   asChild = false,
   showOnHover = false,
   ...props
}: React.ComponentProps<'button'> & {
   asChild?: boolean;
   showOnHover?: boolean;
}) {
   const Comp = asChild ? Slot : 'button';

   return (
      <Comp
         data-slot="panel-menu-action"
         data-panel="menu-action"
         className={cn(
            'text-panel-foreground ring-panel-ring hover:bg-panel-accent hover:text-panel-accent-foreground peer-hover/menu-button:text-panel-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
            // Increases the hit area of the button on mobile.
            'after:absolute after:-inset-2 md:after:hidden',
            'peer-data-[size=sm]/menu-button:top-1',
            'peer-data-[size=default]/menu-button:top-1.5',
            'peer-data-[size=lg]/menu-button:top-2.5',
            'group-data-[collapsible=icon]:hidden',
            showOnHover &&
               'peer-data-[active=true]/menu-button:text-panel-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
            className
         )}
         {...props}
      />
   );
}

function PanelMenuBadge({ className, ...props }: React.ComponentProps<'div'>) {
   return (
      <div
         data-slot="panel-menu-badge"
         data-panel="menu-badge"
         className={cn(
            'text-panel-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none',
            'peer-hover/menu-button:text-panel-accent-foreground peer-data-[active=true]/menu-button:text-panel-accent-foreground',
            'peer-data-[size=sm]/menu-button:top-1',
            'peer-data-[size=default]/menu-button:top-1.5',
            'peer-data-[size=lg]/menu-button:top-2.5',
            'group-data-[collapsible=icon]:hidden',
            className
         )}
         {...props}
      />
   );
}

function PanelMenuSkeleton({
   className,
   showIcon = false,
   ...props
}: React.ComponentProps<'div'> & {
   showIcon?: boolean;
}) {
   // Random width between 50 to 90%.
   const width = React.useMemo(() => {
      return `${Math.floor(Math.random() * 40) + 50}%`;
   }, []);

   return (
      <div
         data-slot="panel-menu-skeleton"
         data-panel="menu-skeleton"
         className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
         {...props}
      >
         {showIcon && <Skeleton className="size-4 rounded-md" data-panel="menu-skeleton-icon" />}
         <Skeleton
            className="h-4 max-w-(--skeleton-width) flex-1"
            data-panel="menu-skeleton-text"
            style={
               {
                  '--skeleton-width': width,
               } as React.CSSProperties
            }
         />
      </div>
   );
}

function PanelMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
   return (
      <ul
         data-slot="panel-menu-sub"
         data-panel="menu-sub"
         className={cn(
            'border-panel-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
            'group-data-[collapsible=icon]:hidden',
            className
         )}
         {...props}
      />
   );
}

function PanelMenuSubItem({ className, ...props }: React.ComponentProps<'li'>) {
   return (
      <li
         data-slot="panel-menu-sub-item"
         data-panel="menu-sub-item"
         className={cn('group/menu-sub-item relative', className)}
         {...props}
      />
   );
}

function PanelMenuSubButton({
   asChild = false,
   size = 'md',
   isActive = false,
   className,
   ...props
}: React.ComponentProps<'a'> & {
   asChild?: boolean;
   size?: 'sm' | 'md';
   isActive?: boolean;
}) {
   const Comp = asChild ? Slot : 'a';

   return (
      <Comp
         data-slot="panel-menu-sub-button"
         data-panel="menu-sub-button"
         data-size={size}
         data-active={isActive}
         className={cn(
            'text-panel-foreground ring-panel-ring hover:bg-panel-accent hover:text-panel-accent-foreground active:bg-panel-accent active:text-panel-accent-foreground [&>svg]:text-panel-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
            'data-[active=true]:bg-panel-accent data-[active=true]:text-panel-accent-foreground',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            'group-data-[collapsible=icon]:hidden',
            className
         )}
         {...props}
      />
   );
}

export {
   Panel,
   PanelContent,
   PanelFooter,
   PanelGroup,
   PanelGroupAction,
   PanelGroupContent,
   PanelGroupLabel,
   PanelHeader,
   PanelInput,
   PanelInset,
   PanelMenu,
   PanelMenuAction,
   PanelMenuBadge,
   PanelMenuButton,
   PanelMenuItem,
   PanelMenuSkeleton,
   PanelMenuSub,
   PanelMenuSubButton,
   PanelMenuSubItem,
   PanelProvider,
   PanelRail,
   PanelSeparator,
   PanelTrigger,
   usePanel,
};
