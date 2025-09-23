'use client';

import React, { PropsWithChildren } from 'react';
import { useIsClient } from '@/hooks/use-is-client';

type SafeHydrateProps = PropsWithChildren<{
  /**
   * If true, render children only after client mount. Otherwise, render immediately
   * but suppress hydration warnings in the subtree.
   */
  clientOnly?: boolean;
  fallback?: React.ReactNode;
}>;

/**
 * A wrapper that either delays rendering until after mount or suppresses hydration warnings
 * to mitigate DOM mutations caused by browser extensions.
 */
export function SafeHydrate({ children, clientOnly = false, fallback = null }: SafeHydrateProps) {
  const isClient = useIsClient();

  if (clientOnly && !isClient) {
    return <div suppressHydrationWarning>{fallback}</div>;
  }

  return <div suppressHydrationWarning>{children}</div>;
}

