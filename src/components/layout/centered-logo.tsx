'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/lib/utils';

interface CenteredLogoProps {
   className?: string;
}

export function CenteredLogo({ className }: CenteredLogoProps) {
   const [isMouseOver, setIsMouseOver] = useState(false);
   const [isMouseMoving, setIsMouseMoving] = useState(false);
   const [isIdle, setIsIdle] = useState(false);
   const [isFading, setIsFading] = useState(false);
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
   const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const logoRef = useRef<HTMLDivElement>(null);

   // Helper function to clear timeouts without nullifying refs (for reuse)
   const clearTimeoutsOnly = useCallback(() => {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
         clearTimeout(fadeTimeoutRef.current);
      }
   }, []);

   const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
         // Always update mouse position immediately for smooth tracking
         if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePosition({ x, y });
         }

         // Set mouse moving state immediately
         setIsMouseMoving(true);

         // Clear existing timeouts
         clearTimeoutsOnly();

         // Activate effects immediately - no delay
         setIsMouseOver(true);

         setIsIdle(false);
         setIsFading(false);

         // Set new timeout for idle detection
         timeoutRef.current = setTimeout(() => {
            setIsIdle(true);
            setIsMouseMoving(false);
            // Start fade immediately after idle (total delay = 0.5 seconds)
            fadeTimeoutRef.current = setTimeout(() => {
               setIsFading(true);
            }, 0); // No additional delay - fade starts immediately after idle
         }, 500); // 0.5 second idle timeout
      },
      [clearTimeoutsOnly]
   );

   // Helper function to get logo center and distance from mouse (memoized)
   const getLogoCenterAndDistance = useCallback(() => {
      if (!logoRef.current || !containerRef.current) return null;

      const logoRect = logoRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Get logo center relative to container
      const logoCenterX = logoRect.left + logoRect.width / 2 - containerRect.left;
      const logoCenterY = logoRect.top + logoRect.height / 2 - containerRect.top;

      // Calculate distance from mouse to logo center
      const distance = Math.sqrt(
         Math.pow(mousePosition.x - logoCenterX, 2) + Math.pow(mousePosition.y - logoCenterY, 2)
      );

      return { logoCenterX, logoCenterY, distance };
   }, [mousePosition.x, mousePosition.y]);

   // Calculate shadow offset, blur, and opacity based on logo's actual center (memoized)
   const getShadowOffset = useCallback(() => {
      const logoData = getLogoCenterAndDistance();
      if (!logoData) return { x: 0, y: 0, blur: 0, opacity: 1 };

      const { logoCenterX, logoCenterY, distance } = logoData;

      // Calculate offset from logo center (inverted for realistic shadow direction)
      const offsetX = -(mousePosition.x - logoCenterX) / 20;
      const offsetY = -(mousePosition.y - logoCenterY) / 20;

      // Calculate blur based on distance (closer = sharper, farther = blurrier)
      const maxDistance = 3000; // Much larger radius for sharp shadow
      const blur = Math.min(Math.pow(distance / maxDistance, 2) * 15, 15); // Quadratic curve, max 15px blur

      // Calculate opacity based on distance (closer = darker, farther = lighter)
      const opacityDistance = 400; // Start fading opacity at 400px
      const opacity = Math.max(1 - distance / opacityDistance, 0.1); // Min 10% opacity

      return { x: offsetX, y: offsetY, blur, opacity };
   }, [getLogoCenterAndDistance, mousePosition.x, mousePosition.y]);

   // Calculate swirling color based on time and position (memoized)
   const getSwirlingColor = useCallback(() => {
      const time = Date.now() / 1000; // Current time in seconds
      const angle = (time * 0.3) % (Math.PI * 2); // Much slower rotation for gentle color transitions

      // Create a swirling effect based on time and mouse position
      const swirlPhase = Math.sin(angle) * 0.5 + 0.5; // 0 to 1

      // Define color palette: blue, green, purple, pink, orange, yellow
      const colors = [
         [59, 130, 246], // Blue
         [34, 197, 94], // Green
         [147, 51, 234], // Purple
         [236, 72, 153], // Pink
         [249, 115, 22], // Orange
         [234, 179, 8], // Yellow
      ];

      // Create a smooth color cycle through all colors
      const colorIndex = (swirlPhase * (colors.length - 1)) % colors.length;
      const currentColorIndex = Math.floor(colorIndex);
      const nextColorIndex = (currentColorIndex + 1) % colors.length;
      const blendFactor = colorIndex - currentColorIndex;

      const currentColor = colors[currentColorIndex];
      const nextColor = colors[nextColorIndex];

      // Interpolate between current and next color
      const r = Math.round(currentColor[0] * (1 - blendFactor) + nextColor[0] * blendFactor);
      const g = Math.round(currentColor[1] * (1 - blendFactor) + nextColor[1] * blendFactor);
      const b = Math.round(currentColor[2] * (1 - blendFactor) + nextColor[2] * blendFactor);

      return `rgba(${r}, ${g}, ${b}, ${getShadowOffset().opacity})`;
   }, [getShadowOffset]);

   // Calculate glow intensity based on distance from logo (memoized)
   const getGlowIntensity = useCallback(() => {
      const logoData = getLogoCenterAndDistance();
      if (!logoData) return 1;

      const { distance } = logoData;

      // Dim the glow as mouse gets closer (max distance of 200px for full glow)
      const maxDistance = 200;
      const intensity = Math.min(distance / maxDistance, 1);

      return Math.max(intensity, 0.1); // Minimum 10% intensity
   }, [getLogoCenterAndDistance]);

   // Calculate grid line opacity based on distance from logo (memoized)
   const getGridLineOpacity = useCallback(() => {
      const logoData = getLogoCenterAndDistance();
      if (!logoData) return 1;

      const { distance } = logoData;

      // Lower opacity as mouse gets closer (max distance of 300px for full opacity)
      const maxDistance = 300;
      const opacity = Math.min(distance / maxDistance, 1);

      return Math.max(opacity, 0.1); // Minimum 10% opacity
   }, [getLogoCenterAndDistance]);

   // Memoized glow intensity for performance
   const glowIntensity = useMemo(() => {
      return getGlowIntensity();
   }, [getGlowIntensity]);

   // Memoized grid background style with smooth fade-in
   const gridBackgroundStyle = useMemo(() => {
      const baseOpacity = getGridLineOpacity();
      const gridOpacity = isMouseOver ? baseOpacity : 0;

      return {
         backgroundImage: `
            linear-gradient(45deg, rgba(34, 197, 94, ${0.03 * baseOpacity}) 0%, rgba(59, 130, 246, ${0.03 * baseOpacity}) 100%),
            linear-gradient(45deg, rgba(147, 51, 234, ${0.03 * baseOpacity}) 0%, rgba(236, 72, 153, ${0.03 * baseOpacity}) 100%),
            linear-gradient(45deg, rgba(249, 115, 22, ${0.02 * baseOpacity}) 0%, rgba(234, 179, 8, ${0.02 * baseOpacity}) 100%),
            linear-gradient(-45deg, rgba(59, 130, 246, ${0.015 * baseOpacity}) 0%, rgba(147, 51, 234, ${0.015 * baseOpacity}) 100%)
         `,
         backgroundSize: '100vw 100vh, 100vw 100vh, 100vw 100vh, 100vw 100vh',
         backgroundPosition: '0 0, 0 0, 0 0, 0 0',
         backgroundRepeat: 'repeat',
         maskImage: `
            repeating-linear-gradient(to right, black 0px, black 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(to bottom, black 0px, black 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(45deg, transparent 0px, transparent 200px, black 201px, black 202px, transparent 202px, transparent 220px),
            repeating-linear-gradient(-45deg, transparent 0px, transparent 300px, black 301px, black 302px, transparent 302px, transparent 320px)
         `,
         maskSize: '800px 800px, 800px 800px, 400px 400px, 600px 600px',
         maskPosition: '0 0, 0 0, 50px 50px, 100px 100px',
         maskRepeat: 'repeat',
         transition: isFading ? 'opacity 2.5s ease-out' : 'opacity 0.4s ease-out',
         opacity: isFading ? 0 : gridOpacity,
      };
   }, [isMouseOver, isFading, getGridLineOpacity]);

   // Memoized filter and transition values for logo
   const logoStyle = useMemo(() => {
      let filterValue;

      if (isFading) {
         // Fading state: white logo (like the clean state)
         filterValue = 'brightness(0) invert(1)'; // Black to white
      } else if (isMouseOver && !isIdle) {
         // Active state: full effects
         filterValue = `drop-shadow(${getShadowOffset().x}px ${getShadowOffset().y}px ${getShadowOffset().blur}px ${getSwirlingColor()}) brightness(1)`;
      } else {
         // Default state: dimmed
         filterValue = 'brightness(0.7)';
      }

      const transitionValue = isFading
         ? 'filter 0.875s ease-out, -webkit-filter 0.875s ease-out'
         : 'filter 0.125s ease-out, -webkit-filter 0.125s ease-out';

      return {
         filter: filterValue,
         WebkitFilter: filterValue,
         transition: transitionValue,
         opacity: 1, // Always visible, just changes color
      } as React.CSSProperties;
   }, [isMouseOver, isIdle, isFading, getShadowOffset, getSwirlingColor]);

   // Helper function to clear all timeouts
   const clearAllTimeouts = useCallback(() => {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
         timeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
         clearTimeout(fadeTimeoutRef.current);
         fadeTimeoutRef.current = null;
      }
   }, []);

   const handleMouseLeave = useCallback(() => {
      setIsMouseOver(false);
      setIsMouseMoving(false);
      setIsIdle(false);
      setIsFading(false);
      clearAllTimeouts();
   }, [clearAllTimeouts]);

   // Cleanup timeouts on unmount
   React.useEffect(() => {
      return clearAllTimeouts;
   }, [clearAllTimeouts]);

   return (
      <div
         ref={containerRef}
         className={cn(
            'flex flex-col items-center justify-center h-full w-full',
            'bg-background text-foreground relative overflow-hidden',
            className
         )}
         onMouseMove={handleMouseMove}
         onMouseLeave={handleMouseLeave}
      >
         {/* Grid background with gradient */}
         <div className="absolute inset-0" style={gridBackgroundStyle} />

         {/* Mouse-following glow effect */}
         {isMouseOver && (
            <div
               className="absolute inset-0 pointer-events-none"
               style={{
                  zIndex: 2,
                  background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
                     rgba(255, 255, 255, ${0.25 * glowIntensity}) 0px, 
                     rgba(255, 255, 255, ${0.2 * glowIntensity}) 80px, 
                     rgba(255, 255, 255, ${0.15 * glowIntensity}) 160px, 
                     rgba(255, 255, 255, ${0.08 * glowIntensity}) 240px, 
                     rgba(255, 255, 255, ${0.04 * glowIntensity}) 320px, 
                     transparent 400px)`,
                  mixBlendMode: 'screen',
                  transition: isFading
                     ? 'opacity 2.5s ease-out'
                     : 'background 0.125s ease-out, opacity 0.4s ease-out',
                  opacity: isFading ? 0 : isMouseMoving ? 0.7 : 0.4,
                  maskImage: `
                     repeating-linear-gradient(to right, black 0px, black 1px, transparent 1px, transparent 20px),
                     repeating-linear-gradient(to bottom, black 0px, black 1px, transparent 1px, transparent 20px),
                     repeating-linear-gradient(45deg, transparent 0px, transparent 200px, black 201px, black 202px, transparent 202px, transparent 220px),
                     repeating-linear-gradient(-45deg, transparent 0px, transparent 300px, black 301px, black 302px, transparent 302px, transparent 320px)
                  `,
                  maskSize: '800px 800px, 800px 800px, 400px 400px, 600px 600px',
                  maskPosition: '0 0, 0 0, 50px 50px, 100px 100px',
                  maskRepeat: 'repeat',
               }}
            />
         )}

         {/* Logo with Explosive Glow */}
         <div className="mb-6 group cursor-pointer relative z-10">
            {/* Solid black background logo */}
            <div
               className="h-auto w-auto max-w-[300px] absolute top-0 left-0 z-0"
               style={{
                  filter: 'brightness(0)',
                  WebkitFilter: 'brightness(0)',
               }}
            >
               <Image
                  src="/heyspex-logo-stacked.png"
                  alt=""
                  width={300}
                  height={273}
                  className="h-auto w-auto max-w-[300px]"
                  priority
               />
            </div>

            {/* Explosive Radial Glow - Hover Only */}
            <div
               className="radial-glow-explosion group-hover:radial-glow-explosion-active"
               style={{
                  width: '0px',
                  height: '0px',
                  background:
                     'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0.4) 30%, rgba(59, 130, 246, 0.2) 60%, rgba(59, 130, 246, 0.1) 80%, transparent 100%)',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                  transition:
                     'width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none',
               }}
            />

            <div
               ref={logoRef}
               className="h-auto w-auto max-w-[300px] relative z-10"
               style={logoStyle}
            >
               <Image
                  src="/heyspex-logo-stacked.png"
                  alt="HeySpex"
                  width={300}
                  height={273}
                  className="h-auto w-auto max-w-[300px]"
                  priority
               />
            </div>
         </div>

         {/* Instruction text */}
         <div className="text-center relative z-10">
            <p className="text-lg text-muted-foreground">
               Press{' '}
               <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                  Ctrl
               </kbd>{' '}
               +{' '}
               <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                  /
               </kbd>{' '}
               to get started
            </p>
         </div>
      </div>
   );
}
