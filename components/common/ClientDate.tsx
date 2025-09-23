'use client';

import React from 'react';
import { ClientOnly } from '@/components/common/ClientOnly';

type ClientDateProps = {
  date: Date | string | number;
  /** Intl.DateTimeFormat options, defaults to `{ dateStyle: 'medium' }` */
  options?: Intl.DateTimeFormatOptions;
  /** Fallback content while waiting for hydration */
  fallback?: React.ReactNode;
  /** Force a particular timeZone for deterministic output (e.g., 'UTC') */
  timeZone?: string;
};

/**
 * Renders a date string on the client to avoid SSR/CSR locale or timezone mismatches.
 */
export function ClientDate({ date, options, fallback = null, timeZone }: ClientDateProps) {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', ...(options || {}), timeZone });

  return (
    <ClientOnly fallback={fallback} suppressHydrationWarning>
      {fmt.format(d)}
    </ClientOnly>
  );
}

