/**
 * Branded Component Configuration
 *
 * Centralized configuration for selecting between different branded component variants.
 * This allows switching between the full interactive component and simplified versions
 * via environment variables or runtime configuration.
 */

export type BrandedComponentVariant = 'full' | 'simple';

export interface BrandedComponentConfig {
   variant: BrandedComponentVariant;
   devMode: boolean;
   performanceMonitoring: boolean;
}

/**
 * Get the branded component configuration from environment variables
 */
export function getBrandedComponentConfig(): BrandedComponentConfig {
   const variant = (process.env.NEXT_PUBLIC_BRANDED_COMPONENT as BrandedComponentVariant) || 'full';
   const devMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
   const performanceMonitoring = process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true';

   console.log('🔍 Branded Component Config Debug:', {
      NEXT_PUBLIC_BRANDED_COMPONENT: process.env.NEXT_PUBLIC_BRANDED_COMPONENT,
      variant,
      devMode,
      performanceMonitoring,
      isServer: typeof window === 'undefined',
   });

   return {
      variant,
      devMode,
      performanceMonitoring,
   };
}

/**
 * Get the appropriate branded component based on configuration
 */
export function getBrandedComponentVariant(): BrandedComponentVariant {
   return getBrandedComponentConfig().variant;
}

/**
 * Check if we should use the simple branded component
 */
export function shouldUseSimpleBranded(): boolean {
   const result = getBrandedComponentVariant() === 'simple';
   console.log('🔍 shouldUseSimpleBranded called:', {
      variant: getBrandedComponentVariant(),
      result,
   });
   return result;
}

/**
 * Check if we should use the full branded component
 */
export function shouldUseFullBranded(): boolean {
   return getBrandedComponentVariant() === 'full';
}
