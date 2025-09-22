import React, { useEffect, useState } from 'react';

// Hook to ensure Vercel compatibility for layout features
export function useVercelCompatibility() {
  const [isClient, setIsClient] = useState(false);
  const [isVercelReady, setIsVercelReady] = useState(false);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Check for Vercel-specific optimizations
    const checkVercelReadiness = async () => {
      try {
        // Check if we're running on Vercel
        const isVercel = typeof window !== 'undefined' &&
          (window.location.hostname.includes('vercel.app') ||
           window.location.hostname.includes('heyspex.vercel.app'));

        // Basic compatibility checks
        const hasLocalStorage = typeof localStorage !== 'undefined';
        const hasSessionStorage = typeof sessionStorage !== 'undefined';

        // Web APIs we need for layout functionality
        const hasResizeObserver = typeof ResizeObserver !== 'undefined';
        const hasIntersectionObserver = typeof IntersectionObserver !== 'undefined';

        // Set readiness based on environment and available APIs
        setIsVercelReady(
          hasLocalStorage &&
          hasSessionStorage &&
          hasResizeObserver &&
          hasIntersectionObserver
        );

        // Log compatibility info for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('Vercel Compatibility Check:', {
            isVercel,
            hasLocalStorage,
            hasSessionStorage,
            hasResizeObserver,
            hasIntersectionObserver,
            isReady: isVercelReady,
          });
        }
      } catch (error) {
        console.warn('Vercel compatibility check failed:', error);
        setIsVercelReady(false);
      }
    };

    checkVercelReadiness();
  }, []);

  return {
    isClient,
    isVercelReady,
    isCompatible: isClient && isVercelReady,
  };
}

// Hook specifically for layout features
export function useLayoutCompatibility() {
  const { isCompatible, isVercelReady, isClient } = useVercelCompatibility();

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const layoutFeatures = {
    // Core layout features
    canUseResizablePanels: isCompatible,
    canPersistLayout: isCompatible && typeof localStorage !== 'undefined',

    // Advanced features
    canUseDragAndDrop: isCompatible && typeof DataTransfer !== 'undefined',
    canUseKeyboardShortcuts: isCompatible,
    canUseAnimations: isCompatible,

    // Vercel-specific optimizations
    shouldUseReducedMotion: !isVercelReady || prefersReducedMotion,
    shouldLazyLoadFeatures: !isClient, // Enable lazy loading during SSR
  };

  const compatibilityLevel: 'full' | 'basic' | 'none' =
    isVercelReady ? 'full' : isCompatible ? 'basic' : 'none';

  return {
    ...layoutFeatures,
    isReady: isCompatible,
    compatibilityLevel,
  };
}

// Utility function to conditionally render layout features
export function withLayoutFeature<T extends Record<string, any>>(
  featureName: string,
  Component: React.ComponentType<T>,
  fallbackComponent?: React.ComponentType<T>
) {
  return function WithLayoutFeatureComponent(props: T) {
    const { isReady, compatibilityLevel } = useLayoutCompatibility();

    // Show fallback during SSR or if not ready
    if (!isReady) {
      return fallbackComponent ? React.createElement(fallbackComponent, props) : null;
    }

    // Log feature usage for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Layout Feature "${featureName}" loaded with compatibility: ${compatibilityLevel}`);
    }

    return React.createElement(Component, props);
  };
}

// Performance monitoring for Vercel
export function useVercelPerformance() {
  const [metrics, setMetrics] = useState({
    layoutLoadTime: 0,
    hydrationComplete: false,
    firstContentfulPaint: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    // Measure layout load time
    const layoutStart = window.performance.now();

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({
            ...prev,
            firstContentfulPaint: entry.startTime,
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });

    // Mark hydration complete
    const timer = setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        layoutLoadTime: window.performance.now() - layoutStart,
        hydrationComplete: true,
      }));
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return metrics;
}







