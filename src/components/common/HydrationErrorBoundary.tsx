'use client';

import React from 'react';

type Props = {
   children: React.ReactNode;
   fallback?: React.ReactNode;
};

type State = { hasError: boolean };

export class HydrationErrorBoundary extends React.Component<Props, State> {
   override state: State = { hasError: false };

   static getDerivedStateFromError(error: Error): State | null {
      // Be conservative: only flag known hydration-related errors/warnings
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('hydration') || msg.includes('text content does not match')) {
         return { hasError: true };
      }
      return null;
   }

   override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      if (process.env.NODE_ENV !== 'production') {
         console.warn('Hydration error captured:', error, errorInfo);
      }
   }

   override render() {
      if (this.state.hasError) {
         return this.props.fallback ?? null;
      }
      return this.props.children;
   }
}
