import React from 'react';

interface SidebarIconProps {
   size?: number;
   color?: string;
}

export const SidebarClosedIcon = ({ size = 24, color = 'white' }: SidebarIconProps) => (
   <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      {/* Outer square */}
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="2" />
      {/* Divider line at 1/3 */}
      <line x1="11" y1="3" x2="11" y2="21" stroke={color} strokeWidth="2" />
   </svg>
);

export const SidebarOpenIcon = ({ size = 24, color = 'white' }: SidebarIconProps) => (
   <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      {/* Outer square */}
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="2" />
      {/* Left third filled */}
      <rect x="3" y="3" width="8" height="18" rx="3" fill={color} />
      {/* Divider line at 1/3 */}
      <line x1="11" y1="3" x2="11" y2="21" stroke={color} strokeWidth="2" />
   </svg>
);

export const SidebarRightOpenIcon = ({ size = 24, color = 'white' }: SidebarIconProps) => (
   <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      {/* Outer square */}
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="2" />
      {/* Right third filled */}
      <rect x="13" y="3" width="8" height="18" rx="3" fill={color} />
      {/* Divider line at 2/3 */}
      <line x1="13" y1="3" x2="13" y2="21" stroke={color} strokeWidth="2" />
   </svg>
);
