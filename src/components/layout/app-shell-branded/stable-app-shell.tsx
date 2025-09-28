'use client';

import React from 'react';
import { AppShellBranded } from './app-shell-branded';
import { AppShellBrandedSimple } from './app-shell-branded-simple';
import { shouldUseSimpleBranded } from '@/src/lib/config/branded-component-config';

/**
 * Stable App Shell Component
 *
 * This component is designed to be completely isolated from the main layout
 * re-rendering issues. It manages its own state and doesn't depend on external
 * state that might cause re-renders.
 */
export function StableAppShell() {
   const [isClient, setIsClient] = React.useState(false);
   const [useSimple, setUseSimple] = React.useState(true);

   React.useEffect(() => {
      setIsClient(true);
      const shouldUseSimple = shouldUseSimpleBranded();
      setUseSimple(shouldUseSimple);
   }, []);

   // Always render simple component during SSR to avoid hydration mismatch
   if (!isClient) {
      return <AppShellBrandedSimple />;
   }

   // Use the full interactive component when client is ready
   return useSimple ? <AppShellBrandedSimple /> : <AppShellBranded />;
}
