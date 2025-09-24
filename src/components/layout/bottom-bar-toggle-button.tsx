import React from 'react';

type BottomBarMode = 'push' | 'overlay';

export function BottomBarToggleButton({
   mode,
   onToggle,
   size = 36,
   className = '',
   titlePush = 'Push mode: bottom bar docks and pushes content',
   titleOverlay = 'Overlay mode: bottom bar floats over content',
}: {
   mode: BottomBarMode;
   onToggle: (next: BottomBarMode) => void;
   size?: number;
   className?: string;
   titlePush?: string;
   titleOverlay?: string;
}) {
   const isPush = mode === 'push';
   const next = isPush ? 'overlay' : 'push';
   const label = isPush ? titlePush : titleOverlay;

   return (
      <button
         type="button"
         onClick={() => onToggle(next)}
         aria-pressed={isPush} // pressed = docked/push
         aria-label={label}
         title={label}
         style={{ width: size, height: size }}
         className={
            'inline-flex items-center justify-center rounded-lg border border-neutral-400 ' +
            'bg-white hover:bg-neutral-50 focus:outline-none focus-visible:ring ' +
            className
         }
      >
         {isPush ? <PushIcon /> : <OverlayIcon />}
      </button>
   );
}

/** PUSH icon: large content rectangle with a short baseline underneath */
function PushIcon(props: React.SVGProps<SVGSVGElement>) {
   return (
      <svg
         viewBox="0 0 24 24"
         width="20"
         height="20"
         stroke="currentColor"
         fill="none"
         strokeWidth="1.8"
         strokeLinecap="round"
         strokeLinejoin="round"
         {...props}
      >
         {/* content area */}
         <rect x="6" y="5" width="12" height="9" rx="1.8" />
         {/* baseline representing docked bar at the bottom */}
         <path d="M7 18h10" />
      </svg>
   );
}

/** OVERLAY icon: small rectangle overlapping the bottom of a larger rectangle */
function OverlayIcon(props: React.SVGProps<SVGSVGElement>) {
   return (
      <svg
         viewBox="0 0 24 24"
         width="20"
         height="20"
         stroke="currentColor"
         fill="none"
         strokeWidth="1.8"
         strokeLinecap="round"
         strokeLinejoin="round"
         {...props}
      >
         {/* larger content panel */}
         <rect x="6" y="4" width="12" height="10" rx="1.8" />
         {/* floating bottom bar overlapping content */}
         <rect x="9" y="14" width="6" height="4" rx="1.2" />
      </svg>
   );
}
