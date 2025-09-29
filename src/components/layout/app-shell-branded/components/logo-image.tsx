'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/lib/utils';

/**
 * LogoImage Component
 *
 * A reusable logo image component that provides consistent props interface
 * and eliminates duplication in the main AppShellBranded component.
 *
 * This component is used for both the black shadow base and the main logo
 * display, ensuring consistent image handling across the application.
 *
 * @component LogoImage
 * @param {LogoImageProps} props - Component props
 * @returns {JSX.Element} Optimized Next.js Image component
 */
export interface LogoImageProps {
   /** Image source path */
   src: string;
   /** Image width in pixels */
   width: number;
   /** Image height in pixels */
   height: number;
   /** Alt text for accessibility */
   alt: string;
   /** Additional CSS classes */
   className?: string;
   /** Whether to prioritize loading this image */
   priority?: boolean;
   /** Source set for responsive images */
   logoSrcSet?: string;
}

export const LogoImage = React.memo(function LogoImage({
   src,
   width,
   height,
   alt,
   className,
   priority = false,
   logoSrcSet,
}: LogoImageProps) {
   return (
      <Image
         src={src}
         alt={alt}
         width={width}
         height={height}
         className={cn('h-auto w-auto max-w-[300px]', className)}
         priority={priority}
         {...(logoSrcSet && { srcSet: logoSrcSet })}
      />
   );
});
