'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/lib/utils';

interface CenteredLogoProps {
   className?: string;
}

export function CenteredLogo({ className }: CenteredLogoProps) {
   const [isMouseOver, setIsMouseOver] = useState(false);
   const [isIdle, setIsIdle] = useState(false);
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const logoRef = useRef<HTMLDivElement>(null);

   const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      setIsMouseOver(true);
      setIsIdle(false);

      // Get mouse position relative to the container
      if (containerRef.current) {
         const rect = containerRef.current.getBoundingClientRect();
         const x = e.clientX - rect.left;
         const y = e.clientY - rect.top;
         setMousePosition({ x, y });
      }

      // Clear existing timeout
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
      }

      // Set new timeout for idle detection
      timeoutRef.current = setTimeout(() => {
         setIsIdle(true);
      }, 250); // 0.25 second idle timeout
   }, []);

   // Calculate shadow offset based on logo's actual center
   const getShadowOffset = () => {
      if (!logoRef.current || !containerRef.current) return { x: 0, y: 0 };

      const logoRect = logoRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Get logo center relative to container
      const logoCenterX = logoRect.left + logoRect.width / 2 - containerRect.left;
      const logoCenterY = logoRect.top + logoRect.height / 2 - containerRect.top;

      // Calculate offset from logo center
      const offsetX = (mousePosition.x - logoCenterX) / 20;
      const offsetY = (mousePosition.y - logoCenterY) / 20;

      return { x: offsetX, y: offsetY };
   };

   // Calculate glow intensity based on distance from logo
   const getGlowIntensity = () => {
      if (!logoRef.current || !containerRef.current) return 1;

      const logoRect = logoRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Get logo center relative to container
      const logoCenterX = logoRect.left + logoRect.width / 2 - containerRect.left;
      const logoCenterY = logoRect.top + logoRect.height / 2 - containerRect.top;

      // Calculate distance from mouse to logo center
      const distance = Math.sqrt(
         Math.pow(mousePosition.x - logoCenterX, 2) + Math.pow(mousePosition.y - logoCenterY, 2)
      );

      // Dim the glow as mouse gets closer (max distance of 200px for full glow)
      const maxDistance = 200;
      const intensity = Math.min(distance / maxDistance, 1);

      return Math.max(intensity, 0.1); // Minimum 10% intensity
   };

   const handleMouseLeave = useCallback(() => {
      setIsMouseOver(false);
      setIsIdle(false);

      // Clear timeout when mouse leaves
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
         timeoutRef.current = null;
      }
   }, []);

   // Cleanup timeout on unmount
   React.useEffect(() => {
      return () => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
         }
      };
   }, []);

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
         <div
            className="absolute inset-0"
            style={{
               backgroundImage: `
                  linear-gradient(45deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%),
                  linear-gradient(45deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%),
                  linear-gradient(45deg, rgba(34, 197, 94, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%),
                  linear-gradient(-45deg, rgba(34, 197, 94, 0.02) 0%, rgba(59, 130, 246, 0.02) 100%)
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
            }}
         />

         {/* Mouse-following glow effect */}
         {isMouseOver && !isIdle && (
            <div
               className="absolute inset-0 pointer-events-none"
               style={{
                  background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
                     rgba(255, 255, 255, ${0.4 * getGlowIntensity()}) 0px, 
                     rgba(255, 255, 255, ${0.3 * getGlowIntensity()}) 80px, 
                     rgba(255, 255, 255, ${0.2 * getGlowIntensity()}) 160px, 
                     rgba(255, 255, 255, ${0.1 * getGlowIntensity()}) 240px, 
                     rgba(255, 255, 255, ${0.05 * getGlowIntensity()}) 320px, 
                     transparent 400px)`,
                  mixBlendMode: 'screen',
                  transition: 'background 0.1s ease-out',
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
                     'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none',
               }}
            />

            <div
               ref={logoRef}
               className="h-auto w-auto max-w-[300px] relative z-10"
               style={
                  {
                     filter:
                        isMouseOver && !isIdle
                           ? `drop-shadow(${getShadowOffset().x}px ${getShadowOffset().y}px 0px rgba(255, 0, 0, 1)) brightness(1)`
                           : 'brightness(0.7)',
                     WebkitFilter:
                        isMouseOver && !isIdle
                           ? `drop-shadow(${getShadowOffset().x}px ${getShadowOffset().y}px 0px rgba(255, 0, 0, 1)) brightness(1)`
                           : 'brightness(0.7)',
                     transition: 'filter 0.1s ease-out, -webkit-filter 0.1s ease-out',
                  } as React.CSSProperties
               }
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
