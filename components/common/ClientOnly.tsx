'use client';

import React from 'react';
import { useIsClient } from '@/hooks/use-is-client';

type ClientOnlyProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  suppressHydrationWarning?: boolean;
};

/**
 * Renders children only after mounting on the client to avoid hydration mismatches.
 */
export function ClientOnly({ children, fallback = null, suppressHydrationWarning }: ClientOnlyProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return suppressHydrationWarning ? (
      <div suppressHydrationWarning>{fallback}</div>
    ) : (
      <>{fallback}</>
    );
  }
  return <>{children}</>;
}

